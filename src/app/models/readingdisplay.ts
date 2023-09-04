import { Reading } from "../openapi";

export type ReadingDisplay = Reading & {
  when: Date | string;
};
