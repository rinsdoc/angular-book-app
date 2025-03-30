import { TestBed } from '@angular/core/testing';

import { ReadingSessionService } from './reading-session.service';

describe('ReadingSessionService', () => {
  let service: ReadingSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadingSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
