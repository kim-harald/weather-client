import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-select-location',
  templateUrl: './select-location.component.html',
  styleUrls: ['./select-location.component.scss'],
})
export class SelectLocationComponent implements OnInit {
  constructor() {}

  @Input()
  public locations: string[] = [];

  @Output()
  public select: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit(): void {}
}
