import { Component, Input, OnInit, OnDestroy, Self, Optional } from '@angular/core';
import { Code } from '../../entities/code';
import { DataService } from '../../services/data.service';
import { LanguageService } from '../../services/language.service';
import { CodePlain } from '../../entities/code-simple';
import { ControlValueAccessor, FormControl, FormGroup, NgControl } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { CodeAnnotation } from '../../entities/codeAnnotation';
import { TranslateService } from '@ngx-translate/core';
import { SearchLinkedAnnotationModalService } from '../form/search-linked-annotation-modal.component';
import { Localizable, comparingLocalizable, ignoreModalClose } from '@mju-psi/yti-common-ui';
import { Annotation } from '../../entities/annotation';
import { Observable } from 'rxjs';
import { CodeAnnotationType } from '../../services/api-schema';
import { nonEmptyLocalizableValidator } from '../../utils/validators';

function addToControl<T>(control: FormControl, form: FormGroup, itemToAdd: CodeAnnotation) {

  form.addControl(getControleName(itemToAdd.annotation.codeValue), new FormControl({}, nonEmptyLocalizableValidator));
  const previous = control.value as T[];
  if (previous) {
    control.setValue([...previous, itemToAdd]);
  } else {
    control.setValue([itemToAdd]);
  }
}

function removeFromControl<T>(control: FormControl, form: FormGroup, itemToRemove: CodeAnnotation) {

  form.removeControl(itemToRemove.annotation.codeValue);
  const previous = control.value as CodeAnnotation[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

function getControleName(codeValue: string) {
  return 'annotation_'+ codeValue;
}

@Component({
  selector: 'app-code-annotations',
  templateUrl: './code-annotations.component.html',
  styleUrls: ['./code-annotations.component.scss']
})
export class CodeAnnotationsComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @Input() code: Code;
  @Input() languageCodes: CodePlain[];
  @Input() restrict = false;
  control = new FormControl([]);
  codeAnnotationForm: FormGroup = new FormGroup({
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


    this.codeAnnotationForm.valueChanges.subscribe(obj => {
      if (this.control.value) {
        this.control.value.forEach((codeAnnotation: CodeAnnotation) => {
          const key = getControleName(codeAnnotation.annotation.codeValue);
          const value = obj[key];
          codeAnnotation.value = value;
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
      values.forEach((codeAnnotation: CodeAnnotation) => {
        this.codeAnnotationForm.addControl(getControleName(codeAnnotation.annotation.codeValue), new FormControl({}, nonEmptyLocalizableValidator));
        if (codeAnnotation.value) {
          this.codeAnnotationForm?.get(getControleName(codeAnnotation.annotation.codeValue))?.setValue(codeAnnotation.value);
        }
      });
    }
  }

  ngOnDestroy(): void {

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

  get selectableCodeAnnotations(): CodeAnnotation[] {
    // return (this.control.value as CodeAnnotation[]).sort(comparingLocalizable<CodeAnnotation>(this.languageService, codeAnnotation => codeAnnotation.value ? codeAnnotation.value : {}));
    return (this.control.value as CodeAnnotation[]);
  }
  
  setCodeAnnotation(annotation: Annotation): CodeAnnotation {
    let value: Localizable = {};
    const codeAnnotationType: CodeAnnotationType = {
      codeId: this.code?.id,
      annotationId: annotation.id,
      annotation: annotation.serialize(),
      code: null,
      value: value
    };
    const codeAnnotation: CodeAnnotation = new CodeAnnotation(codeAnnotationType);
    return codeAnnotation;
  }

  addCodeAnnotation() {
    const titleLabel = this.translateService.instant('Select annotation');
    const searchlabel = this.translateService.instant('Search annotation');
    const restrictIds = this.selectableCodeAnnotations && this.selectableCodeAnnotations.length && this.selectableCodeAnnotations.map(codeAnnotation => codeAnnotation.annotationId) || [];

    this.searchLinkedAnnotationModalService.open(this.annotations, titleLabel, searchlabel, restrictIds, true)
      .then(annotation => addToControl(this.control, this.codeAnnotationForm, this.setCodeAnnotation(annotation)), ignoreModalClose);
  }

  removeCodeAnnotation(codeAnnotation: CodeAnnotation) {
    removeFromControl(this.control, this.codeAnnotationForm, codeAnnotation);
  }

  get annotations() {
    return this.annotations$;
  }

  get codeAnnotations(): CodeAnnotation[] {
    return this.control.value;
  }

  get show() {
    return this.editing || this.control.value;
  }

  get editing() {
    return this.editableService.editing && !this.restrict;
  }
}
