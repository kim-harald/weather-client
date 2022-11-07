import { Summary } from "./Summary";


export type SummaryReading = {
    when: number;
    label: string;
    temperature: Summary;
    humidity: Summary;
    pressure: Summary;
};
