import { Component, Input, OnInit } from '@angular/core';
import { WeatherStats } from 'src/app/models/WeatherStats.1';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {

  @Input()
  public stats:WeatherStats

  @Input()
  public mode:string = 'temperature';

  constructor() { 
    this.stats = {} as WeatherStats;
  }

  ngOnInit(): void {
  }

}
