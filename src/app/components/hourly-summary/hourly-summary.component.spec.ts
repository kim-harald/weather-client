import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourlySummaryComponent } from './hourly-summary.component';

describe('HourlySummaryComponent', () => {
  let component: HourlySummaryComponent;
  let fixture: ComponentFixture<HourlySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HourlySummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HourlySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
