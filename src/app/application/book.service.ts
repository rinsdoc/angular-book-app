import { Inject, Injectable } from '@angular/core';
import { Book } from '../domain/book';
import { BookRepositoryPort, BOOK_REPOSITORY_PORT } from '../domain/book-repository.port';
import { UserBookRepositoryPort, USER_BOOK_REPOSITORY_PORT } from '../domain/user-book-repository.port';
import { UserBook } from '../domain/user-book';

@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(
    @Inject(BOOK_REPOSITORY_PORT) private bookRepository: BookRepositoryPort,
    @Inject(USER_BOOK_REPOSITORY_PORT) private userBookRepository: UserBookRepositoryPort
  ) {}

  getBooks(): Promise<Book[]> {
    return this.bookRepository.getBooks();
  }

  getBookById(id: string): Promise<Book | undefined> {
    return this.bookRepository.getBookById(id);
  }

  getUserBooks(userId: number): Promise<UserBook[]> {
    return this.userBookRepository.getUserBooks(userId);
  }

  updateBookStatus(userBookId: number, status: UserBook['status']): Promise<UserBook> {
    return this.userBookRepository.updateBookStatus(userBookId, status);
  }

  addBookToLibrary(userBook: Omit<UserBook, 'id'>): Promise<UserBook> {
    return this.userBookRepository.addBookToLibrary(userBook);
  }

  addReview(userBookId: number, rating: number, review: string): Promise<UserBook> {
    return this.userBookRepository.addReview(userBookId, rating, review);
  }
}
