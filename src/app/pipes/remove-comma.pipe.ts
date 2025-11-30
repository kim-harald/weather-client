import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeComma',
  standalone: true
})
export class RemoveCommaPipe implements PipeTransform {

  transform(value: string | null): unknown {
    if (value !== undefined && value !== null) {
      return value.replace(/,/g, "");
    } else {
      return "";
    }
  }
}
