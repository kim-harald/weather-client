import { Stat } from './stat';
import { Summary } from './Summary';

export type SummaryReading = Stat & {
  when: number;
  first: number;
  last: number;
  label: string;
  type: string;
  location: string;
  temperature: Summary;
  pressure: Summary;
  humidity: Summary;
};
