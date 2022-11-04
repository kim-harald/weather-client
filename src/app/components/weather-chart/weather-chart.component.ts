import { Component, Input, OnInit } from '@angular/core';
import { ChartType, Column } from 'angular-google-charts';
import { cKelvinOffset, padLeft } from 'src/app/common/common';
import { LocationReading } from 'src/app/models/locationreading';

@Component({
  selector: 'app-weather-chart',
  templateUrl: './weather-chart.component.html',
  styleUrls: ['./weather-chart.component.scss'],
})
export class WeatherChartComponent implements OnInit {
  private _data: any[] = [];

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
  public set data(v: any[]) {
    this._data = v ?? [];
    this.chart.data = convert(v);
  }

  public get data(): any[] {
    return this._data;
  }

  public columns: Column[] = [];
  public chart = { type: ChartType.Line, data: this.data, options: {} };

  constructor() {}

  ngOnInit(): void {
    this.chart = {
      type: ChartType.LineChart,
      data: this.data,
      options: {
        colors:[
          'red',
          'yellow',
          'blue'
        ],
        hAxis: {
          title: 'Time',
        },
        vAxis: {
          title: 'Temperature',
          gridlines: {
            count: 0,
          },
          maxValue:10,
          minValue:-10
        },
        width: 1200,
        height: 500,
        backgroundColor: {
          fill: 'rgb(10,10,10)',
          opacity: 0,
        },
        legend: {
          position:'none'
        }
      },
    };

    this.columns = ['Time', 'Temperature'];
  }
}

const convert = (readings: LocationReading[]): any[] => {
  const result: any[] = [];
  readings.forEach((reading) => {
    const entry = [
      convertTime(reading.ts),
      reading.temperature - cKelvinOffset,
    ];
    result.push(entry);
  });
  return result;
};

const convertTime = (ts: number): string => {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return hh + ':' + mm;
};