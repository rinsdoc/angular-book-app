// app.component.ts
import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterOutlet, RouterModule } from "@angular/router"
import { HttpClientModule } from "@angular/common/http"
import { ThemeService } from "./services/theme.service"
import { BookService } from "./services/book.service"
import { NgIconComponent, provideIcons } from '@ng-icons/core'
import { lucideSun, lucideMoon } from '@ng-icons/lucide'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    HttpClientModule,
    NgIconComponent,
    ButtonModule,
    ToastModule,
  ],
  providers: [
    provideIcons({ lucideSun, lucideMoon })
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "reading-tracker-app"

  constructor(
    private themeService: ThemeService,
    private bookService: BookService,
  ) {}

  toggleTheme(): void {
    this.themeService.toggleTheme()
  }

  isDarkTheme(): boolean {
    return this.themeService.currentTheme() === "dark"
  }

  showError(): boolean {
    return !!this.bookService.error()
  }

  getErrorMessage(): string {
    return this.bookService.error() || ""
  }

  clearError(): void {
    this.bookService.clearError()
  }
}

