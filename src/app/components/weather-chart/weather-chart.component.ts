import { Component, Input, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';


@Component({
  selector: 'app-weather-chart',
  templateUrl: './weather-chart.component.html',
  styleUrls: ['./weather-chart.component.scss']
})
export class WeatherChartComponent implements OnInit {

  @Input()
  public labels: string[] = [] ;

  @Input()
  public title: string = '';

  @Input()
  public height:number = 400;

  @Input()
  public width: number = 800;

  @Input()
  public min:number | undefined ;

  @Input()
  public max:number | undefined ;

  @Input()
  public data:any[] = [];

  public chart = {
    type: ChartType.Line,
    data: this.data,
    options: {
      colors: [ 'red','yellow','blue']
    }
  };

  
  constructor() { }

  ngOnInit(): void { }
}
