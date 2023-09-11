import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Location } from 'src/app/openapi/models/Location';


@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss'],
})
export class SelectLocationComponent implements OnInit {
  constructor() {}

  @Input()
  public locations: Location[] = [];

  @Input()
  public location:string = '';

  @Output()
  public locationChange: EventEmitter<string> = new EventEmitter<string>();

  public isSelected(location:string):string {
    return location == this.location ? 'selected' :'';
  }

  ngOnInit(): void {
    if (this.locations && this.locations.length > 0) {
      this.location = this.locations[0].name;
    }
  }

  public change(location:string):void {
    this.location = location;
    this.locationChange.emit(location);
  }
}
