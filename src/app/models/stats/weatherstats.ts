import { Stat } from "./stat";
import { ReadingStat } from "./ReadingStats";
import { DateRange } from "../daterange";

export type WeatherStats = Stat & {
    dateRange: DateRange;
    location: string;
    temperature: ReadingStat;
    pressure: ReadingStat;
    humidity: ReadingStat;
    timestamp: number;
}
