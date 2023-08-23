import { Component, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService, EditingComponent } from '../../services/editable.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AnnotationType } from '../../services/api-schema';
import { Observable, Subscription } from 'rxjs';
import { CodePlain } from '../../entities/code-simple';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { LanguageService } from '../../services/language.service';
import { map, tap } from 'rxjs/operators';
import { nonEmptyLocalizableValidator } from '../../utils/validators';
import { UserService, availableLanguages } from '@mju-psi/yti-common-ui';
import { Annotation } from '../../entities/annotation';

@Component({
  selector: 'app-annotation',
  templateUrl: './annotation.component.html',
  styleUrls: ['./annotation.component.scss'],
  providers: [EditableService]
})
export class AnnotationComponent implements OnInit, EditingComponent {

  pageTitle = 'Annotation';
  annotation: Annotation;
  
  previouslySavedAnnotation: Annotation | undefined; // every time we just before saving, CS as it was last read from ES index goes here

  cloning = false;
  allLanguageCodes: CodePlain[];
  initialLanguageCodes: CodePlain[];
  availableLanguages: any;

  cancelSubscription: Subscription;
  
  annotationForm = new FormGroup({
    prefLabel: new FormControl({}, nonEmptyLocalizableValidator),
    description: new FormControl({})
  });

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private userService: UserService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());
    this.availableLanguages = availableLanguages;
    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  reset() {

    const { ...rest } = this.annotation;

    this.annotationForm.reset({
      ...rest
    });

  }

  ngOnInit() {
    this.doTheInit();
  }

  doTheInit(weJustSaved?: boolean) {
    const codeValue = this.activatedRoute.snapshot.params.codeValue;

    this.dataService.getLanguageCodes(this.languageService.language).subscribe(languageCodes => {
      this.allLanguageCodes = languageCodes;

      this.setDefaultLanguageCodes();

      this.dataService.getAnnotation(codeValue).subscribe(annotation => {
        this.annotation = annotation;
        this.locationService.atAnnotationPage(annotation);
        this.reset();
      });

    });
  }

  isEditing(): boolean {
    return this.editableService.editing;
  }

  cancelEditing(): void {
    this.editableService.cancel();
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
    return !this.allLanguageCodes || !this.annotation || !this.userService.user.superuser;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { validity, ...rest } = formData;
    const updatedAnnotation = this.annotation.clone();

    Object.assign(updatedAnnotation, {
      ...rest
    });

    const save = () => {
      this.previouslySavedAnnotation = this.annotation;
      return this.dataService.saveAnnotation(updatedAnnotation.serialize()).pipe(tap(() => {
        this.doTheInit(true);
      }));
    };

    return save();
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }
}
