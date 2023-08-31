import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { LocationReading } from '../models/locationreading';
import { SummaryReading } from '../models/stats/SummaryReading';
import { WeatherStats } from '../models/stats/weatherstats';
import { Location } from '../models/location';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private readonly http:HttpClient) { }

  public getReadings(location:string, fromDate:Date, toDate:Date): Observable<LocationReading[]> {
    const url = `https://kimharald.no/api/weather/readings/${location}/${fromDate.valueOf()}/${toDate.valueOf()}`;
    return this.http.get<any[]>(url).pipe(
      map(readings => readings.map(reading => {
        return {
          ...reading,
        } as LocationReading
      })))
  }

  public getHourly(location:string, fromDate:Date, toDate:Date): Observable<SummaryReading[]> {
    const url = `https://kimharald.com/api/weather/summary/hourly/${location}/${fromDate.valueOf()}/${toDate.valueOf()}`;
    return this.http.get<SummaryReading[]>(url);
  }

  public getDaily(location:string, fromDate:Date, toDate:Date): Observable<SummaryReading[]> {
    const url = `https://kimharald.com/api/weather/summary/daily/${location}/${fromDate.valueOf()}/${toDate.valueOf()}`;
    return this.http.get<SummaryReading[]>(url);
  }
  
  public getSummary(location:string): Observable<SummaryReading> {
    const url = `https://kimharald.com/api/weather/summary/all/${location}`;
    return this.http.get<SummaryReading>(url);
  }

  public getStats(location:string, fromDate:Date, toDate:Date): Observable<WeatherStats> {
    const url = `https://kimharald.com/api/weather/stats/${location}/${fromDate.valueOf()}/${toDate.valueOf()}`;
    return this.http.get<WeatherStats>(url)
  }

  public getAllStats(location:string): Observable<WeatherStats> {
    const url = `https://kimharald.com/api/weather/stats/${location}`;
    return this.http.get<WeatherStats>(url)
  }

  public getLocations(): Observable<Location[]> {
    const locations:Location[] = [ { id:1,name:'gimel',description:'Ute'},{id:2,name:'dalet', description:'Inne'} ]
    const url = 'https://kimharald.com/api/weather/locations';
    return this.http.get<Location[]>(url);
    //return of(locations);
  }
  
  
}
