import { bootstrapApplication } from "@angular/platform-browser"
import { provideRouter } from "@angular/router"
import { provideHttpClient, withFetch } from "@angular/common/http"
import { provideZonelessChangeDetection } from "@angular/core"

import { AppComponent } from "./app/app.component"
import { routes } from "./app/app.routes"
import { BOOK_REPOSITORY_PORT } from "./app/domain/book-repository.port"
import { USER_BOOK_REPOSITORY_PORT } from "./app/domain/user-book-repository.port"
import { READING_SESSION_REPOSITORY_PORT } from "./app/domain/reading-session-repository.port"
import { REVIEW_REPOSITORY_PORT } from "./app/domain/review-repository.port"
import { BookRepositoryAdapter } from "./app/infrastructure/book-repository.adapter"
import { UserBookRepositoryAdapter } from "./app/infrastructure/user-book-repository.adapter"
import { ReadingSessionRepositoryAdapter } from "./app/infrastructure/reading-session-repository.adapter"
import { ReviewRepositoryAdapter } from "./app/infrastructure/review-repository.adapter"

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: BOOK_REPOSITORY_PORT, useClass: BookRepositoryAdapter },
    { provide: USER_BOOK_REPOSITORY_PORT, useClass: UserBookRepositoryAdapter },
    { provide: READING_SESSION_REPOSITORY_PORT, useClass: ReadingSessionRepositoryAdapter },
    { provide: REVIEW_REPOSITORY_PORT, useClass: ReviewRepositoryAdapter },
  ],
}).catch((err) => console.error(err))
