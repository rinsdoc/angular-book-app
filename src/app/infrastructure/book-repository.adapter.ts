import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book } from '../domain/book';
import { BookRepositoryPort } from '../domain/book-repository.port';

@Injectable({ providedIn: 'root' })
export class BookRepositoryAdapter implements BookRepositoryPort {
  constructor(private http: HttpClient) {}

  getBooks(): Promise<Book[]> {
    return this.http.get<Book[]>('/assets/books.json').toPromise().then(books => books ?? []);
  }

  getBookById(id: string): Promise<Book | undefined> {
    return this.getBooks().then(books => books.find(b => b.id === id));
  }
}
