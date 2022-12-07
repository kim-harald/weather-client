export class DateRange {
    public static get All(): DateRange {
        return new DateRange(new Date(0, 0, 0, 0, 0, 0), new Date(9999, 12, 31, 23, 59, 59));
    }
    start: Date;
    end: Date;

    constructor(start: Date, end: Date) {
        this.start = start; this.end = end;
    }

    public get isValid(): boolean {
        return !(this.start === undefined || this.end === undefined) ||
            this.start > this.end;
    }

    public toString(): string {
        return this.isValid ? `${this.start.toDateString()};${this.end.toDateString()}` : 'invalid';
    }
}
