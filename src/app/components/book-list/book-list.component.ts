// book-list.component.ts
import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { BookService } from "../../services/book.service"
import { Book } from "../../services/book.service"

@Component({
  selector: "app-book-list",
  templateUrl: "./book-list.component.html",
  styleUrls: ["./book-list.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class BookListComponent implements OnInit {
  books: Book[] = []
  filteredBooks: Book[] = []
  searchTerm = ""
  selectedGenre = ""
  genres: string[] = []
  isLoading = true

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks()
  }

  loadBooks(): void {
    this.isLoading = true
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books
        this.filteredBooks = books

        // Extract unique genres for filter
        const allGenres = books.flatMap((book) => book.genres)
        this.genres = [...new Set(allGenres)].sort()

        this.isLoading = false
      },
      error: (err) => {
        console.error("Error loading books:", err)
        this.isLoading = false
      },
    })
  }

  searchBooks(): void {
    this.applyFilters()
  }

  filterByGenre(): void {
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

