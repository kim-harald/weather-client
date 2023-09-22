import { Subscription } from 'rxjs';
import { Reading, StatSpan, SummaryReading, WeatherStats } from '@openapi';
import './string.extensions';
import { Mode, Modes } from '../models/mode';
import { DataRow } from '../models/datarow';
import { SummaryType } from '../models/SummaryType';
import { DateRange } from '../models/daterange';

export const cKelvinOffset = 273.15;

export const int2BoolList = (num: number): Array<boolean> => {
  let result = new Array<boolean>();
  for (let n = 0; n < 8; n++) {
    result.push(Boolean(num & (1 << n)));
  }
  return result;
};

export const toKelvin = (celcius: number): number => {
  return celcius + cKelvinOffset;
};

export const toCelsius = (kelvin: number): number => {
  return kelvin - cKelvinOffset;
};

export function prop<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

export const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const rounded = (v: number, n: number): number => {
  const factorOfTen = Math.pow(10, n);
  return Math.round(v * factorOfTen) / factorOfTen;
};

export const sortReadings = (a: Reading, b: Reading): number => {
  return a?.ts - b?.ts ?? 0;
};

export const unique = (arr: any[]): string[] => {
  const result = arr.filter(
    (item, i, arr) => arr.findIndex((t) => t === item) === i
  );
  return result as string[];
};

export const proper = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const getStandardDeviation = (array: number[]): number => {
  const n = array.length;
  const m = mean(array);
  return Math.sqrt(
    array.map((x) => Math.pow(x - m, 2)).reduce((a, b) => a + b) / n
  );
};

export const mean = (array: number[]): number => {
  return array.reduce((a, b) => a + b) / array.length;
};

export const normaliseReading = (reading: Reading): Reading => {
  reading ??= {
    humidity: 0,
    temperature: cKelvinOffset,
    pressure: 0,
    ts: 0,
    id: '',
  } as Reading;
  const r1 = normalise(
    reading.temperature ?? 0,
    reading.pressure ?? 0,
    reading.humidity ?? 0
  );
  return {
    ...reading,
    temperature: r1.temperature,
    pressure: r1.pressure,
    humidity: r1.humidity,
  };
};

export const normalise = (
  temperature: number,
  pressure: number,
  humidity: number
): { temperature: number; pressure: number; humidity: number } => {
  return {
    temperature: (temperature ?? cKelvinOffset) - cKelvinOffset,
    pressure: (pressure ?? 0) / 100,
    humidity: humidity ?? 0,
  };
};

export const trendline = (
  points: { x: number; y: number }[]
): { a: number; b: number } => {
  const n = points.length;
  let sigmaXY = 0;
  let sigmaX = 0;
  let sigmaY = 0;
  let sigmaX2 = 0;
  for (let point of points) {
    sigmaXY += point.x * point.y;
    sigmaX2 += point.x * point.x;
    sigmaX += point.x;
    sigmaY += point.y;
  }

  if (sigmaX2 - sigmaX * sigmaX !== 0) {
    const alpha =
      (n * sigmaXY - sigmaX * sigmaY) / (n * sigmaX2 - sigmaX * sigmaX);
    const beta = (sigmaY - alpha * sigmaX) / n;

    return { a: beta, b: alpha };
  }

  return { a: 0, b: 0 };
};

export const convertTime = (ts: number): string => {
  const d = new Date(ts);
  // const offset = d.getTimezoneOffset();
  // d.setMinutes(d.getMinutes() - offset);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return hh + ':' + mm;
};

export const convertDate = (ts: number): string => {
  const d = new Date(ts);
  const dd = d.getDate();
  const mm = d.getMonth() + 1;
  const yy = d.getFullYear().toString().slice(2);

  return dd + '.' + mm + '.' + yy;
};

export const normaliseSummary = (
  summaryReading: SummaryReading
): SummaryReading => {
  const max = normalise(
    summaryReading.temperature.max,
    summaryReading.pressure.max,
    summaryReading.humidity.max
  );
  const min = normalise(
    summaryReading.temperature.min,
    summaryReading.pressure.min,
    summaryReading.humidity.min
  );
  const mean = normalise(
    summaryReading.temperature.mean,
    summaryReading.pressure.mean,
    summaryReading.humidity.mean
  );

  return {
    ...summaryReading,
    temperature: {
      max: max.temperature,
      min: min.temperature,
      mean: mean.temperature,
    },
    pressure: {
      max: max.pressure,
      min: min.pressure,
      mean: mean.pressure,
    },
    humidity: {
      max: max.humidity,
      min: min.humidity,
      mean: mean.humidity,
    },
  };
};

