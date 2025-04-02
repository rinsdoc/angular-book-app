import { Injectable, signal } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { type Observable, catchError, of, tap, map } from "rxjs"

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
  private apiUrl = "/assets/reading-sessions.json"
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  constructor(private http: HttpClient) {}

  getSessionsByUserBookId(userBookId: number): Observable<ReadingSession[]> {
    this.isLoading.set(true)
    console.log(`Fetching reading sessions for userBook ${userBookId} from ${this.apiUrl}`)

    return this.http.get<ReadingSession[]>(this.apiUrl).pipe(
      map((sessions) => sessions.filter((session) => session.userBookId === userBookId)),
      tap((sessions) => {
        console.log(`Found ${sessions.length} sessions for userBook ${userBookId}:`, sessions)
        this.isLoading.set(false)
      }),
      catchError((err) => {
        this.error.set(`Failed to load reading sessions. Error: ${err.message}`)
        this.isLoading.set(false)
        console.error("Error fetching reading sessions:", err)
        return of([])
      }),
    )
  }

  addSession(session: Omit<ReadingSession, "id">): Observable<ReadingSession> {
    this.isLoading.set(true)

    // Since we can't actually modify the JSON file in a real app scenario,
    // we'll simulate adding a session
    const newSession: ReadingSession = {
      ...session,
      id: Math.floor(Math.random() * 10000),
    }

    // In a real app, this would be an HTTP POST request
    return of(newSession).pipe(
      tap(() => {
        console.log("Added new reading session:", newSession)
        this.isLoading.set(false)
      }),
      catchError((err) => {
        this.error.set(`Failed to save reading session. Error: ${err.message}`)
        this.isLoading.set(false)
        console.error("Error adding reading session:", err)
        throw err
      }),
    )
  }

  getUserReadingStats(userId: number): Observable<any> {
    this.isLoading.set(true)
    console.log(`Fetching reading stats for user ${userId}`)

    // In a real app, this would be a dedicated endpoint
    // Here we'll calculate stats from the sessions data
    return this.http.get<ReadingSession[]>(this.apiUrl).pipe(
      map((sessions) => {
        // Calculate some basic stats
        const totalPagesRead = sessions.reduce((sum, session) => sum + session.pagesRead, 0)
        const totalReadingTime = sessions.reduce((sum, session) => sum + session.minutes, 0)
        const totalSessions = sessions.length

        return {
          totalSessions,
          totalPagesRead,
          totalReadingTime,
          averagePagesPerSession: totalSessions ? Math.round(totalPagesRead / totalSessions) : 0,
          averageTimePerSession: totalSessions ? Math.round(totalReadingTime / totalSessions) : 0,
        }
      }),
      tap((stats) => {
        console.log("Calculated reading stats:", stats)
        this.isLoading.set(false)
      }),
      catchError((err) => {
        this.error.set(`Failed to load reading statistics. Error: ${err.message}`)
        this.isLoading.set(false)
        console.error("Error calculating reading stats:", err)
        return of({})
      }),
    )
  }

  clearError(): void {
    this.error.set(null)
  }
}

