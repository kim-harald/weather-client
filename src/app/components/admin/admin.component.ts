import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationsService, Location, SummaryService } from '@openapi';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public locations: Location[] = [];
  
  // Recompute form fields
  public selectedLocation = '';
  public summaryType: 'daily' | 'hourly' = 'daily';
  public startDate = '';
  public endDate = '';
  public isRecomputing = false;
  public resultMessage = '';

  constructor(
    private readonly locationService: LocationsService,
    private readonly summaryService: SummaryService
  ) { }

  ngOnInit(): void {
    this.locationService.getLocations().subscribe(data => {
      this.locations = data;
      if (data.length > 0) {
        this.selectedLocation = data[0].name ?? '';
      }
    });

    // Set default dates (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.endDate = this.formatDate(now);
    this.startDate = this.formatDate(thirtyDaysAgo);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  recomputeSummaries(): void {
    if (!this.selectedLocation || !this.startDate || !this.endDate) {
      this.resultMessage = 'Please fill in all fields';
      return;
    }

    const startTimestamp = new Date(this.startDate).valueOf();
    const endTimestamp = new Date(this.endDate).valueOf() + 24 * 60 * 60 * 1000 - 1; // End of day

    this.isRecomputing = true;
    this.resultMessage = '';

    this.summaryService.recomputeSummaries(
      this.summaryType,
      this.selectedLocation,
      startTimestamp,
      endTimestamp
    ).subscribe({
      next: (count) => {
        this.resultMessage = `Successfully updated ${count} ${this.summaryType} records`;
        this.isRecomputing = false;
      },
      error: (err) => {
        this.resultMessage = `Error: ${err.message || 'Failed to recompute summaries'}`;
        this.isRecomputing = false;
      }
    });
  }
}
