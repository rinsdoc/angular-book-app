import { Component, Input, signal, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReviewService } from "../../application/review.service"
import { Review } from "../../domain/review"

@Component({
  selector: "app-book-review",
  templateUrl: "./book-review.component.html",
  styleUrls: ["./book-review.component.css"],
  imports: [CommonModule],
})
export class BookReviewComponent implements OnInit {
  @Input() bookId!: number
  reviews = signal<Review[]>([])
  isLoading = signal(true)
  error = signal<string | null>(null)

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    if (this.bookId) {
      this.loadReviews()
    }
  }

  loadReviews(): void {
    this.isLoading.set(true)
    this.reviewService
      .getReviewsByBookId(this.bookId)
      .then((reviews) => {
        this.reviews.set(reviews)
        this.isLoading.set(false)
      })
      .catch((err) => {
        this.error.set(`Failed to load reviews. Error: ${err.message}`)
        this.isLoading.set(false)
        console.error("Error loading reviews:", err)
      })
  }

  getStarRating(rating: number): string {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }
}
