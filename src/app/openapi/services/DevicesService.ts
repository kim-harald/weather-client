/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import type { Device } from '../models/Device';

import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

@Injectable({
  providedIn: 'root',
})
export class DevicesService {

    constructor(public readonly http: HttpClient) {}

    /**
     * Retrieves all devices
     * @returns Device Ok
     * @throws ApiError
     */
    public getAll(): Observable<Array<Device>> {
        return __request(OpenAPI, this.http, {
            method: 'GET',
            url: '/devices',
        });
    }

}
