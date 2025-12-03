import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {UserBook} from '../domain/user-book';
import {UserBookRepositoryPort} from '../domain/user-book-repository.port';

@Injectable({ providedIn: 'root' })
export class UserBookRepositoryAdapter implements UserBookRepositoryPort {
  constructor(private http: HttpClient) {}

  async getUserBooks(userId: number): Promise<UserBook[]> {
    const allUserBooks = await firstValueFrom(this.http.get<UserBook[]>('/assets/user-books.json'));
    return allUserBooks.filter(ub => ub.userId === userId);
  }

  async updateBookStatus(userBookId: number, status: UserBook['status']): Promise<UserBook> {
    // Simulación: buscar y actualizar en memoria
    const allUserBooks = await firstValueFrom(this.http.get<UserBook[]>('/assets/user-books.json'));
    const userBook = allUserBooks.find(ub => ub.id === userBookId);
    if (userBook) {
      userBook.status = status;
      return userBook;
    }
    throw new Error('UserBook not found');
  }

  async addBookToLibrary(userBook: Omit<UserBook, 'id'>): Promise<UserBook> {
    // Simulación: crear nuevo UserBook
    return {...userBook, id: Math.floor(Math.random() * 100000)};
  }

  async addReview(userBookId: number, rating: number, review: string): Promise<UserBook> {
    const allUserBooks = await firstValueFrom(this.http.get<UserBook[]>('/assets/user-books.json'));
    const userBook = allUserBooks.find(ub => ub.id === userBookId);
    if (userBook) {
      userBook.rating = rating;
      userBook.review = review;
      return userBook;
    }
    throw new Error('UserBook not found');
  }
}

