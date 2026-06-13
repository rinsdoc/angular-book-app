import {ChangeDetectorRef, Component, OnInit} from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { BookService } from "../../application/book.service"
import { UserBook } from "../../domain/user-book"
import { Book } from "../../domain/book"

@Component({
  selector: "app-user-library",
  templateUrl: "./user-library.component.html",
  imports: [CommonModule, RouterModule],
})
export class UserLibraryComponent implements OnInit {
  userBooks: UserBook[] = []
  filteredBooks: UserBook[] = []
  books: Book[] = []
  currentUserId = 1
  activeTab: "all" | "reading" | "toRead" | "read" = "all"
  isLoading = true

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserBooks()
  }

  async loadUserBooks(): Promise<void> {
    this.isLoading = true
    this.cdr.detectChanges()
    try {
      this.userBooks = await this.bookService.getUserBooks(this.currentUserId)
      this.books = await this.bookService.getBooks()
      this.filterByTab(this.activeTab)
    } catch (err) {
      console.error("Error loading user books:", err)
    } finally {
      this.isLoading = false
      this.cdr.detectChanges()
    }
  }

  filterByTab(tab: "all" | "reading" | "toRead" | "read"): void {
    this.activeTab = tab

    switch (tab) {
      case "reading":
        this.filteredBooks = this.userBooks.filter((book) => book.status === "currently-reading")
        break
      case "toRead":
        this.filteredBooks = this.userBooks.filter((book) => book.status === "want-to-read")
        break
      case "read":
        this.filteredBooks = this.userBooks.filter((book) => book.status === "read")
        break
      default:
        this.filteredBooks = this.userBooks
    }
  }

  async updateStatus(userBookId: number, newStatus: string): Promise<void> {
    const updated = await this.bookService.updateBookStatus(userBookId, newStatus as UserBook["status"])
    const bookIndex = this.userBooks.findIndex((b) => b.id === userBookId)
    if (bookIndex !== -1) {
      this.userBooks[bookIndex].status = updated.status
      this.filterByTab(this.activeTab)
      this.cdr.detectChanges()
    }
  }

  getBookDetails(userBook: UserBook): Book | undefined {
    return this.books.find((book) => book.id.toString() === userBook.bookId.toString())
  }
}
