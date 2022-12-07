import { Component, Input, OnInit } from '@angular/core';
import { SummaryReading } from 'src/app/models/stats/SummaryReading';
import { WeatherStats } from 'src/app/models/stats/weatherstats';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  private _stats: WeatherStats = {} as WeatherStats;

  @Input()
  public set stats(v: WeatherStats) {
    this._stats = v;
    if (this._stats && this._stats.dateRange.start && this._stats.dateRange.end) {
      this.title = new Date(this._stats.dateRange.start).toStandard()
      + ' til ' 
      + new Date(this._stats.dateRange.end).toStandard();
    }
  }

  public get stats(): WeatherStats {
    return this._stats;
  }

  @Input()
  public mode: string = 'temperature';

  public title: string = '';

  constructor() {
    this.stats = {} as WeatherStats;
  }

  ngOnInit(): void {

  }

}
