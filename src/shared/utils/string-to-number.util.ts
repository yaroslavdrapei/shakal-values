export function stringToNumber(str: string): number {
  const num = parseInt(str.replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
}
