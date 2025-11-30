/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { Location } from '../models/Location';

import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

@Injectable({
    providedIn: 'root',
})
export class LocationsService {

    constructor(public readonly http: HttpClient) {}

    /**
     * Retrieves all locations
     * @param includeInactive
     * @returns Location Ok
     * @throws ApiError
     */
    public getLocations(
        includeInactive?: boolean,
    ): Observable<Array<Location>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/locations',
            query: {
                'includeInactive': includeInactive,
            },
        });
    }

    /**
     * Insert a new location
     * @param requestBody location object
     * @returns Location Created
     * @throws ApiError
     */
    public addLocation(
        requestBody: Location,
    ): Observable<Location> {
        return __request(OpenAPI, this.http, {
            method: 'POST',
            url: '/locations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update a location
     * @param requestBody location object
     * @returns Location update location object
     * @throws ApiError
     */
    public updateLocation(
        requestBody: Location,
    ): Observable<Location> {
        return __request(OpenAPI, this.http, {
            method: 'PUT',
            url: '/locations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
