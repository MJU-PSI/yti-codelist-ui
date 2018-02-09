import { Component, Input, Optional, Self, ViewChild } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { FormControl, NgControl } from '@angular/forms';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-input',
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
      </dt>
      <dd>
        <div class="input-group">
          <input class="form-control"
                 placeholder="yyyy-mm-dd"
                 [formControl]="control"
                 ngbDatepicker
                 #date="ngbDatepicker">
          <button class="input-group-addon icon-calendar" (click)="date.toggle()" type="button"></button>
          
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
      </dd>
    </dl>
  `
})
export class DateInputComponent {

  @ViewChild('date') date: NgbInputDatepicker;

  @Input() label: string;
  @Input() restrict = false;
  control = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }

  writeValue(obj: any): void {
    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}