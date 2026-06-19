import {ChangeDetectorRef, Component, OnInit} from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { BookService } from "../../application/book.service"
import { Book } from "../../domain/book"

type SortKey = "rating" | "title" | "pages"

@Component({
  selector: "app-book-list",
  templateUrl: "./book-list.component.html",
  imports: [CommonModule, RouterModule],
})
export class BookListComponent implements OnInit {
  books: Book[] = []
  filteredBooks: Book[] = []
  featuredBook: Book | null = null
  searchTerm = ""
  selectedGenre = ""
  sortBy: SortKey = "rating"
  genres: string[] = []
  isLoading = true

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBooks()
  }

  async loadBooks(): Promise<void> {
    this.isLoading = true
    this.cdr.detectChanges()
    try {
      const books = await this.bookService.getBooks()
      this.books = books
      this.featuredBook = [...books].sort((a, b) => b.avgRating - a.avgRating)[0] ?? null
      const allGenres = books.flatMap((book) => book.genres)
      this.genres = [...new Set(allGenres)].sort()
      this.applyFilters()
    } catch (err) {
      console.error("Error loading books:", err)
    } finally {
      this.isLoading = false
      this.cdr.detectChanges()
    }
  }

  onSearchInput(value: string): void {
    this.searchTerm = value
    this.applyFilters()
  }

  onGenreChange(value: string): void {
    this.selectedGenre = value
    this.applyFilters()
  }

  onSortChange(value: string): void {
    this.sortBy = value as SortKey
    this.applyFilters()
  }

  resetFilters(): void {
    this.searchTerm = ""
    this.selectedGenre = ""
    this.sortBy = "rating"
    this.applyFilters()
  }

  // Show the featured highlight only when the user isn't actively filtering
  get showFeatured(): boolean {
    return !this.searchTerm && !this.selectedGenre
  }

  // The grid excludes the featured book while the highlight is on screen
  get gridBooks(): Book[] {
    if (this.showFeatured && this.featuredBook) {
      return this.filteredBooks.filter((book) => book.id !== this.featuredBook!.id)
    }
    return this.filteredBooks
  }

  private applyFilters(): void {
    const filtered = this.books.filter((book) => {
      const matchesSearch =
        this.searchTerm === "" ||
        book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase())

      const matchesGenre = this.selectedGenre === "" || book.genres.includes(this.selectedGenre)

      return matchesSearch && matchesGenre
    })

    this.filteredBooks = this.sortBooks(filtered)
  }

  private sortBooks(books: Book[]): Book[] {
    const sorted = [...books]
    switch (this.sortBy) {
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case "pages":
        return sorted.sort((a, b) => b.pages - a.pages)
      default:
        return sorted.sort((a, b) => b.avgRating - a.avgRating)
    }
  }
}
