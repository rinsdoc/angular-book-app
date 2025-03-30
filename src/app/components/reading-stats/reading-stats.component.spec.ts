import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingStatsComponent } from './reading-stats.component';

describe('ReadingStatsComponent', () => {
  let component: ReadingStatsComponent;
  let fixture: ComponentFixture<ReadingStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadingStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
