export interface UserBook {
  dateFinished?: string;
  dateStarted?: string;
  review?: string;
  rating?: number;
  status: 'currently-reading' | 'want-to-read' | 'read';
  bookId: string;
  userId: number;
  id: number;
}

