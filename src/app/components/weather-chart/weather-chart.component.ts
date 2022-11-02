import { Component, Input, OnInit } from '@angular/core';
import { ChartType, Column } from 'angular-google-charts';


@Component({
  selector: 'app-weather-chart',
  templateUrl: './weather-chart.component.html',
  styleUrls: ['./weather-chart.component.scss']
})
export class WeatherChartComponent implements OnInit {

  private _data:any[] = [];

  @Input()
  public labels: string[] = [];

  @Input()
  public title: string = '';

  @Input()
  public height: number = 400;

  @Input()
  public width: number = 800;

  @Input()
  public min: number | undefined;

  @Input()
  public max: number | undefined;

  @Input()
  public set data(v:any[]) {
    this._data = v ?? [];
    this.columns =  ['when','temperature'];
    this.chart.data = this._data.map(items => items.map((item:any) => {
      return {
        when:item.when,
        temperature:item.temperature
        // ,
        // pressure:item.pressure,
        // humidity: item.humidity 
      }
    }));
  }

  public get data():any[] {
    return this._data;
  }

  public columns: Column[] = [];
  public chart = { type: ChartType.Line, data: this.data, options: {} };

  constructor() { }

  ngOnInit(): void {
    this.chart = {
      type: ChartType.Line,
      data: this.data,
      options: {
        colors: ['red', 'yellow', 'blue']
      }
    };

    
  }
}
