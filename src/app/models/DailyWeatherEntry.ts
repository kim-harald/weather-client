import { Summary } from "./Summary";


export type DailyWeatherEntry = {
    when: number;
    temperature: Summary;
    pressure: Summary;
    humidity: Summary;
};
