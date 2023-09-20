/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { Payload } from '../models/Payload';

import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

@Injectable({
  providedIn: 'root',
})
export class PayloadService {

    constructor(public readonly http: HttpClient) {}

    /**
     * Retrieves Payload object for the date range
     * @param start timestamp
     * @param end timestamp
     * @returns Payload Payload object
     * @throws ApiError
     */
    public getPayload(
start: number,
end: number,
): Observable<Payload> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/payload/{start}/{end}',
            path: {
                'start': start,
                'end': end,
            },
        });
    }

    /**
     * Save payload object
     * @param requestBody Payload object
     * @returns void 
     * @throws ApiError
     */
    public savePayload(
requestBody: Payload,
): Observable<void> {
        return __request(OpenAPI, this.http, {
            method: 'PUT',
            url: '/payload/save',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete readings according to Ids
     * @param requestBody Array of Reading Ids
     * @returns void 
     * @throws ApiError
     */
    public deletePayload(
requestBody: Array<string>,
): Observable<void> {
        return __request(OpenAPI, this.http, {
            method: 'PUT',
            url: '/payload/delete',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
