/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Stat } from './Stat';
import type { Summary } from './Summary';

export type SummaryReading = (Stat & {
humidity: Summary;
pressure: Summary;
temperature: Summary;
location: string;
type: string;
label: string;
last: number;
first: number;
ts: number;
});
