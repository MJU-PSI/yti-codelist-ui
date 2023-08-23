import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AnnotationType } from '../../services/api-schema';
import { Observable } from 'rxjs';
import { CodePlain } from '../../entities/code-simple';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { LanguageService } from '../../services/language.service';
import { map, tap } from 'rxjs/operators';
import { nonEmptyLocalizableValidator } from '../../utils/validators';
import { UserService, availableLanguages } from '@mju-psi/yti-common-ui';

@Component({
  selector: 'app-annotation-create',
  templateUrl: './annotation-create.component.html',
  styleUrls: ['./annotation-create.component.scss'],
  providers: [EditableService]
})
export class AnnotationCreateComponent implements OnInit {

  pageTitle = 'Create annotation';
  allLanguageCodes: CodePlain[];
  initialLanguageCodes: CodePlain[];
  availableLanguages: any;

  annotationForm = new FormGroup({
    codeValue: new FormControl('', [Validators.required, this.isCodeValuePatternValid], this.codeValueExistsValidator()),
    prefLabel: new FormControl({}, nonEmptyLocalizableValidator),
    description: new FormControl({})
  });

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private userService: UserService) {

    this.availableLanguages = availableLanguages;
    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    this.dataService.getLanguageCodes(this.languageService.language).subscribe(languageCodes => {
      this.allLanguageCodes = languageCodes;

      this.setDefaultLanguageCodes();
      this.locationService.atAnnotationCreatePage();
    });
  }

  setDefaultLanguageCodes() {
    let defaultLanguageCodes: CodePlain[];

    const languages: any[] = this.availableLanguages.map((lang: { code: any; }) => { return lang.code });
    defaultLanguageCodes = this.allLanguageCodes.filter(languageCode =>
      defaultLanguagesMatches(languages, languageCode)
    );

    this.initialLanguageCodes = defaultLanguageCodes;

    function defaultLanguagesMatches(languages: any, code: CodePlain) {
      let match: boolean = false;
      languages.forEach((lang: string) => {
        if (!match) {
          match = codeValueMatches(lang, code)
        }
      });
      return match;
    }

    function codeValueMatches(languageCode: string, code: CodePlain) {
      return code.codeValue === languageCode;
    }
  }

  get loading(): boolean {
    return !this.allLanguageCodes;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { languageCodes, ...rest } = formData;

    const annotation: AnnotationType = <AnnotationType>{
      ...rest
    };

    return this.dataService.createAnnotation(annotation);
  }

  isCodeValuePatternValid(control: AbstractControl) {
    const isCodeValueValid = control.value.match(/^[a-zA-Z0-9_\-]*$/);
    return !isCodeValueValid ? { 'codeValueValidationError': { value: control.value } } : null;
  }

  codeValueExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const codeValue = control.value;
      const validationError = {
        annotationCodeValueExists: {
          valid: false
        }
      };
      return this.dataService.annotationCodeValueExists(codeValue)
        .pipe(map(exists => exists ? validationError : null));
    };
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  handleLanguageCodesChangedEvent(updatedLanguageCodes: CodePlain[]) {
    this.initialLanguageCodes = updatedLanguageCodes;
  }
}
