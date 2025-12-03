import { InjectionToken } from '@angular/core';
import { UserBook } from './user-book';

export interface UserBookRepositoryPort {
  getUserBooks(userId: number): Promise<UserBook[]>;
  updateBookStatus(userBookId: number, status: UserBook['status']): Promise<UserBook>;
  addBookToLibrary(userBook: Omit<UserBook, 'id'>): Promise<UserBook>;
  addReview(userBookId: number, rating: number, review: string): Promise<UserBook>;
}

export const USER_BOOK_REPOSITORY_PORT = new InjectionToken<UserBookRepositoryPort>('UserBookRepositoryPort');

