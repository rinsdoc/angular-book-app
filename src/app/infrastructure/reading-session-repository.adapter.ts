import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {ReadingSession} from '../domain/reading-session';
import {ReadingSessionRepositoryPort} from '../domain/reading-session-repository.port';

@Injectable({ providedIn: 'root' })
export class ReadingSessionRepositoryAdapter implements ReadingSessionRepositoryPort {
  constructor(private http: HttpClient) {}

  async getSessionsByUserId(userId: number): Promise<ReadingSession[]> {
    // Obtener los libros del usuario
    const userBooks = await firstValueFrom(this.http.get<any[]>('/assets/user-books.json'));
    const userBookIds = userBooks.filter(ub => ub.userId === userId).map(ub => ub.id);

    // Obtener las sesiones que pertenecen a los libros del usuario
    const allSessions = await firstValueFrom(this.http.get<ReadingSession[]>('/assets/reading-sessions.json'));
    return allSessions.filter(s => userBookIds.includes(s.userBookId));
  }

  async getSessionsByUserBookId(userBookId: number): Promise<ReadingSession[]> {
    const allSessions = await firstValueFrom(this.http.get<ReadingSession[]>('/assets/reading-sessions.json'));
    return allSessions.filter(s => s.userBookId === userBookId);
  }

  async addSession(session: Omit<ReadingSession, 'id'>): Promise<ReadingSession> {
    // Simulación: crear nuevo ReadingSession
    return {...session, id: Math.floor(Math.random() * 100000)};
  }
}

