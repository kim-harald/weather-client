import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DetectorService {

  constructor() { }

  public get isMobile():boolean {
    return navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i) ? true : false;
  }
}
