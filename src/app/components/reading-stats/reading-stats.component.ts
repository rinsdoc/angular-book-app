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
  color: string
  valueY: number
}

interface YTick {
  value: number
  y: number
}

interface MonthlyChart {
  linePath: string
  areaPath: string
  points: ChartPoint[]
  yTicks: YTick[]
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
  monthlyChart: MonthlyChart = {linePath: "", areaPath: "", points: [], yTicks: [], baseY: 0, maxBooks: 0}
  hasMonthlyData = false

  // One vibrant colour per month — a cohesive rainbow across the year
  private readonly monthColors = [
    "hsl(262 83% 62%)", // Jan – violet
    "hsl(232 78% 62%)", // Feb – indigo
    "hsl(205 85% 55%)", // Mar – blue
    "hsl(180 70% 45%)", // Apr – cyan
    "hsl(158 64% 46%)", // May – teal
    "hsl(130 55% 50%)", // Jun – green
    "hsl(95 58% 50%)",  // Jul – lime
    "hsl(45 90% 55%)",  // Aug – yellow
    "hsl(32 92% 55%)",  // Sep – amber
    "hsl(18 88% 57%)",  // Oct – orange
    "hsl(348 80% 60%)", // Nov – red
    "hsl(312 72% 60%)", // Dec – magenta
  ]

  // Vibrant palette that reads well in both light and dark themes
  private readonly palette = [
    "hsl(262 83% 60%)",
    "hsl(199 89% 52%)",
    "hsl(330 75% 60%)",
    "hsl(158 64% 46%)",
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
    const top = this.genreDistribution.slice(0, 6);
    this.genreTotal = top.reduce((sum, g) => sum + g.value, 0);
    const total = this.genreTotal || 1;

    let offset = 0;

    const baseSegments = top.map((genre, index) => {
      const fraction = genre.value / total;
      const length = fraction * this.donutCircumference;
      const segment: GenreSegment = {
        name: genre.name,
        value: genre.value,
        percent: Math.round(fraction * 100),
        color: this.palette[index % this.palette.length],
        dashArray: `${length} ${this.donutCircumference - length}`,
        dashOffset: -offset,
      };
      offset += length;
      return segment;
    });

    // To create the perfect donut effect we create a small dot to match the first segment.
    if (baseSegments.length > 1) {
      const patchLength = 4;

      const firstSegmentPatch: GenreSegment = {
        ...baseSegments[0],
        dashArray: `${patchLength} ${this.donutCircumference - patchLength}`,
        dashOffset: baseSegments[0].dashOffset,
      };

      this.genreSegments = [...baseSegments, firstSegmentPatch];
    } else {
      this.genreSegments = baseSegments;
    }
  }

  private buildMonthlyChart(): void {
    // viewBox: 0 0 620 240 (kept in sync with the template)
    const width = 620
    const height = 240
    const padLeft = 30 // room for the Y-axis labels
    const padRight = 14
    const padTop = 38 // headroom so the "BOOKS" caption clears the top tick
    const padBottom = 34
    const innerW = width - padLeft - padRight
    const innerH = height - padTop - padBottom
    const baseY = padTop + innerH

    const data = this.monthlyProgress
    const n = data.length
    this.hasMonthlyData = data.some((m) => m.books > 0)
    const maxBooks = Math.max(...data.map((m) => m.books), 1)
    const step = n > 1 ? innerW / (n - 1) : 0

    const points: ChartPoint[] = data.map((m, i) => {
      const y = padTop + innerH - (m.books / maxBooks) * innerH
      return {
        x: padLeft + i * step,
        y,
        month: m.month,
        books: m.books,
        color: this.monthColors[i % this.monthColors.length],
        valueY: y - 9,
      }
    })

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ")

    const areaPath = points.length
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseY} L ${points[0].x.toFixed(1)} ${baseY} Z`
      : ""

    // Integer Y-axis ticks from 0 to maxBooks (at most ~4 marks to avoid clutter)
    const tickStep = Math.max(1, Math.ceil(maxBooks / 4))
    const yTicks: YTick[] = []
    for (let value = 0; value <= maxBooks; value += tickStep) {
      yTicks.push({value, y: padTop + innerH - (value / maxBooks) * innerH})
    }

    this.monthlyChart = {linePath, areaPath, points, yTicks, baseY, maxBooks}
  }
}
