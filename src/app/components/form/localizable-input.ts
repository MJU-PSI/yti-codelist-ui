import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { Localizable } from 'yti-common-ui/types/localization';

@Component({
  selector: 'app-localizable-input',
  template: `
    <dl *ngIf="show">
      <dt><label>{{label}}</label></dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <input type="text" 
                 class="form-control"
                 [ngClass]="{'is-invalid': !valid}"
                 [ngModel]="value[contentLanguage]" 
                 (ngModelChange)="onChange($event)" />
          <app-error-messages [control]="parentControl"></app-error-messages>
        </div>
        <span *ngIf="!editing">{{value | translateValue}}</span>
      </dd>
    </dl>
  `
})
export class LocalizableInputComponent implements ControlValueAccessor {

  @Input() label: string;
  value: Localizable = {};

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private languageService: LanguageService) {

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get valid() {
    return !this.parentControl || this.parentControl.valid;
  }

  onChange(value: string) {
    this.value[this.contentLanguage] = value;
    this.propagateChange(this.value);
  }

  get show() {
    return this.editing || this.languageService.translate(this.value);
  }

  get editing() {
    return this.editableService.editing;
  }

  get contentLanguage() {
    return this.languageService.contentLanguage;
  }

  writeValue(obj: any): void {
    this.value = Object.assign({}, obj);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }
}
