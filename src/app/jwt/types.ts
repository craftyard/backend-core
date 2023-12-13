import { Request } from 'express';
import { AnonymousUser, DomainUser } from 'rilata2/src/app/caller';

export type HTTPRequest = Request & { user: DomainUser | AnonymousUser };
