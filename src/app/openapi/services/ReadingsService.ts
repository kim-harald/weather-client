/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { Partial_Reading_ } from '../models/Partial_Reading_';
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
     * Retrieves first topN Readings ordered by descending date (latest first)
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
     * @param startTs
     * @param endTs
     * @returns string Array of string
     * @throws ApiError
     */
    public getIds(
        startTs: number,
        endTs: number,
    ): Observable<Array<string>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/ids/{startTs}/{endTs}',
            path: {
                'startTs': startTs,
                'endTs': endTs,
            },
        });
    }

    /**
     * Retrieves an array of ids of all Readings
     * @returns string Array of string
     * @throws ApiError
     */
    public getAllIds(): Observable<Array<string>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/ids',
        });
    }

    /**
     * Retrieves extreme readings for a location
     * @param locationId Location id
     * @returns Reading Array of extreme Reading
     * @throws ApiError
     */
    public getExtremeReadings(
        locationId: number,
    ): Observable<Array<Reading>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/extreme/{locationId}',
            path: {
                'locationId': locationId,
            },
        });
    }

    /**
     * Retrieves extreme delta readings for a location
     * @param locationId Location id
     * @param temperatureDelta Temperature delta
     * @param humidityDelta Humidity delta
     * @param pressureDelta Pressure delta
     * @returns Reading Array of extreme delta Reading
     * @throws ApiError
     */
    public getExtremeDeltaReadings(
        locationId: number,
        temperatureDelta: number,
        humidityDelta: number,
        pressureDelta: number,
    ): Observable<Array<Reading>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/readings/extreme/delta/{locationId}/{temperatureDelta}/{humidityDelta}/{pressureDelta}',
            path: {
                'locationId': locationId,
                'temperatureDelta': temperatureDelta,
                'humidityDelta': humidityDelta,
                'pressureDelta': pressureDelta,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns Reading Ok
     * @throws ApiError
     */
    public updateReading(
        id: string,
        requestBody: Reading,
    ): Observable<Reading> {
        return __request(OpenAPI, this.http, {
            method: 'PUT',
            url: '/readings/update/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Partially updates a reading by id
     * @param id Reading id
     * @param requestBody Partial reading data to update
     * @returns Reading Updated Reading
     * @throws ApiError
     */
    public patchReading(
        id: string,
        requestBody: Partial_Reading_,
    ): Observable<Reading> {
        return __request(OpenAPI, this.http, {
            method: 'PATCH',
            url: '/readings/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Deletes a reading by id
     * @param id Reading id to delete
     * @returns void
     * @throws ApiError
     */
    public deleteReading(
        id: string,
    ): Observable<void> {
        return __request(OpenAPI, this.http, {
            method: 'DELETE',
            url: '/readings/{id}',
            path: {
                'id': id,
            },
        });
    }

}
