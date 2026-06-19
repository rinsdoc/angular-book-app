import { InjectionToken } from '@angular/core';
import { Review } from './review';

export interface ReviewRepositoryPort {
  getReviewsByBookId(bookId: number): Promise<Review[]>;
}

export const REVIEW_REPOSITORY_PORT = new InjectionToken<ReviewRepositoryPort>('ReviewRepositoryPort');
