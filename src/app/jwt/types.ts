import { Request } from 'express';
import { AnonymousUser, DomainUser } from 'rilata2/src/app/caller';

export type RequestCY = Request & { user: DomainUser | AnonymousUser };
