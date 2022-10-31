import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }
  

  public get<T>(key:string):T {
    const o = JSON.parse(localStorage.getItem(key) ?? '{}');
    return o as T;
  }

  public set<T>(key:string, o:T):void {
    const s = JSON.stringify(o);
    localStorage.setItem(key,s);
  }
}
