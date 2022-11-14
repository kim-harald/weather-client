import { Reading } from "../models/reading";

export const cKelvinOffset = 273.15;

export const int2BoolList = (num: number): Array<boolean> => {
    let result = new Array<boolean>();
    for (let n = 0; n < 8; n++) {
        result.push(Boolean(num & (1 << n)));
    }
    return result;
}

export const toKelvin = (celcius: number): number => {
    return celcius + cKelvinOffset;
}

export const toCelsius = (kelvin: number): number => {
    return kelvin - cKelvinOffset;
}

export function prop<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}

export const delay = (ms: number): Promise<void> => {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export const rounded = (v: number, n: number): number => {
    const factorOfTen = Math.pow(10, n);
    return Math.round(v * factorOfTen) / factorOfTen;
}

export const sortReadings = (a: Reading, b: Reading): number => {
    return a?.ts - b?.ts ?? 0;
}

export const unique = (arr: any[]): string[] => {
    const result = arr.filter((item, i, arr) => arr.findIndex(t => t === item) === i);
    return result as string[];
}

export const proper = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export const getStandardDeviation = (array: number[]): number => {
    const n = array.length;
    const m = mean(array);
    return Math.sqrt(array.map(x => Math.pow(x - m, 2)).reduce((a, b) => a + b) / n);
}

export const mean = (array: number[]): number => {
    return array.reduce((a, b) => a + b) / array.length;
}

export const normaliseReading = (reading: Reading): Reading => {
    const r1 = normalise(reading.temperature ?? 0, reading.pressure ?? 0, reading.humidity ?? 0);
    return {
        ...reading,
        temperature: r1.temperature,
        pressure: r1.pressure,
        humidity: r1.humidity
    }
}

export const normalise = (temperature: number, pressure: number, humidity: number)
    : { temperature: number, pressure: number, humidity: number } => {
    return {
        temperature: temperature - cKelvinOffset,
        pressure: pressure / 100,
        humidity: humidity
    };
}

export const padLeft = (s:string, paddingValue:string) => {
    return String( + s).slice(-paddingValue.length);
}

export const trendline = (points:{x:number,y:number}[]):{a:number,b:number} => {
    const n = points.length;
    let sigmaXY = 0;
    let sigmaX = 0;
    let sigmaY = 0;
    let sigmaX2 = 0;
    for(let point of points) {
        sigmaXY += point.x * point.y;
        sigmaX2 += point.x * point.x;
        sigmaX += point.x;
        sigmaY += point.y;
    }

    if ((sigmaX2-sigmaX*sigmaX) !== 0) {
        const alpha = (n * sigmaXY - sigmaX * sigmaY) / (n * sigmaX2-sigmaX*sigmaX);
        const beta = (sigmaY - alpha * sigmaX) / n;
    
        return {a:beta, b:alpha};
    }

    return {a:0,b:0};
    
}