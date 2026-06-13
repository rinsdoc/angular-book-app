// book-detail.component.ts
import {ChangeDetectorRef, Component, OnInit} from "@angular/core"
import {CommonModule} from "@angular/common"
import {ActivatedRoute, Router, RouterModule} from "@angular/router"
import {Book} from "../../domain/book"
import {BookService} from "../../application/book.service"
import {ReadingSession} from '../../domain/reading-session';
import {ReadingSessionService} from "../../application/reading-session.service"
import {BookReviewComponent} from "../book-review/book-review.component"
import {UserBook} from '../../domain/user-book';

@Component({
  selector: "app-book-detail",
  templateUrl: "./book-detail.component.html",
  imports: [CommonModule, RouterModule, BookReviewComponent],
})
export class BookDetailComponent implements OnInit {
  bookId = ""
  book: Book | null = null
  userBook: UserBook | null = null;
  currentUserId = 1 // Hard-coded for demo
  userRating = 0
  userReview = ""
  isLoading = true

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
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get("id")
      if (id) {
        this.bookId = id
        this.loadBookDetails()
      }
    })
  }

  async loadBookDetails(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      this.book = await this.bookService.getBookById(this.bookId) || null;
      const userBooks = await this.bookService.getUserBooks(this.currentUserId);
      const userBook = userBooks.find((ub) => ub.bookId.toString() === this.bookId);
      if (userBook) {
        this.userBook = userBook;
        this.userRating = userBook.rating || 0;
        this.userReview = userBook.review || "";
      }
    } catch (err) {
      console.error("Error loading book details:", err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onStatusChange(status: string): void {
    this.updateBookStatus(status as UserBook["status"])
  }

  async updateBookStatus(status: UserBook["status"]): Promise<void> {
    if (this.userBook) {
      this.userBook = await this.bookService.updateBookStatus(this.userBook.id, status);
    } else if (this.book) {
      const newUserBook = {
        userId: this.currentUserId,
        bookId: this.book.id,
        status: status,
        dateStarted: status === "currently-reading" ? new Date().toISOString().split("T")[0] : undefined,
      };
      this.userBook = await this.bookService.addBookToLibrary(newUserBook);
    }
    this.cdr.detectChanges();
  }

  async submitReview(): Promise<void> {
    if (this.userBook && this.userRating > 0) {
      this.userBook = await this.bookService.addReview(this.userBook.id, this.userRating, this.userReview);
      this.cdr.detectChanges();
    }
  }

  setRating(rating: number): void {
    this.userRating = rating
  }

  goBack(): void {
    this.router.navigate(["/discover"])
  }

  // Helper to expose numeric book id to child components
  get bookIdNumber(): number {
    if (!this.book) return 0;
    const id: any = (this.book as any).id;
    return typeof id === 'string' ? parseInt(id, 10) || 0 : id || 0;
  }

  // Progress tracking methods
  openProgressTracker(): void {
    this.progressTrackerOpen = true;
    if (this.userBook) {
      this.readingSessionService.getSessionsByUserBookId(this.userBook.id).then((sessions: ReadingSession[]) => {
        if (sessions.length > 0) {
          const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
        } else {
          this.currentPage = 0;
        }
        this.cdr.detectChanges();
      });
    }
  }

  closeProgressTracker(): void {
    this.progressTrackerOpen = false
    this.minutesRead = 0
    this.readingNotes = ""
  }

  async saveReadingProgress(): Promise<void> {
    if (!this.userBook || !this.book) {
      return;
    }

    if (this.currentPage <= 0 || this.minutesRead <= 0) {
      this.readingSessionService.error.set("Please enter valid page count and reading time.");
      return;
    }

    if (this.currentPage > this.book.pages) {
      this.readingSessionService.error.set(`This book only has ${this.book.pages} pages.`);
      return;
    }

    const newSession: Omit<ReadingSession, "id"> = {
      userBookId: this.userBook.id,
      date: new Date().toISOString().split("T")[0],
      pagesRead: this.currentPage,
      minutes: this.minutesRead,
      notes: this.readingNotes || undefined,
    };

    try {
      await this.readingSessionService.addSession(newSession);

      // If the user reached the end of the book, mark it as finished
      if (this.currentPage === this.book.pages) {
        this.userBook.dateFinished = new Date().toISOString().split("T")[0];
        this.userBook.status = "read";
        // Update repository via application BookService (returns a Promise)
        try {
          await this.bookService.updateBookStatus(this.userBook.id, "read");
        } catch (e) {
          // non-fatal: keep UI updated but log the error
          console.error("Failed to update user book status after finishing:", e);
        }
      }

      // Reset tracker UI
      this.minutesRead = 0;
      this.readingNotes = "";
      this.progressTrackerOpen = false;
      this.cdr.detectChanges();
    } catch (err) {
      this.readingSessionService.error.set("Failed to save reading session. Please try again.");
      console.error("Error saving reading session:", err);
    }
  }
}
