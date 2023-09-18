import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Mode } from '../models/mode';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private _mode:Mode = Mode.temperature;
  private _location:string = '';

  public mode$:Subject<Mode> = new Subject<Mode>();
  public location$:Subject<string> = new Subject<string>();

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

  constructor() { }
}
