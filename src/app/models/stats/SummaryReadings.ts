import { DateRange } from "../daterange";
import { Stat } from "./stat";
import { SummaryReading } from "./SummaryReading";


// export class SummaryReadings1 extends Stat {
//     data!: SummaryReading[];
//     location!: string;
//     dateRange!: DateRange;
// }

export type SummaryReadings = Stat & {
    data: SummaryReading[],
    location:string,
    dateRange:DateRange
}