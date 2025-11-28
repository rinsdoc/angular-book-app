import { InjectionToken } from '@angular/core';

import { Book } from './book';

export interface BookRepositoryPort {
  getBooks(): Promise<Book[]>;
  getBookById(id: string): Promise<Book | undefined>;
}

export const BOOK_REPOSITORY_PORT = new InjectionToken<BookRepositoryPort>('BookRepositoryPort');
