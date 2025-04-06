// book-detail.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterModule } from "@angular/router"
import { Book, BookService, UserBook } from "../../services/book.service"
import { ReadingSession, ReadingSessionService } from "../../services/reading-session.service"
import { BookReviewComponent } from "../book-review/book-review.component"

@Component({
  selector: "app-book-detail",
  templateUrl: "./book-detail.component.html",
  styleUrls: ["./book-detail.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BookReviewComponent],
})
export class BookDetailComponent implements OnInit {
  bookId = 0
  book: Book | null = null
  userBook: UserBook | null = null
  currentUserId = 1 // Hard-coded for demo
  userRating = 0
  userReview = ""

  // Progress tracking
  progressTrackerOpen = false
  currentPage = 0
  minutesRead = 0
  readingNotes = ""

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private readingSessionService: ReadingSessionService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (id) {
        this.bookId = +id
        this.loadBookDetails()
      }
    })
  }

  loadBookDetails(): void {
    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book
        console.log("Book loaded:", book) // Debug log
      },
      error: (err) => {
        console.error("Error loading book:", err)
      },
    })

    this.bookService.getUserBooks(this.currentUserId).subscribe({
      next: (userBooks) => {
        const userBook = userBooks.find((ub) => ub.bookId === this.bookId)
        if (userBook) {
          this.userBook = userBook
          this.userRating = userBook.rating || 0
          this.userReview = userBook.review || ""
        }
      },
      error: (err) => {
        console.error("Error loading user books:", err)
      },
    })
  }

  updateBookStatus(status: UserBook["status"]): void {
    if (this.userBook) {
      this.bookService.updateBookStatus(this.userBook.id, status).subscribe((updated) => {
        this.userBook = updated
      })
    } else if (this.book) {
      const newUserBook = {
        userId: this.currentUserId,
        bookId: this.book.id,
        status: status,
        dateStarted: status === "currently-reading" ? new Date().toISOString().split("T")[0] : undefined,
      }

      this.bookService.addBookToLibrary(newUserBook).subscribe((created) => {
        this.userBook = created
      })
    }
  }

  submitReview(): void {
    if (this.userBook && this.userRating > 0) {
      this.bookService.addReview(this.userBook.id, this.userRating, this.userReview).subscribe((updated) => {
        this.userBook = updated
      })
    }
  }

  setRating(rating: number): void {
    this.userRating = rating
  }

  goBack(): void {
    this.router.navigate(["/discover"])
  }

  // Progress tracking methods
  openProgressTracker(): void {
    this.progressTrackerOpen = true

    // If we have a userBook, load the last reading session to get current page
    if (this.userBook) {
      this.readingSessionService.getSessionsByUserBookId(this.userBook.id).subscribe((sessions) => {
        if (sessions.length > 0) {
          // Sort sessions by date (descending) and get the most recent
          const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          const lastSession = sortedSessions[0]
          // Calculate current page based on pages read in all sessions
          const totalPagesRead = sessions.reduce((sum, session) => sum + session.pagesRead, 0)
          this.currentPage = totalPagesRead
        } else {
          this.currentPage = 0
        }
      })
    }
  }

  closeProgressTracker(): void {
    this.progressTrackerOpen = false
    this.minutesRead = 0
    this.readingNotes = ""
  }

  saveReadingProgress(): void {
    if (!this.userBook || !this.book) {
      return
    }

    // Validate input
    if (this.currentPage <= 0 || this.minutesRead <= 0) {
      this.readingSessionService.error.set("Please enter valid page count and reading time.")
      return
    }

    if (this.currentPage > this.book.pages) {
      this.readingSessionService.error.set(`This book only has ${this.book.pages} pages.`)
      return
    }

    // Create new reading session
    const newSession: Omit<ReadingSession, "id"> = {
      userBookId: this.userBook.id,
      date: new Date().toISOString().split("T")[0],
      pagesRead: this.currentPage,
      minutes: this.minutesRead,
      notes: this.readingNotes,
    }

    this.readingSessionService.addSession(newSession).subscribe({
      next: () => {
        // If user has finished the book, update status
        if (this.book && this.currentPage >= this.book.pages) {
          this.updateBookStatus("read")
        }

        this.closeProgressTracker()
      },
      error: () => {
        // Error is handled by the service
      },
    })
  }
}

