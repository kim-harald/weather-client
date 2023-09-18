import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeGroupComponent } from './gauge-group.component';

describe('GaugeGroupComponent', () => {
  let component: GaugeGroupComponent;
  let fixture: ComponentFixture<GaugeGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GaugeGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GaugeGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
