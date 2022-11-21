import { Component, Input, OnInit } from '@angular/core';
import { SummaryReading } from 'src/app/models/stats/SummaryReading';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  private _stats: SummaryReading = {} as SummaryReading;

  @Input()
  public set stats(v: SummaryReading) {
    this._stats = v;
    if (this._stats && this._stats.first && this._stats.last) {
      this.title = new Date(this._stats.first).toJSON().slice(0, 19).replace('T',' ') 
      + ' til ' 
      + new Date(this._stats.last).toJSON().slice(0,19).replace('T',' ');
    }
  }

  public get stats(): SummaryReading {
    return this._stats;
  }

  @Input()
  public mode: string = 'temperature';

  public title: string = '';

  constructor() {
    this.stats = {} as SummaryReading;
  }

  ngOnInit(): void {

  }

}