/*
<param></param>
*/
export const normaliseWeatherStats = (
  weatherStat: WeatherStats
): WeatherStats => {
  const maxT = normaliseReading(weatherStat.temperature.max);
  const minT = normaliseReading(weatherStat.temperature.min);
  const maxP = normaliseReading(weatherStat.pressure.max);
  const minP = normaliseReading(weatherStat.pressure.min);
  const maxH = normaliseReading(weatherStat.humidity.max);
  const minH = normaliseReading(weatherStat.humidity.min);
  const mean = normalise(
    weatherStat.temperature.mean,
    weatherStat.pressure.mean,
    weatherStat.humidity.mean
  );

  return {
    ...weatherStat,
    temperature: {
      ...weatherStat.temperature,
      min: minT,
      max: maxT,
      mean: mean.temperature,
    },
    pressure: {
      ...weatherStat.pressure,
      min: minP,
      max: maxP,
      mean: mean.pressure,
    },
    humidity: {
      ...weatherStat.humidity,
      min: minH,
      max: maxH,
      mean: mean.humidity,
    },
  };
};

export const unsubscribeAll = (
  subscriptions: Record<string, Subscription>
) => {
  Object.keys(subscriptions).forEach(key => {
    const subscription = subscriptions[key];
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
    }
  });
};

export const convertToDataRows = (
  data: Reading[] | SummaryReading[],
  location: string,
  summaryType: SummaryType
): Record<Mode, DataRow[]> => {
  const result: Record<Mode, DataRow[]> = {
    temperature: [],
    humidity: [],
    pressure: [],
  };

  if (!data || data.length === 0) {
    return result;
  }
  const items = 
    summaryType === '5min'
      ? (data as Reading[]).filter(item => item.location === location)
      : (data as SummaryReading[]).filter(item => item.location === location);

  Modes.forEach((s) => {
    const mode = s as Mode;
    const values = items.map((item: any) => {
      switch (summaryType) {
        case '5min':
          return {
            when: convertTime((item as Reading).ts),
            value: convertValue(mode, (item as any)[mode]),
          };
        case 'hour':
          return {
            when: convertTime((item as any).ts),
            value: [
              convertValue(mode, (item as any)[mode]?.max ?? 0),
              convertValue(mode, (item as any)[mode]?.mean ?? 0),
              convertValue(mode, (item as any)[mode]?.min ?? 0),
            ],
          };
        case 'day':
          return {
            when: convertDate((item as any).ts),
            value: [
              convertValue(mode, (item as any)[mode]?.max ?? 0),
              convertValue(mode, (item as any)[mode]?.mean ?? 0),
              convertValue(mode, (item as any)[mode]?.min ?? 0),
            ],
          };
      }
    });
    result[mode] = values;
  });

  return result;
};

export const convertValue = (mode: Mode, value: number): number => {
  switch (mode) {
    case Mode.humidity:
      return value;
    case Mode.pressure:
      return rounded(value / 100, 0);
    case Mode.temperature:
      return value !== 0 ? rounded(value - cKelvinOffset, 1) : 0;
  }
};

export const rotate = (
  values: any[],
  value: any,
  limit: number = 30
): any[] => {
  values ??= [];
  values.push(value);
  if (values.length > limit) {
    values.splice(0, 1);
  }
  //console.info(values);
  return values;
};

export const getDateRange = (statspan: StatSpan): DateRange => {
  const endDate = new Date();
  const startDate = new Date();
  switch (statspan) {
    case StatSpan.ALL: {
      return new DateRange(new Date(0, 0, 0), endDate);
    }

    case StatSpan._90DAYS: {
      startDate.setDate(startDate.getDate() - 90);
      break;
    }

    case StatSpan._30DAYS: {
      startDate.setDate(startDate.getDate() - 24);
      break;
    }

    case StatSpan._24HRS: {
      startDate.setHours(startDate.getHours() - 24);
    }
  }

  return new DateRange(startDate, endDate);
}

export const getRange = (
  values: number[],
  multiplier: number = 5
): { min: number; max: number } => {
  const min = Math.min(...values);
  const max = Math.max(...values);

  return {
    min: Math.floor(min / multiplier) * multiplier,
    max: Math.ceil(max / multiplier) * multiplier,
  };
};