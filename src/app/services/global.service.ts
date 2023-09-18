import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Mode } from '@models';
import { Reading } from '@openapi';
import { rotate } from '@common';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private _mode:Mode = Mode.temperature;
  private _location:string = '';
  private _readings:Reading[] = [];

  public mode$:Subject<Mode> = new Subject<Mode>();
  public location$:Subject<string> = new Subject<string>();
  public readings$:Subject<Reading[]> = new Subject<Reading[]>();

  public get mode():Mode {
    return this._mode;
  }

  public set mode(value:Mode) {
    this._mode = value;
    this.mode$.next(value);
  }

  public get location():string {
    return this._location;
  }

  public set location(value:string) {
    this._location = value;
    this.location$.next(value);
  }

  public get readings():Reading[] {
    return this._readings;
  }

  public nextReading(readings:Reading | Reading[]):void {
    readings = Array.isArray(readings) ? readings : [readings];
    readings.forEach(reading => {
      rotate(this._readings,reading,48);
    });
    
    this.readings$.next(this._readings);
  }

  constructor() { }
}
