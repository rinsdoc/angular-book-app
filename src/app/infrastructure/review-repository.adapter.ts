import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {Review} from '../domain/review';
import {ReviewRepositoryPort} from '../domain/review-repository.port';

@Injectable({ providedIn: 'root' })
export class ReviewRepositoryAdapter implements ReviewRepositoryPort {
  constructor(private http: HttpClient) {}

  async getReviewsByBookId(bookId: number): Promise<Review[]> {
    const allReviews = await firstValueFrom(this.http.get<Review[]>('/assets/reviews.json'));
    return allReviews.filter(r => r.bookId === bookId);
  }
}
