import { Stat } from "./stat";
import { Summary } from "./Summary";


// export class SummaryReading1 extends Stat {
//     when!: number;
//     label!: string;
//     type!: string;
//     location!: string;
//     temperature!: Summary;
//     humidity!: Summary;
//     pressure!: Summary;

//     constructor() {
//         super();
//         this.when = 0;
//     }
// }
 export type SummaryReading = Stat & {
    when:number,
    first:number,
    last:number,
    label:string,
    type:string,
    location:string,
    temperature:Summary,
    pressure:Summary,
    humidity:Summary
 }
