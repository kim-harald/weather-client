import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartType, Column, GoogleChartComponent } from 'angular-google-charts';
import { convertTime } from 'src/app/common/common';
import { DataRow } from 'src/app/models/datarow';

@Component({
  selector: 'app-weather-chart',
  templateUrl: './weather-chart.component.html',
  styleUrls: ['./weather-chart.component.scss'],
})
export class WeatherChartComponent implements OnInit {
  private _data: any[] = [[0, 0]];
  private _range: {min?:number,max?:number} = {};

  @ViewChild('chart', {static:false})
  myChart:GoogleChartComponent | undefined;

  @Input()
  public title: string = '';

  @Input()
  public height: number = 400;

  @Input()
  public width: number = 800;

  @Input()
  public set min(v:number | undefined) {
    this._range.min = v;
    this.myChart?.chartWrapper.setOption('vAxis.minValue',v);
  }


  @Input()
  public set max(v: number | undefined ) {
    this._range.max =v;
    this.myChart?.chartWrapper.setOption('vAxis.maxValue',v);
  }

  @Input()
  public colors: string[] = ['red'];

  @Input()
  public columns: Column[] = ['Time', 'Temperature'];

  @Input()
  public set data(v: any[]) {
    this._data = v ?? [];
    this.chart.data = convert(v, this.columns);
  }

  public get data(): any[] {
    return this._data;
  }

  public chart = { type: ChartType.LineChart, data: this.data, options: {} };

  constructor() {
    
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.chart = {
      type: ChartType.LineChart,
      data: convert(this._data, this.columns),
      options: {
        colors: this.colors,
        hAxis: {
          title: this.columns[0],
        },
        vAxis: {
          title: this.columns[1],
          gridlines: {
            count: 6,
            color: 'rgb(20,20,20)',
          },
          maxValue: this._range.max,
          minValue: this._range.min,
        },
        
        width: 1200,
        height: 500,
        backgroundColor: {
          fill: 'rgb(10,10,10)',
          opacity: 0,
        },
        legend: {
          position: 'none',
        },
      },
    };
  }

  draw():void {
    if (this.myChart) {
      this.myChart.chartWrapper.draw();
    }
  }
}

const convert = (rows: DataRow[], columns:Column[]): any[] => {
  const result: any[] = [];
  rows.forEach((row) => {
    const entry = [convertTime(row.ts), row.value];
    result.push(entry);
  });
  return result;
};
