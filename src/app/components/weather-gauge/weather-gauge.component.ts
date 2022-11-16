import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-weather-gauge',
  templateUrl: './weather-gauge.component.html',
  styleUrls: ['./weather-gauge.component.scss'],
})
export class WeatherGaugeComponent
  implements OnInit, AfterViewInit, AfterContentInit {
  constructor() { }
  ngAfterContentInit(): void { }
  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.update(this._value);
  }

  @ViewChild('gauge', { static: true })
  canvas: ElementRef<HTMLCanvasElement> = {} as ElementRef;

  @Input()
  public min: number = 0;

  @Input()
  public max: number = 100;

  @Input()
  public units: string = 'C';

  @Input()
  public color: string = '#FF0000';

  @Input()
  public get value(): number {
    return this._value;
  }

  @Input()
  public set delta(v: number) {
    this._delta = v;
    this.updateDelta(v);
  }

  public get delta(): number {
    return this._delta;
  }

  public set value(v: number) {
    this._value = v;
    this.update(v);
    this.updateDelta(this._delta);
  }

  public visibility = 'hidden';

  private ctx: CanvasRenderingContext2D | undefined | null;
  private _value: number = 0;
  private _delta: number = 0;

  ngOnInit(): void { }

  private update(v: number): void {
    if (this.ctx) {
      this.ctx.clearRect(1, 1, 230, 120);
      this.ctx.beginPath();

      const endAngle = 180 + ((v - this.min) / (this.max - this.min)) * 180;

      annulus(this.ctx, 115, 120, 20, 100, 180, endAngle, false, this.color);
      this.ctx.save();
    }

    this.visibility = 'visible';
    setTimeout(() => {
      this.visibility = 'hidden';
    }, 2000);
  }

  private updateDelta(delta: number): void {
    let isFlip = false;
    if (this.ctx) {
      let angle = 0;
      let deltaColor = 'green';
      if (delta > 0) {
        angle = 0;
        deltaColor = 'green';
      } else if (delta === 0) {
        deltaColor = 'transparent';
      } else {
        angle = 0;
        isFlip = true;
        deltaColor = 'red';
      }

      triangle(this.ctx, 115, 60, 20, angle, deltaColor,isFlip);
    }
  }
}

const annulus = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  anticlockwise: boolean,
  color: string
) => {
  ctx.lineWidth = width; //width;
  let r = width * 0.65;

  var th1 = (startAngle * Math.PI) / 180;
  var th2 = (endAngle * Math.PI) / 180;

  ctx.arc(centerX, centerY, radius, th1, th2, anticlockwise);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.stroke();
};

const triangle = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  color: string,
  isFlip: boolean = false
) => {
  const p1 = [0, -radius];
  const p2 = [radius * Math.cos(Math.PI / 6), radius * Math.sin(Math.PI / 6)];
  const p3 = [-radius * Math.cos(Math.PI / 6), radius * Math.sin(Math.PI / 6)];

  ctx.save();
  ctx.translate(centerX, centerY);
  
  if (isFlip) {
    ctx.scale(1, -1);
  }

  ctx.rotate(angle * (Math.PI / 180));

  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.translate(-centerX, -centerY);
  ctx.restore();
};

