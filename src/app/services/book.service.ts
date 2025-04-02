import { Injectable, signal } from "@angular/core"
import type { HttpClient } from "@angular/common/http"
import { type Observable, tap, catchError, of, map, delay, switchMap } from "rxjs"

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
  private apiUrl = "/assets/books.json" // Path to the books.json file in assets
  private userBooksUrl = "/assets/user-books.json" // Path to the user-books.json file in assets

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
        this.error.set(`Failed to load books. Error: ${err.message}`)
        this.books.set([]) // Ensure books signal is cleared on error
        this.isLoading.set(false)
        console.error("Error loading books:", err)
      },
    })
  }

  getAllBooks(): Observable<Book[]> {
    console.log("Fetching books from:", this.apiUrl)
    return this.http.get<Book[]>(this.apiUrl).pipe(
      tap((books) => console.log("Fetched books:", books)),
      catchError((err) => {
        console.error("Error fetching books:", err)
        this.error.set(`Failed to load books from ${this.apiUrl}. Error: ${err.message}`)
        return of([])
      }),
    )
  }

  getBookById(id: number): Observable<Book | null> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      tap((books) => console.log("Fetched books for ID lookup:", books)),
      map((books) => books.find((book) => book.id === id) || null),
      catchError((err) => {
        console.error(`Error fetching book with id ${id}:`, err)
        this.error.set(`Failed to load book details. Error: ${err.message}`)
        return of(null)
      }),
    )
  }

  getUserBooks(userId: number): Observable<UserBook[]> {
    this.isLoading.set(true)
    console.log("Fetching user books from:", this.userBooksUrl)
    return this.http.get<UserBook[]>(this.userBooksUrl).pipe(
      map((userBooks) => userBooks.filter((book) => book.userId === userId)),
      tap((userBooks) => {
        console.log("Fetched user books:", userBooks)
        this.userBooks.set(userBooks)
        this.isLoading.set(false)
      }),
      catchError((err) => {
        this.error.set(`Failed to load your library. Error: ${err.message}`)
        this.isLoading.set(false)
        console.error("Error fetching user books:", err)
        return of([])
      }),
    )
  }

  getUserBookDetails(userId: number): Observable<any[]> {
    this.isLoading.set(true)
    console.log("Fetching user book details")
    return this.http.get<UserBook[]>(this.userBooksUrl).pipe(
      map((userBooks) => userBooks.filter((book) => book.userId === userId)),
      switchMap((userBooks) => {
        if (userBooks.length === 0) return of([])
        return this.http.get<Book[]>(this.apiUrl).pipe(
          map((books) => {
            return userBooks.map((userBook) => ({
              ...userBook,
              book: books.find((book) => book.id === userBook.bookId),
            }))
          }),
        )
      }),
      tap((books) => {
        console.log("Fetched user book details:", books)
        this.isLoading.set(false)
      }),
      catchError((err) => {
        this.error.set(`Failed to load your library details. Error: ${err.message}`)
        this.isLoading.set(false)
        console.error("Error fetching user book details:", err)
        return of([])
      }),
    )
  }

  addBookToLibrary(userBook: Omit<UserBook, "id">): Observable<UserBook> {
    const newUserBook: UserBook = {
      ...userBook,
      id: Math.floor(Math.random() * 10000),
    }

    return of(newUserBook).pipe(
      delay(500),
      tap((book) => {
        this.userBooks.update((books) => [...books, book])
      }),
      catchError((err) => {
        this.error.set("Failed to add book to your library. Please try again.")
        console.error("Error adding book to library:", err)
        throw err
      }),
    )
  }

  updateBookStatus(id: number, status: UserBook["status"]): Observable<UserBook> {
    return of({ id, status } as UserBook).pipe(
      delay(500),
      tap(() => {
        this.userBooks.update((books) => books.map((book) => (book.id === id ? { ...book, status } : book)))
      }),
      catchError((err) => {
        this.error.set("Failed to update book status. Please try again.")
        console.error("Error updating book status:", err)
        throw err
      }),
    )
  }

  addReview(id: number, rating: number, review: string): Observable<UserBook | null> {
    const update = {
      rating,
      review,
      dateFinished: new Date().toISOString().split("T")[0],
    }

    return of({ id, ...update } as UserBook).pipe(
      delay(500),
      tap(() => {
        this.userBooks.update((books) => books.map((book) => (book.id === id ? { ...book, ...update } : book)))
      }),
      catchError((err) => {
        this.error.set("Failed to save your review. Please try again.")
        console.error("Error adding review:", err)
        return of(null)
      }),
    )
  }

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

  clearError(): void {
    this.error.set(null)
  }
}
