import { Injectable, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, tap, catchError, of, map } from "rxjs"

// Book interfaces
export interface Book {
  id: number
  title: string
  author: string
  cover: string
  description: string
  published: string
  genres: string[]
  pages: number
  avgRating: number
}

export interface UserBook {
  id: number
  userId: number
  bookId: number
  status: "want-to-read" | "currently-reading" | "read"
  rating?: number
  review?: string
  dateStarted?: string
  dateFinished?: string
}

@Injectable({
  providedIn: "root",
})
export class BookService {
  private apiUrl = "assets" // Path to the local assets directory

  // Signals for reactive state management
  books = signal<Book[]>([])
  userBooks = signal<UserBook[]>([])
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  constructor(private http: HttpClient) {
    this.loadInitialData()
  }

  private loadInitialData(): void {
    this.isLoading.set(true)
    this.getAllBooks().subscribe({
      next: (books) => {
        console.log("Books fetched successfully:", books) // Debug log
        this.books.set(books)
        this.isLoading.set(false)
      },
      error: (err) => {
        this.error.set("Failed to load books. Please try again later.")
        this.books.set([]) // Ensure books signal is cleared on error
        this.isLoading.set(false)
        console.error("Error loading books:", err)
      },
    })
  }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books.json`).pipe( // Adjusted to fetch books.json
      tap((books) => console.log("Fetched books from local JSON:", books)), // Debug log
      catchError((err) => {
        console.error("Error fetching books from local JSON:", err)
        return of([]) // Return an empty array on error
      }),
    )
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book[]>(`${this.apiUrl}/books.json`).pipe( // Fetch all books
      tap((books) => console.log("Fetched books for ID lookup:", books)), // Debug log
      map((books) => books.find((book) => book.id === id)!), // Find the book by ID
      catchError((err) => {
        console.error(`Error fetching book with id ${id} from local JSON:`, err)
        throw err
      }),
    )
  }

  getUserBooks(userId: number): Observable<UserBook[]> {
    this.isLoading.set(true)
    return this.http.get<UserBook[]>(`${this.apiUrl}/userBooks?userId=${userId}`).pipe(
      tap((userBooks) => {
        this.userBooks.set(userBooks)
        this.isLoading.set(false)
      }),
      catchError((err) => {
        this.error.set("Failed to load your library. Please try again later.")
        this.isLoading.set(false)
        console.error("Error fetching user books:", err)
        return of([])
      }),
    )
  }

  getUserBookDetails(userId: number): Observable<any[]> {
    this.isLoading.set(true)
    return this.http.get<any[]>(`${this.apiUrl}/userBooks?userId=${userId}&_expand=book`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set("Failed to load your library details. Please try again later.")
        this.isLoading.set(false)
        console.error("Error fetching user book details:", err)
        return of([])
      }),
    )
  }

  addBookToLibrary(userBook: Omit<UserBook, "id">): Observable<UserBook> {
    return this.http.post<UserBook>(`${this.apiUrl}/userBooks`, userBook).pipe(
      tap((newUserBook) => {
        // Update the signal with the new book
        this.userBooks.update((books) => [...books, newUserBook])
      }),
      catchError((err) => {
        this.error.set("Failed to add book to your library. Please try again.")
        console.error("Error adding book to library:", err)
        throw err
      }),
    )
  }

  updateBookStatus(id: number, status: UserBook["status"]): Observable<UserBook> {
    return this.http
      .patch<UserBook>(`${this.apiUrl}/userBooks/${id}`, {
        status,
      })
      .pipe(
        tap((updatedBook) => {
          // Update the signal with the updated book
          this.userBooks.update((books) => books.map((book) => (book.id === id ? { ...book, status } : book)))
        }),
        catchError((err) => {
          this.error.set("Failed to update book status. Please try again.")
          console.error("Error updating book status:", err)
          throw err
        }),
      )
  }

  addReview(id: number, rating: number, review: string): Observable<UserBook> {
    const update = {
      rating,
      review,
      dateFinished: new Date().toISOString().split("T")[0],
    }

    return this.http.patch<UserBook>(`${this.apiUrl}/userBooks/${id}`, update).pipe(
      tap((updatedBook) => {
        // Update the signal with the updated book
        this.userBooks.update((books) => books.map((book) => (book.id === id ? { ...book, ...update } : book)))
      }),
      catchError((err) => {
        this.error.set("Failed to save your review. Please try again.")
        console.error("Error adding review:", err)
        throw err
      }),
    )
  }

  // New method to search books
  searchBooks(query: string): Observable<Book[]> {
    if (!query.trim()) {
      return of(this.books())
    }

    const lowercaseQuery = query.toLowerCase()
    return of(
      this.books().filter(
        (book) =>
          book.title.toLowerCase().includes(lowercaseQuery) ||
          book.author.toLowerCase().includes(lowercaseQuery) ||
          book.genres.some((genre) => genre.toLowerCase().includes(lowercaseQuery)),
      ),
    )
  }

  // Clear error message
  clearError(): void {
    this.error.set(null)
  }
}

