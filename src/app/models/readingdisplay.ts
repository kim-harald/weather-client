import { LocationReading } from './locationreading';

export type ReadingDisplay = LocationReading & {
  when: Date;
};
