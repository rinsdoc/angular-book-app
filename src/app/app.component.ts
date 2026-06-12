// app.component.ts
import {Component} from "@angular/core"
import {CommonModule} from "@angular/common"
import {RouterOutlet, RouterModule} from "@angular/router"
import {ThemeService} from "./services/theme.service"
import {BookService} from "./application/book.service"

@Component({
  selector: "app-root",
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "reading-tracker-app"

  constructor(
    private themeService: ThemeService,
    private bookService: BookService,
  ) {
  }

  toggleTheme(): void {
    this.themeService.toggleTheme()
  }

  isDarkTheme(): boolean {
    return this.themeService.currentTheme() === "dark"
  }

  showError(): boolean {
    return false; // TODO: Implementar gestión de errores global
  }

  getErrorMessage(): string {
    return ""; // TODO: Implementar gestión de errores global
  }

  clearError(): void {
    // TODO: Implementar gestión de errores global
  }
}
