import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-weather-gauge',
  templateUrl: './weather-gauge.component.html',
  styleUrls: ['./weather-gauge.component.scss'],
})
export class WeatherGaugeComponent implements OnInit {
  constructor() {}

  @Input()
  public min:number = 0;

  @Input() 
  max:number = 100;

  @Input()
  value:number = 0;

  ngOnInit(): void {}
}
