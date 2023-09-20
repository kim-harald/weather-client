import { TestBed } from '@angular/core/testing';

import { ListenersService } from './listeners.service';

describe('ListenersService', () => {
  let service: ListenersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListenersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
