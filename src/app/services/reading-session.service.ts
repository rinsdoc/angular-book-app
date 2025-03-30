import { Injectable, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, catchError, of, tap } from "rxjs"

export interface ReadingSession {
  id?: number
  userBookId: number
  date: string
  pagesRead: number
  minutes: number
  notes?: string
}

@Injectable({
  providedIn: "root",
})
export class ReadingSessionService {
  private apiUrl = "http://localhost:3000"

  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  constructor(private http: HttpClient) {}

  getSessionsByUserBookId(userBookId: number): Observable<ReadingSession[]> {
    this.isLoading.set(true)
    return this.http.get<ReadingSession[]>(`${this.apiUrl}/readingSessions?userBookId=${userBookId}`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set("Failed to load reading sessions. Please try again later.")
        this.isLoading.set(false)
        console.error("Error fetching reading sessions:", err)
        return of([])
      }),
    )
  }

  addSession(session: Omit<ReadingSession, "id">): Observable<ReadingSession> {
    this.isLoading.set(true)
    return this.http.post<ReadingSession>(`${this.apiUrl}/readingSessions`, session).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set("Failed to save reading session. Please try again.")
        this.isLoading.set(false)
        console.error("Error adding reading session:", err)
        throw err
      }),
    )
  }

  getUserReadingStats(userId: number): Observable<any> {
    this.isLoading.set(true)
    return this.http.get<any>(`${this.apiUrl}/readingSessions?userId=${userId}`).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err) => {
        this.error.set("Failed to load reading statistics. Please try again later.")
        this.isLoading.set(false)
        console.error("Error fetching reading stats:", err)
        return of({})
      }),
    )
  }

  clearError(): void {
    this.error.set(null)
  }
}

