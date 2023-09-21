import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalService } from '@services';
import { Location } from 'src/app/openapi/models/Location';


@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss'],
})
export class SelectLocationComponent implements OnInit {
  constructor(public readonly globalService:GlobalService) {}

  @Input()
  public locations: Location[] = [];

  public isSelected(location:string):string {
    return location == this.globalService.location ? 'selected' :'';
  }

  ngOnInit(): void {
    if (this.locations && this.locations.length > 0) {
      this.globalService.location = this.locations[0].name;
    }
  }

  public change(location:string):void {
    this.globalService.location = location;
  }
}
