import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Code } from '../../entities/code';
import { FormControl, FormGroup } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs/Subscription';
import { LanguageService } from '../../services/language.service';
import { validDateRange } from '../../utils/date';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Router } from '@angular/router';
import { CodeListErrorModalService } from '../common/error-modal.service';
import { TerminologyIntegrationModalService } from '../terminology-integration/terminology-integration-codescheme-modal.component';
import { Concept } from '../../entities/concept';
import { hasLocalization } from 'yti-common-ui/utils/localization';

@Component({
  selector: 'app-code-information',
  templateUrl: './code-information.component.html',
  styleUrls: ['./code-information.component.scss']
})
export class CodeInformationComponent implements OnChanges, OnDestroy {

  @Input() code: Code;

  cancelSubscription: Subscription;
  dev: boolean;

  codeForm = new FormGroup({
    prefLabel: new FormControl(''),
    description: new FormControl(''),
    definition: new FormControl(''),
    shortName: new FormControl(''),
    externalReferences: new FormControl(),
    validity: new FormControl(null, validDateRange),
    status: new FormControl(),
    conceptUriInVocabularies: new FormControl('')
  });

  constructor(private dataService: DataService,
              private userService: UserService,
              private router: Router,
              private errorModalService: CodeListErrorModalService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService,
              private terminologyIntegrationModalService: TerminologyIntegrationModalService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.dev = configuration.dev;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.reset();
  }

  reset() {
    const {externalReferences, startDate, endDate, ...rest} = this.code;

    this.codeForm.reset({
      ...rest,
      validity: {start: startDate, end: endDate},
      externalReferences: externalReferences.map(link => link.clone())
    });
  }

  get editing() {
    return this.editableService.editing;
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  get restricted() {
    if (this.isSuperUser) {
      return false;
    }
    return this.code.restricted;
  }

  ngOnDestroy() {
    this.cancelSubscription.unsubscribe();
  }

  openTerminologyModal() {
    this.terminologyIntegrationModalService.open(true).then(concept => this.putConceptStuffInPlace(concept), ignoreModalClose);
  }

  removeConceptUriInVocabularies() {
    this.code.conceptUriInVocabularies = '';
    this.codeForm.controls['conceptUriInVocabularies'].setValue('');
  }

  putConceptStuffInPlace(concept: Concept) {
    this.confirmationModalService.openOverWriteExistingValuesFromVocabularies()
      .then(() => {
        this.codeForm.patchValue({prefLabel: concept.prefLabel});
        this.codeForm.patchValue({definition: concept.definition});
      }, ignoreModalClose);
    this.code.conceptUriInVocabularies = concept.uri;
    this.codeForm.patchValue({conceptUriInVocabularies: concept.uri});
  }

  get isDev() {
    return this.dev;
  }
}
