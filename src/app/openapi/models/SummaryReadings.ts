/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DateRange } from './DateRange';
import type { Stat } from './Stat';
import type { SummaryReading } from './SummaryReading';

export type SummaryReadings = (Stat & {
dateRange: DateRange;
location: string;
data: Array<SummaryReading>;
});
