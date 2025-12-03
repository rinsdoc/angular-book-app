// book-detail.component.ts
import {ChangeDetectorRef, Component, OnInit} from "@angular/core"
import {CommonModule} from "@angular/common"
import {FormsModule} from "@angular/forms"
import {ActivatedRoute, Router, RouterModule} from "@angular/router"
import {Book} from "../../domain/book"
import {BookService} from "../../application/book.service"
import {ReadingSession} from '../../domain/reading-session';
import {ReadingSessionService} from "../../services/reading-session.service"
import {BookReviewComponent} from "../book-review/book-review.component"
import {UserBook} from '../../domain/user-book';

@Component({
  selector: "app-book-detail",
  templateUrl: "./book-detail.component.html",
  styleUrls: ["./book-detail.component.css"],
  imports: [CommonModule, FormsModule, RouterModule, BookReviewComponent],
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
  ) {}

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
    console.log('Loading book details for ID:', this.bookId);
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

  // Progress tracking methods
  openProgressTracker(): void {
    this.progressTrackerOpen = true;
    if (this.userBook) {
      this.readingSessionService.getSessionsByUserBookId(this.userBook.id).then((sessions: ReadingSession[]) => {
        if (sessions.length > 0) {
          const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const lastSession = sortedSessions[0];
          this.currentPage = sessions.reduce((sum, session) => sum + session.pagesRead, 0);
        } else {
          this.currentPage = 0;
        }
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
      notes: this.readingNotes,
    };
    try {
      await this.readingSessionService.addSession(newSession);
      if (this.book && this.currentPage >= this.book.pages) {
        await this.updateBookStatus("read");
      }
      this.closeProgressTracker();
    } catch (err) {
      // Error is manejado por el servicio
    }
  }

  get bookIdNumber(): number {
    return typeof this.book?.id === 'string' ? parseInt(this.book.id, 10) : (this.book?.id ?? 0);
  }
}
