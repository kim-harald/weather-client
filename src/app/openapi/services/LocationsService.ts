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
     * @returns Location Ok
     * @throws ApiError
     */
    public getLocations(): Observable<Array<Location>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/locations',
        });
    }

}
