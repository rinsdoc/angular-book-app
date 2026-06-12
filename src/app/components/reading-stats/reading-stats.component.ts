import {Component, OnInit, ChangeDetectorRef} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReadingSessionService} from "../../application/reading-session.service";

interface GenreSegment {
  name: string
  value: number
  percent: number
  color: string
  dashArray: string
  dashOffset: number
}

interface ChartPoint {
  x: number
  y: number
  month: string
  books: number
}

interface MonthlyChart {
  linePath: string
  areaPath: string
  points: ChartPoint[]
  gridLines: number[]
  baseY: number
  maxBooks: number
}

@Component({
  selector: "app-reading-stats",
  templateUrl: "./reading-stats.component.html",
  styleUrls: ["./reading-stats.component.css"],
  imports: [CommonModule],
})
export class ReadingStatsComponent implements OnInit {
  currentUserId = 1 // Hard-coded for demo
  totalBooksRead = 0
  pagesReadThisYear = 0
  readingTimeThisYear = 0 // in minutes
  genreDistribution: { name: string; value: number }[] = []
  monthlyProgress: { month: string; books: number; pages: number }[] = []

  isLoading = true

  // Donut chart geometry (genres)
  readonly donutRadius = 70
  readonly donutStrokeWidth = 26
  readonly donutCircumference = 2 * Math.PI * this.donutRadius
  genreSegments: GenreSegment[] = []
  genreTotal = 0

  // Line/area chart geometry (monthly progress)
  monthlyChart: MonthlyChart = {linePath: "", areaPath: "", points: [], gridLines: [], baseY: 0, maxBooks: 0}
  hasMonthlyData = false

  // Vibrant palette that reads well in both light and dark themes
  private readonly palette = [
    "hsl(262 83% 60%)",
    "hsl(199 89% 52%)",
    "hsl(330 75% 60%)",
    "hsl(160 60% 45%)",
    "hsl(35 92% 55%)",
    "hsl(280 65% 65%)",
  ]

  constructor(
    private readingSessionService: ReadingSessionService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadReadingStats()
  }

  async loadReadingStats(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      const stats = await this.readingSessionService.getUserReadingStats(this.currentUserId);
      this.totalBooksRead = stats.totalBooksRead;
      this.pagesReadThisYear = stats.pagesReadThisYear;
      this.readingTimeThisYear = stats.readingTimeThisYear;
      this.genreDistribution = stats.genreDistribution;
      this.monthlyProgress = stats.monthlyProgress;

      this.buildGenreDonut();
      this.buildMonthlyChart();
    } catch (err) {
      console.error('Error loading reading stats:', err);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getBestReadingMonth() {
    if (!this.monthlyProgress || this.monthlyProgress.length === 0) {
      return {month: "No data available", books: 0}
    }
    return this.monthlyProgress.reduce((max, month) => (month.books > max.books ? month : max), {month: "", books: 0})
  }

  private buildGenreDonut(): void {
    const top = this.genreDistribution.slice(0, 6)
    this.genreTotal = top.reduce((sum, g) => sum + g.value, 0)
    const total = this.genreTotal || 1

    let offset = 0
    this.genreSegments = top.map((genre, index) => {
      const fraction = genre.value / total
      const length = fraction * this.donutCircumference
      const segment: GenreSegment = {
        name: genre.name,
        value: genre.value,
        percent: Math.round(fraction * 100),
        color: this.palette[index % this.palette.length],
        dashArray: `${length} ${this.donutCircumference - length}`,
        dashOffset: -offset,
      }
      offset += length
      return segment
    })
  }

  private buildMonthlyChart(): void {
    // viewBox: 0 0 620 240 (kept in sync with the template)
    const width = 620
    const height = 240
    const padX = 14
    const padTop = 18
    const padBottom = 34
    const innerW = width - padX * 2
    const innerH = height - padTop - padBottom
    const baseY = padTop + innerH

    const data = this.monthlyProgress
    const n = data.length
    this.hasMonthlyData = data.some((m) => m.books > 0)
    const maxBooks = Math.max(...data.map((m) => m.books), 1)
    const step = n > 1 ? innerW / (n - 1) : 0

    const points: ChartPoint[] = data.map((m, i) => ({
      x: padX + i * step,
      y: padTop + innerH - (m.books / maxBooks) * innerH,
      month: m.month,
      books: m.books,
    }))

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ")

    const areaPath = points.length
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseY} L ${points[0].x.toFixed(1)} ${baseY} Z`
      : ""

    // Three evenly spaced gridlines plus the baseline
    const gridLines = [0, 1, 2, 3].map((i) => padTop + (innerH / 3) * i)

    this.monthlyChart = {linePath, areaPath, points, gridLines, baseY, maxBooks}
  }
}
