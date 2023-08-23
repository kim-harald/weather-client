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

export const WeatherStatsEmpty = {
    dateRange : DateRange.All,
    temperature : { 
     max: { temperature : 0, pressure:0, humidity:0 },
     min: { temperature : 0, pressure:0, humidity:0 },
     mean: 0
    },
    pressure : { 
     max: { temperature : 0, pressure:0, humidity:0 },
     min: { temperature : 0, pressure:0, humidity:0 },
     mean: 0
    },
    humidity : { 
     max: { temperature : 0, pressure:0, humidity:0 },
     min: { temperature : 0, pressure:0, humidity:0 },
     mean: 0
    }
 } as WeatherStats;

 export const isWeatherStatsNull = (weatherStats:WeatherStats):boolean => {
    const isTempNull = weatherStats.temperature.mean == null;
    const isPressureNull = weatherStats.pressure.mean == null;
    const isHumidityNull = weatherStats.humidity.mean == null;
  
    return isTempNull || isPressureNull || isHumidityNull;
  }
