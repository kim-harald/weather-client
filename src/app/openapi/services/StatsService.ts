/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { DbStats } from '../models/DbStats';
import type { WeatherStats } from '../models/WeatherStats';

import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

@Injectable({
  providedIn: 'root',
})
export class StatsService {

    constructor(public readonly http: HttpClient) {}

    /**
     * Gets the weather stats computed for the location and time range
     * @param location Location to query
     * @param start timestamp as number
     * @param end timestamp as number
     * @returns WeatherStats WeatherStats object
     * @throws ApiError
     */
    public getAllStatsDateRange(
location: string,
start: number,
end: number,
): Observable<WeatherStats> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/stats/{location}/{start}/{end}',
            path: {
                'location': location,
                'start': start,
                'end': end,
            },
        });
    }

    /**
     * returns an object showing first and last entry dates and record count in database
     * @returns DbStats DbStats
     * @throws ApiError
     */
    public getDbData(): Observable<DbStats> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/stats/dbstats',
        });
    }

}
