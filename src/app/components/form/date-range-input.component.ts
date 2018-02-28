import { Component, Input, Optional, Self, ViewChild } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { FormControl, NgControl } from '@angular/forms';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { DateRange, formatDisplayDate, fromPickerDate, toPickerDate } from '../../utils/date';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-date-range-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label>{{label}}</label>
      </dt>
      <dd>
        <div *ngIf="editing">

          <div class="row">
            <div class="col-md-6">
              <dl>
                <dt translate>Start date</dt>
                <dd>
                  <div class="input-group">
                    <input class="form-control"
                           placeholder="yyyy-mm-dd"
                           [formControl]="startControl"
                           ngbDatepicker
                           #startDate="ngbDatepicker">
                    <button class="input-group-addon icon-calendar" (click)="startDate.toggle()" type="button"></button>
                  </div>
                </dd>
              </dl>
            </div>
            
            <div class="col-md-6">
              <dl>
                <dt translate>End date</dt>
                <dd>
                  <div class="input-group">
                    <input class="form-control"
                           placeholder="yyyy-mm-dd"
                           [formControl]="endControl"
                           ngbDatepicker
                           #endDate="ngbDatepicker">
                    <button class="input-group-addon icon-calendar" (click)="endDate.toggle()" type="button"></button>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <span *ngIf="!editing">{{displayName}}</span>
      </dd>
    </dl>
  `
})
export class DateRangeInputComponent {

  @ViewChild('startDate') startDate: NgbInputDatepicker;
  @ViewChild('endDate') endDate: NgbInputDatepicker;

  @Input() label: string;
  @Input() restrict = false;

  startControl = new FormControl();
  endControl = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    Observable.combineLatest(this.startControl.valueChanges, this.endControl.valueChanges)
      .subscribe(() => this.propagateChange(this.value));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get show() {
    return this.editing || this.displayName;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  get displayName() {
    const start = formatDisplayDate(fromPickerDate(this.startControl.value));
    const end = formatDisplayDate(fromPickerDate(this.endControl.value));
    return (start || end) ? start + ' - ' + end : '';
  }

  get value(): DateRange {
    return {
      start: fromPickerDate(this.startControl.value),
      end: fromPickerDate(this.endControl.value)
    };
  }

  writeValue(obj: DateRange): void {
    if (obj) {
      this.startControl.setValue(toPickerDate(obj.start));
      this.endControl.setValue(toPickerDate(obj.end));
    } else {
      this.startControl.setValue(null);
      this.endControl.setValue(null);
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
