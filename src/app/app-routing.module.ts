// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookDetailComponent } from './components/book-detail/book-detail.component';
import { UserLibraryComponent } from './components/user-library/user-library.component';
import { ReadingStatsComponent } from './components/reading-stats/reading-stats.component';

const routes: Routes = [
    { path: '', redirectTo: '/discover', pathMatch: 'full' },
    { path: 'discover', component: BookListComponent },
    { path: 'books/:id', component: BookDetailComponent },
    { path: 'my-library', component: UserLibraryComponent },
    { path: 'stats', component: ReadingStatsComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
