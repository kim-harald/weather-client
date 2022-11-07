import { ReadingStats } from "./weatherstats";


export type WeatherStats = {
    temperature: ReadingStats;
    pressure: ReadingStats;
    humidity: ReadingStats;
};
