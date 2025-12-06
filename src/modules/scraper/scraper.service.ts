import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SupremeConfig } from '@infrastructure/config/supreme.config';
import { JSDOM } from 'jsdom';
import {
  FoundItem,
  isFoundItemTypeGuard,
  validateFoundItem,
} from '../item/item.types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, retry, timeout, timer } from 'rxjs';
import { AxiosError } from 'axios';

// TODO: refactor this shit
@Injectable()
export class ScraperService {
  private itemCount = 0;
  private readonly logger = new Logger(ScraperService.name);

  constructor(
    private readonly supremeConfig: SupremeConfig,
    private readonly httpService: HttpService,
  ) {}

  public async getChangeLog(): Promise<string> {
    try {
      const observable = this.httpService.get<string>('').pipe(
        timeout(30000),
        retry({
          count: 10,
          delay: (error, retryCount) => {
            this.logger.warn(
              `Attempt for change log failed, (${retryCount}), error: ${(error as AxiosError).message}. Retrying...`,
            );
            return timer(2000);
          },
        }),
      );
      const response = await firstValueFrom(observable);
      return response.data;
    } catch (e) {
      this.logger.error(`Error while trying to get change log: \n${String(e)}`);
      throw new BadRequestException('Error while trying to get change log');
    }
  }

  public async getItems(): Promise<FoundItem[]> {
    const promises: Promise<FoundItem[]>[] = [];

    for (const page of this.supremeConfig.pages) {
      promises.push(this.getItemsFromPage(page));
    }

    try {
      const items = (await Promise.all(promises)).flat();
      this.logger.log(`Total potential items: ${this.itemCount}`);
      this.logger.log(`Total valid items: ${items.length}`);
      return items;
    } catch (e) {
      this.logger.error(`Error while trying to get items: \n${String(e)}`);
      throw new BadRequestException('Error while trying to get items');
    }
  }

  public async getItemsFromPage(page: string): Promise<FoundItem[]> {
    this.logger.log(`Getting items from page: ${page}`);

    const observable = this.httpService.get<string>(`/${page}`).pipe(
      timeout(30000),
      retry({
        count: 10,
        delay: (error, retryCount) => {
          this.logger.warn(
            `Attempt for ${page} failed, (${retryCount}), error: ${(error as AxiosError).message}. Retrying...`,
          );
          return timer(2000);
        },
      }),
    );
    const response = await firstValueFrom(observable);

    const html = response.data;

    const document = new JSDOM(html).window.document;
    const items = document.querySelectorAll('.itemcolumn');

    if (!items) {
      this.logger.error('Failed to make a jsdom query');
      throw new BadRequestException('Bad input data');
    }

    this.itemCount += items.length;

    const result: FoundItem[] = [];

    items.forEach((potentialItem) => {
      const otherProps = this.getOtherProps(potentialItem);
      const demandAndRarity = this.getDemandRarity(potentialItem);

      if (!(otherProps && demandAndRarity)) return;

      const item = { ...otherProps, ...demandAndRarity, type: page };

      if (isFoundItemTypeGuard(item)) {
        const validItem = validateFoundItem(item);
        if (validItem) result.push(validItem);
      }
    });

    this.logger.log(`Found ${result.length} valid items from ${page}`);
    return result;
  }

  private getOtherProps(elem: Element): Record<string, string> | null {
    const result: Record<string, string> = {};
    const matrixOfItems: string[][] = elem.textContent
      .split('\n')
      .map((x) => x.trim())
      .filter((y) => y != '' && y != '+1' && y != '-1' && y != '~')
      .map((z) => z.split(' - '));

    matrixOfItems.forEach((potentialItem) => {
      if (potentialItem.length == 1) {
        result['name'] = potentialItem[0];
        return;
      }

      if (potentialItem[0].toLowerCase() == 'ranged value') {
        if (potentialItem.length == 3) {
          result['rangedValue'] = `${potentialItem[1]} - ${potentialItem[2]}`;
        } else {
          result['rangedValue'] = potentialItem[1];
        }
        return;
      }

      if (potentialItem[0].toLowerCase() == 'last change in value') {
        result['lastChangeInValue'] = potentialItem[1].replace(/[()]/g, '');
        return;
      }

      if (potentialItem.length == 3) return;

      if (potentialItem[0].toLowerCase() == 'value') {
        const particles = potentialItem[1].split(' ');
        if (!isNaN(parseInt(particles[0]))) {
          result['value'] = particles[0];
          return;
        }
        result['value'] = potentialItem[1];
      }

      result[potentialItem[0].toLowerCase()] = potentialItem[1];
    });

    return result;
  }

  private getDemandRarity(
    elem: Element,
  ): { demand: string; rarity: string } | null {
    const sep = elem.querySelector('sep');

    if (!sep || !sep.previousElementSibling) return null;
    return {
      demand: sep.previousElementSibling.textContent,
      rarity:
        sep.childNodes[1].textContent! ||
        sep.childNodes[0].textContent!.split(' - ')[1],
    };
  }

  private prettifyData(data: string): string {
    const rows = data.split('\n');

    for (let i = 0; i < rows.length; i++) {
      if (rows[i] == 'N/A') {
        rows.splice(i - 1, 3);
        i -= 2;
        continue;
      }

      rows[i] = rows[i].trim();
    }

    return rows.join('\n');
  }
}
