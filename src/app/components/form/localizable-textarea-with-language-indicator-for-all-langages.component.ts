import { Component, Input, OnChanges, OnInit, Optional, Self, SimpleChange, SimpleChanges } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { Localizable } from 'yti-common-ui/types/localization';
import { CodePlain } from '../../entities/code-simple';

@Component({
  selector: 'app-localizable-textarea-with-language-indicator-for-all-languages',
  styleUrls: ['./localizable-textarea-with-language-indicator-for-all-langages.component.scss'],
  template: `
    <dl *ngIf="show && contentLanguage !== 'all'">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <div class="language">
            <span>{{contentLanguage | uppercase}}</span>
          </div>
          <div class="languageContent">
            <textarea [id]="id"
                      type="text"
                      class="form-control"
                      [ngClass]="{'is-invalid': !valid}"
                      [ngModel]="value[contentLanguage]"
                      (ngModelChange)="onChange($event)">
            </textarea>
          </div>
          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <div class="text-content-wrap" *ngIf="!editing">
          <div class="language">
            <span>{{contentLanguage | uppercase}}</span>
          </div>
          <div class="languageContent">
            <span>{{value | translateValue}}</span>
          </div>
        </div>
      </dd>
    </dl>


    <dl *ngIf="show && contentLanguage === 'all'">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <div *ngFor="let lang of realLanguageCodes" class="multi-lang-repeat-textarea">

            <div class="language">
              <span>{{lang.codeValue | uppercase}}</span>
            </div>
            <div class="languageContent">
              <textarea [id]="lang.id"
                        type="text"
                        class="form-control"
                        [ngClass]="{'is-invalid': !valid}"
                        [ngModel]="value[lang.codeValue]"
                        (ngModelChange)="onChange($event, lang)">
              </textarea>
            </div>

          </div>


          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <div class="text-content-wrap" *ngIf="!editing">
          <div *ngFor="let lang of realLanguageCodes" class="multi-lang-repeat-textarea">
            <div class="language">
              <span>{{lang.codeValue | uppercase}}</span>
            </div>
            <div class="languageContent">
              <span>{{value[lang.codeValue]}}</span>
            </div>
          </div>
        </div>
      </dd>
    </dl>
  `
})
export class LocalizableTextareaWithLanguageIndicatorForAllLangagesComponent implements ControlValueAccessor, OnInit, OnChanges {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() id: string;
  @Input() infoText: string;
  @Input() parentElementsLanguageCodes: CodePlain[] = [];
  value: Localizable = {};
  realLanguageCodes: CodePlain[] = [];

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private languageService: LanguageService) {

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  ngOnInit() {

    if (this.realLanguageCodes && this.realLanguageCodes.length === 0 && this.parentElementsLanguageCodes) {
      this.parentElementsLanguageCodes.forEach(lang => {
        if (lang.codeValue !== 'all') {
          this.realLanguageCodes.push(lang);
        }
      });
      this.realLanguageCodes.sort((a, b) => a.codeValue < b.codeValue ? -1 : 1);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    const langs: SimpleChange = changes.parentElementsLanguageCodes;
    if (langs) {
      this.realLanguageCodes = langs.currentValue;
    }
  }

  get valid() {
    return !this.parentControl || this.parentControl.valid;
  }

  onChange(value: string, language?: CodePlain) {
    let langVar = this.contentLanguage;

    if (!!language) {
      langVar = language.codeValue;
    }

    this.value[langVar] = value;
    this.propagateChange(this.value);
  }

  get show() {
    return this.editing || this.languageService.translate(this.value);
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
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