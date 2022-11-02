import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LocationReading } from '../models/locationreading';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private readonly http:HttpClient) { }

  public get(location:string, fromDate:Date, toDate:Date): Observable<LocationReading[]> {
    const url = `https://kimharald.no/api/weather/readings/${location}/${fromDate.valueOf()}/${toDate.valueOf()}`;
    return this.http.get<any[]>(url).pipe(
      map(readings => readings.map(reading => {
        return {
          ...reading,
          ts: reading.when
        } as LocationReading
      })))
  }
}
