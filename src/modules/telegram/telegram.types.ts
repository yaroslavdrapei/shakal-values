import { Context, NarrowedContext } from 'telegraf';
import { Message, Update, User } from 'telegraf/typings/core/types/typegram';

export type PhotoContext = NarrowedContext<
  Context,
  Update.MessageUpdate<Message.PhotoMessage>
>;

export type UserContext = Context & {
  from: User;
  message: Message.TextMessage;
};
