import { Summary } from "./stats/Summary";


export type DailyWeatherEntry = {
    when: number;
    temperature: Summary;
    pressure: Summary;
    humidity: Summary;
};
