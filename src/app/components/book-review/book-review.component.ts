import { Component, Input, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { type Observable, catchError, map, of, tap } from "rxjs"

interface Review {
  id: number
  userBookId: number
  username: string
  rating: number
  reviewText: string
  date: string
  bookId: number
}

@Component({
  selector: "app-book-review",
  templateUrl: "./book-review.component.html",
  styleUrls: ["./book-review.component.css"],
  imports: [CommonModule],
})
export class BookReviewComponent implements OnInit {
  @Input() bookId!: number
  reviews: Review[] = []
  isLoading = true
  error: string | null = null
  private reviewsUrl = "/assets/reviews.json"

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.bookId) {
      this.loadReviews()
    }
  }

  loadReviews(): void {
    this.isLoading = true
    this.getReviewsForBook(this.bookId).subscribe({
      next: (reviews) => {
        this.reviews = reviews
        this.isLoading = false
      },
      error: (err) => {
        this.error = `Failed to load reviews. Error: ${err.message}`
        this.isLoading = false
        console.error("Error loading reviews:", err)
      },
    })
  }

  getReviewsForBook(bookId: number): Observable<Review[]> {
    return this.http.get<Review[]>(this.reviewsUrl).pipe(
      map((reviews) => reviews.filter((review) => review.bookId === bookId)),
      tap((reviews) => {}),
      catchError((err) => {
        console.error(`Error fetching reviews for book ${bookId}:`, err)
        return of([])
      }),
    )
  }

  getStarRating(rating: number): string {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }
}
