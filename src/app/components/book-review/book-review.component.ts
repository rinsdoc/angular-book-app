import { Component, Input, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"

interface Review {
  id: number
  userBookId: number
  username: string
  rating: number
  reviewText: string
  date: string
}

@Component({
  selector: "app-book-review",
  templateUrl: "./book-review.component.html",
  styleUrls: ["./book-review.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class BookReviewComponent implements OnInit {
  @Input() bookId!: number
  reviews: Review[] = []
  isLoading = true
  error: string | null = null

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
        this.error = "Failed to load reviews. Please try again later."
        this.isLoading = false
        console.error("Error loading reviews:", err)
      },
    })
  }

  getReviewsForBook(bookId: number): Observable<Review[]> {
    // In a real app, this would be a proper API call
    // For this demo, we'll simulate it with a local endpoint
    return this.http.get<Review[]>(`http://localhost:3000/reviews?bookId=${bookId}`)
  }

  getStarRating(rating: number): string {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }
}

