/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Reading = {
    /**
     * Device
     */
    device: string;
    /**
     * Location
     */
    location: string;
    /**
     * Temperature in Kelvin
     */
    temperature: number;
    /**
     * Pressure in Pascals
     */
    pressure: number;
    /**
     * Humidity as percentage (0-100)
     */
    humidity: number;
    /**
     * Timestamp as Date
     */
    when: string;
    /**
     * Timestamp as unix timestamp numeric
     */
    ts: number;
    id: any;
};
