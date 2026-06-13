import {ChangeDetectorRef, Component, OnInit} from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { BookService } from "../../application/book.service"
import { Book } from "../../domain/book"

@Component({
  selector: "app-book-list",
  templateUrl: "./book-list.component.html",
  imports: [CommonModule, RouterModule],
})
export class BookListComponent implements OnInit {
  books: Book[] = []
  filteredBooks: Book[] = []
  searchTerm = ""
  selectedGenre = ""
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
      this.filteredBooks = books
      const allGenres = books.flatMap((book) => book.genres)
      this.genres = [...new Set(allGenres)].sort()
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

  resetFilters(): void {
    this.searchTerm = ""
    this.selectedGenre = ""
    this.filteredBooks = this.books
  }

  private applyFilters(): void {
    this.filteredBooks = this.books.filter((book) => {
      const matchesSearch =
        this.searchTerm === "" ||
        book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase())

      const matchesGenre = this.selectedGenre === "" || book.genres.includes(this.selectedGenre)

      return matchesSearch && matchesGenre
    })
  }
}
