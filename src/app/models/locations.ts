import { Stat } from "./stats/stat";

// export class Locations extends Stat {
//     data: string[] = [];
// }

export type Locations = Stat & {
    data: string[]
}
