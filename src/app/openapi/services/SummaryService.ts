/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { SummaryReading } from '../models/SummaryReading';
import type { SummaryReadings } from '../models/SummaryReadings';

import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {

    constructor(public readonly http: HttpClient) {}

    /**
     * Returns a hourly summary for the given location and date time range.
     * @param location Location to report on
     * @param start timestamp
     * @param end timestamp
     * @returns SummaryReadings Array of SummaryReading
     * @throws ApiError
     */
    public getHourlySummary(
location: string,
start: number,
end: number,
): Observable<SummaryReadings> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/summary/hourly/{location}/{start}/{end}',
            path: {
                'location': location,
                'start': start,
                'end': end,
            },
        });
    }

    /**
     *
 * Returns a daily summary for the given location and date time range.
     * @param location Location to report on
     * @param start timestamp
     * @param end timestamp
     * @returns SummaryReadings Array of SummaryReading
     * @throws ApiError
     */
    public getDailySummary(
location: string,
start: number,
end: number,
): Observable<SummaryReadings> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/summary/daily/{location}/{start}/{end}',
            path: {
                'location': location,
                'start': start,
                'end': end,
            },
        });
    }

    /**
     * Returns the total summary for the given location
     * @param location Location to report on
     * @returns SummaryReading SummaryReading object
     * @throws ApiError
     */
    public getTotalSummary(
location: string,
): Observable<SummaryReading> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/summary/all/{location}',
            path: {
                'location': location,
            },
        });
    }

}
