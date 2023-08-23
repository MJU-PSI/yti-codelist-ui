import { Component, Input, OnInit, OnDestroy, Self, Optional } from '@angular/core';
import { CodeScheme } from '../../entities/code-scheme';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { CodeSchemeAnnotation } from '../../entities/codeSchemeAnnotation';
import { TranslateService } from '@ngx-translate/core';
import { SearchLinkedAnnotationModalService } from '../form/search-linked-annotation-modal.component';
import { Localizable, comparingLocalizable, ignoreModalClose } from '@mju-psi/yti-common-ui';
import { Annotation } from '../../entities/annotation';
import { Observable } from 'rxjs';
import { CodeSchemeAnnotationType } from '../../services/api-schema';
import { nonEmptyLocalizableValidator } from '../../utils/validators';

function addToControl<T>(control: FormControl, form: FormGroup, itemToAdd: CodeSchemeAnnotation) {

  form.addControl(getControleName(itemToAdd.annotation.codeValue), new FormControl({}, nonEmptyLocalizableValidator));
  const previous = control.value as T[];
  if (previous) {
    control.setValue([...previous, itemToAdd]);
  } else {
    control.setValue([itemToAdd]);
  }
}

function removeFromControl<T>(control: FormControl, form: FormGroup, itemToRemove: CodeSchemeAnnotation) {

  form.removeControl(itemToRemove.annotation.codeValue);
  const previous = control.value as CodeSchemeAnnotation[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

function getControleName(codeValue: string) {
  return 'annotation_'+ codeValue;
}

@Component({
  selector: 'app-code-scheme-annotations',
  templateUrl: './code-scheme-annotations.component.html',
  styleUrls: ['./code-scheme-annotations.component.scss']
})
export class CodeSchemeAnnotationsComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @Input() codeScheme: CodeScheme;
  @Input() languageCodes: CodePlain[];
  @Input() restrict = false;
  control = new FormControl([]);
  codeSchemeAnnotationForm: FormGroup = new FormGroup({
    description: new FormControl({}),
  });

  annotations$: Observable<Annotation[]>;

  loading = false;

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private languageService: LanguageService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedAnnotationModalService: SearchLinkedAnnotationModalService,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(x => {
      this.propagateChange(x);
    });


    this.codeSchemeAnnotationForm.valueChanges.subscribe(obj => {
      if (this.control.value) {
        this.control.value.forEach((codeSchemeAnnotation: CodeSchemeAnnotation) => {
          const key = getControleName(codeSchemeAnnotation.annotation.codeValue);
          const value = obj[key];
          codeSchemeAnnotation.value = value;
        });
      }
    }
  );

    if (parentControl) {
      parentControl.valueAccessor = this;
    }

    this.annotations$ = this.dataService.getAnnotations(undefined, undefined);
  }

  ngOnInit() {
    if (this.control.value) {
      let values = this.control.value.map((x: any) => Object.assign({}, x));
      values.forEach((codeSchemeAnnotation: CodeSchemeAnnotation) => {
        this.codeSchemeAnnotationForm.addControl(getControleName(codeSchemeAnnotation.annotation.codeValue), new FormControl({}, nonEmptyLocalizableValidator));
        if (codeSchemeAnnotation.value) {
          this.codeSchemeAnnotationForm?.get(getControleName(codeSchemeAnnotation.annotation.codeValue))?.setValue(codeSchemeAnnotation.value);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  onChanges(): void {

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

  get selectableCodeSchemeAnnotations(): CodeSchemeAnnotation[] {
    // return (this.control.value as CodeSchemeAnnotation[]).sort(comparingLocalizable<CodeSchemeAnnotation>(this.languageService, codeSchemeAnnotation => codeSchemeAnnotation.value ? codeSchemeAnnotation.value : {}));
    return (this.control.value as CodeSchemeAnnotation[]);
  }
  
  setCodeSchemeAnnotation(annotation: Annotation): CodeSchemeAnnotation {
    let value: Localizable = {};
    const codeSchemeAnnotationType: CodeSchemeAnnotationType = {
      codeschemeId: this.codeScheme?.id,
      annotationId: annotation.id,
      annotation: annotation.serialize(),
      codescheme: null,
      value: value
    };
    const codeSchemeAnnotation: CodeSchemeAnnotation = new CodeSchemeAnnotation(codeSchemeAnnotationType);
    return codeSchemeAnnotation;
  }

  addCodeSchemeAnnotation() {
    const titleLabel = this.translateService.instant('Select annotation');
    const searchlabel = this.translateService.instant('Search annotation');
    const restrictIds = this.selectableCodeSchemeAnnotations && this.selectableCodeSchemeAnnotations.length && this.selectableCodeSchemeAnnotations.map(codeSchemeAnnotation => codeSchemeAnnotation.annotationId) || [];

    this.searchLinkedAnnotationModalService.open(this.annotations, titleLabel, searchlabel, restrictIds, true)
      .then(annotation => addToControl(this.control, this.codeSchemeAnnotationForm, this.setCodeSchemeAnnotation(annotation)), ignoreModalClose);
  }

  removeCodeSchemeAnnotation(codeSchemeAnnotation: CodeSchemeAnnotation) {
    removeFromControl(this.control, this.codeSchemeAnnotationForm, codeSchemeAnnotation);
  }

  get annotations() {
    return this.annotations$;
  }

  get codeSchemeAnnotations(): CodeSchemeAnnotation[] {
    return this.control.value;
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }
}
