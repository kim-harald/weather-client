import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherGaugeComponent } from './weather-gauge.component';

describe('WeatherGaugeComponent', () => {
  let component: WeatherGaugeComponent;
  let fixture: ComponentFixture<WeatherGaugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherGaugeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
