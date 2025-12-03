import { Injectable, inject, signal } from "@angular/core"
import { ReadingSession } from '../domain/reading-session';
import { ReadingSessionRepositoryPort, READING_SESSION_REPOSITORY_PORT } from '../domain/reading-session-repository.port';
import { BookService } from "../application/book.service";
import { Book } from "../domain/book";
import { UserBook } from "../domain/user-book";

export interface UserReadingStats {
  totalBooksRead: number;
  pagesReadThisYear: number;
  readingTimeThisYear: number;
  genreDistribution: { name: string; value: number }[];
  monthlyProgress: { month: string; books: number; pages: number }[];
}

@Injectable({
  providedIn: "root",
})
export class ReadingSessionService {
  private repository = inject(READING_SESSION_REPOSITORY_PORT);
  isLoading = signal<boolean>(false)
  error = signal<string | null>(null)

  getSessionsByUserBookId(userBookId: number): Promise<ReadingSession[]> {
    this.isLoading.set(true);
    return this.repository.getSessionsByUserBookId(userBookId)
      .then(sessions => {
        this.isLoading.set(false);
        return sessions;
      })
      .catch(err => {
        this.error.set(`Failed to load reading sessions. Error: ${err.message}`);
        this.isLoading.set(false);
        return [];
      });
  }

  getSessionsByUserId(userId: number): Promise<ReadingSession[]> {
    this.isLoading.set(true);
    return this.repository.getSessionsByUserId(userId)
      .then(sessions => {
        this.isLoading.set(false);
        return sessions;
      })
      .catch(err => {
        this.error.set(`Failed to load reading sessions. Error: ${err.message}`);
        this.isLoading.set(false);
        return [];
      });
  }

  addSession(session: Omit<ReadingSession, "id">): Promise<ReadingSession> {
    this.isLoading.set(true);
    return this.repository.addSession(session)
      .then(newSession => {
        this.isLoading.set(false);
        return newSession;
      })
      .catch(err => {
        this.error.set(`Failed to save reading session. Error: ${err.message}`);
        this.isLoading.set(false);
        throw err;
      });
  }

  async getUserReadingStats(userId: number, bookService: BookService): Promise<UserReadingStats> {
    const books: Book[] = await bookService.getBooks();
    const userBooks: UserBook[] = await bookService.getUserBooks(userId);
    const sessions: ReadingSession[] = await this.getSessionsByUserId(userId);

    const totalBooksRead = userBooks.filter((ub) => ub.status === "read").length;
    const readBookIds = userBooks.filter((ub) => ub.status === "read").map((ub) => ub.bookId);
    const readBooks = books.filter((book) => readBookIds.includes(book.id));

    // Géneros
    const genreCounts: { [key: string]: number } = {};
    readBooks.forEach((book) => {
      book.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    const genreDistribution = Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Páginas y tiempo
    const year = new Date().getFullYear().toString();
    const readSessionsThisYear = sessions.filter((s) => {
      const userBookId = s.userBookId;
      const matchingUserBook = userBooks.find((ub) => ub.id === userBookId);
      return matchingUserBook && s.date.startsWith(year);
    });
    const pagesReadThisYear = readSessionsThisYear.reduce((sum, s) => sum + s.pagesRead, 0);
    const readingTimeThisYear = readSessionsThisYear.reduce((sum, s) => sum + s.minutes, 0);

    // Progreso mensual
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyProgress = months.map((month) => ({ month, books: 0, pages: 0 }));
    readSessionsThisYear.forEach((session) => {
      const monthIndex = new Date(session.date).getMonth();
      monthlyProgress[monthIndex].pages += session.pagesRead;
    });
    userBooks
      .filter((ub) => ub.dateFinished && ub.dateFinished.startsWith(year))
      .forEach((ub) => {
        const monthIndex = new Date(ub.dateFinished!).getMonth();
        monthlyProgress[monthIndex].books += 1;
      });

    return {
      totalBooksRead,
      pagesReadThisYear,
      readingTimeThisYear,
      genreDistribution,
      monthlyProgress,
    };
  }
}
