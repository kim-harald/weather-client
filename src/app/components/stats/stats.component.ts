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
    
    this.setDates(v);
  }

  public get stats(): WeatherStats {
    return this._stats ?? {} as WeatherStats;
  }

  @Input()
  public mode: string = 'temperature';

  @Input()
  public title: string = '';

  public maxTemperatureDate:string = '';
  public minTemperatureDate:string = '';

  public maxPressureDate:string ='';
  public minPressureDate:string = '';

  public maxHumidityDate:string = '';
  public minHumidityDate:string = '';

  constructor() {
    this.stats = {} as WeatherStats;
  }

  ngOnInit(): void {

  }

  private setDates(weatherstats:WeatherStats):void {
    if (weatherstats.temperature && weatherstats.pressure && weatherstats.humidity) {
      this.maxTemperatureDate = new Date(weatherstats.temperature.max.ts).toStandard();
      this.minTemperatureDate = new Date(weatherstats.temperature.min.ts).toStandard();
      this.maxPressureDate = new Date(weatherstats.pressure.max.ts).toStandard();
      this.minPressureDate = new Date(weatherstats.pressure.min.ts).toStandard();
      this.maxHumidityDate = new Date(weatherstats.humidity.max.ts).toStandard();
      this.minHumidityDate = new Date(weatherstats.humidity.min.ts).toStandard();
    }
    
  }

}
