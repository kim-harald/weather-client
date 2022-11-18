import { Column } from "angular-google-charts";
import { Mode } from "../models/mode";

export const kChartOptions: Record<Mode,kChartOptionsType> = {
    'humidity':{
        columns:['Time','Humidity'],
        // min:0,
        // max:100,
        colors:['blue']
    },
    'pressure': {
        columns:['Time','Pressure'],
        // min:900,
        // max:1100,
        colors:['yellow']

    },
    'temperature':{
        columns:['Time','Temperature'],
        // min:-10,
        // max:10,
        colors:['red']
    }
}

export type kChartOptionsType = {
    columns:Column[],
    min?:number,
    max?:number,
    colors:string[]
}