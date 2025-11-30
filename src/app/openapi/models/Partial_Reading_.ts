/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Make all properties in T optional
 */
export type Partial_Reading_ = {
    id?: any;
    /**
     * Timestamp as unix timestamp numeric
     */
    ts?: number;
    /**
     * Timestamp as Date
     */
    when?: string;
    /**
     * Humidity as percentage (0-100)
     */
    humidity?: number;
    /**
     * Pressure in Pascals
     */
    pressure?: number;
    /**
     * Temperature in Kelvin
     */
    temperature?: number;
    /**
     * Location
     */
    location?: string;
    /**
     * Device
     */
    device?: string;
};

