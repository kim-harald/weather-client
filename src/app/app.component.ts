import { Component } from '@angular/core';
import { LocationReading } from './models/locationreading';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public device = 'gimel';
  public data:LocationReading[] = [];

  constructor(private readonly globalService: GlobalService) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate()-1);
    this.globalService.getCurrent('Deck-1',startDate).subscribe(data => {
      this.data = data;
    });
  }
}
