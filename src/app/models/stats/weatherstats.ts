import { DateRange } from "../daterange";
import { Stat } from "./stat";
import { ReadingStats } from "./ReadingStats";

// export class WeatherStats extends Stat {
//     dateRange!: DateRange;
//     location!: string;
//     temperature!: ReadingStats;
//     pressure!: ReadingStats;
//     humidity!: ReadingStats;
//     timestamp!: number;

//     public toString(): string {
//         return `${this.dateRange.toString()};${this.location};${this.temperature?.toString()}; ${this.pressure?.toString()}; ${this.humidity?.toString()}`;
//     }
// }

export type WeatherStats = Stat & {
    dateRange: DateRange;
    location: string;
    temperature: ReadingStats;
    pressure: ReadingStats;
    humidity: ReadingStats;
    timestamp: number;
}
