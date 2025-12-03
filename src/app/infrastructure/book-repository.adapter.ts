import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Book } from '../domain/book';
import { BookRepositoryPort } from '../domain/book-repository.port';

@Injectable({ providedIn: 'root' })
export class BookRepositoryAdapter implements BookRepositoryPort {
  constructor(private http: HttpClient) {}

  async getBooks(): Promise<Book[]> {
    return firstValueFrom(this.http.get<Book[]>('/assets/books.json'));
  }

  async getBookById(id: string): Promise<Book | undefined> {
    const books = await this.getBooks();
    return books.find(b => b.id.toString() === id);
  }
}
