/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DateRange } from './DateRange';
import type { ReadingStat } from './ReadingStat';
import type { Stat } from './Stat';

export type WeatherStats = (Stat & {
timestamp: number;
humidity: ReadingStat;
pressure: ReadingStat;
temperature: ReadingStat;
location: string;
dateRange: DateRange;
});
