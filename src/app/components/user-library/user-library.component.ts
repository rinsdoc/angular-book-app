// user-library.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookService, UserBook } from '../../services/book.service';

interface UserBookWithDetails extends UserBook {
  book?: any; // Would be proper Book type in real implementation
}

@Component({
  selector: 'app-user-library',
  templateUrl: './user-library.component.html',
  styleUrls: ['./user-library.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class UserLibraryComponent implements OnInit {
  userBooks: UserBookWithDetails[] = [];
  filteredBooks: UserBookWithDetails[] = [];
  currentUserId = 1; // Hard-coded for demo
  activeTab: 'all' | 'reading' | 'toRead' | 'read' = 'all';

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadUserBooks();
  }

  loadUserBooks(): void {
    this.bookService.getUserBookDetails(this.currentUserId).subscribe(books => {
      this.userBooks = books;
      this.filterByTab(this.activeTab);
    });
  }

  filterByTab(tab: 'all' | 'reading' | 'toRead' | 'read'): void {
    this.activeTab = tab;
    
    switch (tab) {
      case 'reading':
        this.filteredBooks = this.userBooks.filter(book => book.status === 'currently-reading');
        break;
      case 'toRead':
        this.filteredBooks = this.userBooks.filter(book => book.status === 'want-to-read');
        break;
      case 'read':
        this.filteredBooks = this.userBooks.filter(book => book.status === 'read');
        break;
      default:
        this.filteredBooks = this.userBooks;
    }
  }

  updateStatus(userBookId: number, newStatus: UserBook['status']): void {
    this.bookService.updateBookStatus(userBookId, newStatus).subscribe(() => {
      // Update local state
      const bookIndex = this.userBooks.findIndex(b => b.id === userBookId);
      if (bookIndex !== -1) {
        this.userBooks[bookIndex].status = newStatus;
        this.filterByTab(this.activeTab);
      }
    });
  }
}