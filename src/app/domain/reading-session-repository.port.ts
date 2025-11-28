import { InjectionToken } from '@angular/core';
import { ReadingSession } from './reading-session';

export interface ReadingSessionRepositoryPort {
  getSessionsByUserId(userId: number): Promise<ReadingSession[]>;
  getSessionsByUserBookId(userBookId: number): Promise<ReadingSession[]>;
  addSession(session: Omit<ReadingSession, 'id'>): Promise<ReadingSession>;
}

export const READING_SESSION_REPOSITORY_PORT = new InjectionToken<ReadingSessionRepositoryPort>('ReadingSessionRepositoryPort');

