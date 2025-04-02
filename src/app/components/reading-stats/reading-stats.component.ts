// reading-stats.component.ts
import { Component, type OnInit, type AfterViewInit, type ElementRef, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { forkJoin } from "rxjs"
import { BookService } from "../../services/book.service"
import { ReadingSessionService } from "../../services/reading-session.service"

@Component({
  selector: "app-reading-stats",
  templateUrl: "./reading-stats.component.html",
  styleUrls: ["./reading-stats.component.css"],
  standalone: true,
  imports: [CommonModule],
})
export class ReadingStatsComponent implements OnInit, AfterViewInit {
  @ViewChild("genreCanvas") genreCanvas!: ElementRef<HTMLCanvasElement>
  @ViewChild("monthlyCanvas") monthlyCanvas!: ElementRef<HTMLCanvasElement>

  currentUserId = 1 // Hard-coded for demo
  totalBooksRead = 0
  pagesReadThisYear = 0
  readingTimeThisYear = 0 // in minutes
  genreDistribution: { name: string; value: number }[] = []
  monthlyProgress: { month: string; books: number; pages: number }[] = []

  isLoading = true

  // Colors for charts
  chartColors = [
    "#6200ea",
    "#9d46ff",
    "#b39ddb",
    "#7c4dff",
    "#651fff",
    "#6200ee",
    "#9c27b0",
    "#aa00ff",
    "#d500f9",
    "#e040fb",
  ]

  constructor(
    private http: HttpClient,
    private bookService: BookService,
    private readingSessionService: ReadingSessionService,
  ) {}

  ngOnInit(): void {
    this.loadReadingStats()
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadReadingStats(): void {
    this.isLoading = true

    // Get user books and all books
    const userBooks$ = this.bookService.getUserBooks(this.currentUserId)
    const books$ = this.bookService.getAllBooks()
    const sessions$ = this.http.get<any[]>("/assets/reading-sessions.json")

    forkJoin([userBooks$, books$, sessions$]).subscribe({
      next: ([userBooks, books, sessions]) => {
        console.log("Loaded data for stats:", { userBooks, books, sessions })

        // Books read count
        this.totalBooksRead = userBooks.filter((ub) => ub.status === "read").length

        // Calculate genre distribution
        const readBookIds = userBooks.filter((ub) => ub.status === "read").map((ub) => ub.bookId)
        const readBooks = books.filter((book) => readBookIds.includes(book.id))

        // Count genres
        const genreCounts: { [key: string]: number } = {}
        readBooks.forEach((book) => {
          book.genres.forEach((genre: string) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1
          })
        })

        // Convert to array for chart
        this.genreDistribution = Object.entries(genreCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value) // Sort by value descending

        // Calculate pages and time
        const readSessionsThisYear = sessions.filter((s) => {
          const userBookId = s.userBookId
          const matchingUserBook = userBooks.find((ub) => ub.id === userBookId)
          return matchingUserBook && s.date.startsWith("2023") // Hard-coded year for demo
        })

        this.pagesReadThisYear = readSessionsThisYear.reduce((sum, s) => sum + s.pagesRead, 0)
        this.readingTimeThisYear = readSessionsThisYear.reduce((sum, s) => sum + s.minutes, 0)

        // Monthly progress
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        this.monthlyProgress = months.map((month) => ({ month, books: 0, pages: 0 }))

        readSessionsThisYear.forEach((session) => {
          const monthIndex = new Date(session.date).getMonth()
          this.monthlyProgress[monthIndex].pages += session.pagesRead
        })

        userBooks
          .filter((ub) => ub.dateFinished && ub.dateFinished.startsWith("2023"))
          .forEach((ub) => {
            const monthIndex = new Date(ub.dateFinished).getMonth()
            this.monthlyProgress[monthIndex].books += 1
          })

        this.isLoading = false

        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initGenreChart()
          this.initMonthlyChart()
        }, 0)
      },
      error: (err) => {
        console.error("Error loading reading stats:", err)
        this.isLoading = false
      },
    })
  }

  getBestReadingMonth() {
    if (!this.monthlyProgress || this.monthlyProgress.length === 0) {
      return { month: "No data available", books: 0 }
    }
    return this.monthlyProgress.reduce((max, month) => (month.books > max.books ? month : max), { month: "", books: 0 })
  }

  initGenreChart(): void {
    if (!this.genreCanvas) return

    const ctx = this.genreCanvas.nativeElement.getContext("2d")
    if (!ctx) return

    // Limit to top 5 genres for better visualization
    const topGenres = this.genreDistribution.slice(0, 5)

    // Clear canvas
    ctx.clearRect(0, 0, this.genreCanvas.nativeElement.width, this.genreCanvas.nativeElement.height)

    const canvasWidth = this.genreCanvas.nativeElement.width
    const canvasHeight = this.genreCanvas.nativeElement.height
    const barHeight = 30
    const barGap = 15
    const maxBarWidth = canvasWidth - 150 // Leave space for labels

    // Find the maximum value for scaling
    const maxValue = Math.max(...topGenres.map((g) => g.value), 1)

    // Draw bars
    topGenres.forEach((genre, index) => {
      const y = index * (barHeight + barGap) + 20
      const barWidth = (genre.value / maxValue) * maxBarWidth

      // Draw genre name
      ctx.fillStyle = "#666"
      ctx.font = "14px Arial"
      ctx.textAlign = "right"
      ctx.fillText(genre.name, 100, y + barHeight / 2 + 5)

      // Draw bar
      ctx.fillStyle = this.chartColors[index % this.chartColors.length]
      ctx.fillRect(120, y, barWidth, barHeight)

      // Draw value
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      if (barWidth > 30) {
        // Only draw text inside bar if there's enough space
        ctx.fillText(genre.value.toString(), 120 + barWidth - 20, y + barHeight / 2 + 4)
      } else {
        ctx.fillStyle = "#333"
        ctx.textAlign = "left"
        ctx.fillText(genre.value.toString(), 120 + barWidth + 5, y + barHeight / 2 + 4)
      }
    })
  }

  initMonthlyChart(): void {
    if (!this.monthlyCanvas) return

    const ctx = this.monthlyCanvas.nativeElement.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, this.monthlyCanvas.nativeElement.width, this.monthlyCanvas.nativeElement.height)

    const canvasWidth = this.monthlyCanvas.nativeElement.width
    const canvasHeight = this.monthlyCanvas.nativeElement.height
    const barWidth = (canvasWidth - 60) / 12 // 12 months
    const maxBarHeight = canvasHeight - 60 // Leave space for labels

    // Find the maximum value for scaling
    const maxBooks = Math.max(...this.monthlyProgress.map((m) => m.books), 1)

    // Draw bars
    this.monthlyProgress.forEach((month, index) => {
      const x = index * barWidth + 40
      const barHeight = (month.books / maxBooks) * maxBarHeight
      const y = canvasHeight - barHeight - 30

      // Draw bar
      ctx.fillStyle = this.chartColors[index % this.chartColors.length]
      ctx.fillRect(x, y, barWidth - 10, barHeight || 1) // Ensure at least 1px height for empty months

      // Draw month name
      ctx.fillStyle = "#666"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(month.month, x + (barWidth - 10) / 2, canvasHeight - 10)

      // Draw value if there are books read
      if (month.books > 0) {
        ctx.fillStyle = "#333"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(month.books.toString(), x + (barWidth - 10) / 2, y - 5)
      }
    })
  }
}

