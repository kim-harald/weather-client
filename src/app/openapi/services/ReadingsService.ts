/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { Reading } from '../models/Reading';

import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

@Injectable({
  providedIn: 'root',
})
export class ReadingsService {

    constructor(public readonly http: HttpClient) {}

    /**
     * Retrieves Readings for location and time range
     * @param location Location
     * @param start timestamp
     * @param end timestamp
     * @returns Reading Array of Reading
     * @throws ApiError
     */
    public getReadings(
location: string,
start: number,
end: number,
): Observable<Array<Reading>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/{location}/{start}/{end}',
            path: {
                'location': location,
                'start': start,
                'end': end,
            },
        });
    }

    /**
     * Retrieves Readings for the matching ids
     * @param requestBody Array of Reading ids
     * @returns Reading Array of Reading with matching id
     * @throws ApiError
     */
    public getReadingsById(
requestBody: Array<string>,
): Observable<Array<Reading>> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/readings/fetch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Retrieves first topN Readings ordered by descending date (latest first)
     * @param location Location of readings
     * @param topN Number to take
     * @returns Reading Array of Reading
     * @throws ApiError
     */
    public getTopNForLocation(
location: string,
topN: number,
): Observable<Array<Reading>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/topN/{location}/{topN}',
            path: {
                'location': location,
                'topN': topN,
            },
        });
    }

    /**
     * Retrieve first TopN Reading order by descending data (latest first)
     * @param topN Number to take
     * @returns Reading Array of Reading
     * @throws ApiError
     */
    public getTopN(
topN: number,
): Observable<Array<Reading>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/topN/{topN}',
            path: {
                'topN': topN,
            },
        });
    }

    /**
     * Bulk save of Readings
     * @param requestBody Readings to save
     * @returns void 
     * @throws ApiError
     */
    public bulkSave(
requestBody: Array<Reading>,
): Observable<void> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/readings/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Retrieves an array of ids of all Readings
     * @returns string Array of string
     * @throws ApiError
     */
    public getIds(): Observable<Array<string>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/ids',
        });
    }

}
