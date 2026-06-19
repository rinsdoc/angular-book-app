import { Inject, Injectable } from '@angular/core';
import { Review } from '../domain/review';
import { ReviewRepositoryPort, REVIEW_REPOSITORY_PORT } from '../domain/review-repository.port';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(
    @Inject(REVIEW_REPOSITORY_PORT) private reviewRepository: ReviewRepositoryPort
  ) {}

  getReviewsByBookId(bookId: number): Promise<Review[]> {
    return this.reviewRepository.getReviewsByBookId(bookId);
  }
}
