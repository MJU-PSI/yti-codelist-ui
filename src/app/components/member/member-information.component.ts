import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { UserService } from 'yti-common-ui/services/user.service';
import { DataService } from '../../services/data.service';
import { CodeListConfirmationModalService } from '../common/confirmation-modal.service';
import { Member } from '../../entities/member';
import { Extension } from '../../entities/extension';
import { LocationService } from '../../services/location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CodeScheme } from '../../entities/code-scheme';
import { validDateRange } from '../../utils/date';
import { Code } from '../../entities/code';
import { MemberValue } from '../../entities/member-value';
import { ValueType } from '../../entities/value-type';

@Component({
  selector: 'app-member-information',
  templateUrl: './member-information.component.html',
  styleUrls: ['./member-information.component.scss']
})
export class MemberInformationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() currentMember: Member;

  extension: Extension;
  env: string;

  cancelSubscription: Subscription;

  memberForm = new FormGroup({
    prefLabel: new FormControl({}),
    unaryOperator: new FormControl('', [this.isUnaryOperatorRequired.bind(this), this.isUnaryOperatorPatternValid.bind(this)]),
    comparisonOperator: new FormControl('', [this.isComparisonOperatorRequired.bind(this), this.isComparisonOperatorPatternValid.bind(this)]),
    code: new FormControl(null, Validators.required),
    relatedMember: new FormControl(null),
    validity: new FormControl(null, validDateRange)
  });

  constructor(private route: ActivatedRoute,
              private router: Router,
              private locationService: LocationService,
              private dataService: DataService,
              private userService: UserService,
              private confirmationModalService: CodeListConfirmationModalService,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  ngOnInit() {

    const registryCodeValue = this.route.snapshot.params.registryCode;
    const schemeCodeValue = this.route.snapshot.params.schemeCode;
    const extensionCodeValue = this.route.snapshot.params.extensionCode;
    const memberId = this.route.snapshot.params.memberId;

    if (!memberId || !registryCodeValue || !schemeCodeValue || !extensionCodeValue) {
      throw new Error(`Illegal route, memberId: '${memberId}', registry: '${registryCodeValue}', ` +
        `scheme: '${schemeCodeValue}', extension: '${extensionCodeValue}'`);
    }

    this.dataService.getMember(memberId).subscribe(extension => {
      this.currentMember = extension;
      this.locationService.atMemberPage(extension);
    });

    this.dataService.getExtension(registryCodeValue, schemeCodeValue, extensionCodeValue).subscribe(extension => {
      this.extension = extension;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.reset();
  }

  getValueFromMemberValues(memberValues: MemberValue[], localName: string): string | undefined {

    let value: string | undefined;
    memberValues.forEach(memberValue => {
      if (memberValue.valueType.localName === localName) {
        value = memberValue.value;
      }
    });
    return value;
  }

  reset() {

    const { startDate, endDate, memberValues, ...rest } = this.currentMember;

    const unaryOperator: string | undefined = this.getValueFromMemberValues(memberValues, 'unaryOperator');
    const comparisonOperator: string | undefined = this.getValueFromMemberValues(memberValues, 'comparisonOperator');

    this.memberForm.reset({
      ...rest,
      unaryOperator: unaryOperator,
      comparisonOperator: comparisonOperator,
      validity: { start: startDate, end: endDate }
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
    return this.currentMember.extension.restricted;
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  get loading(): boolean {

    return this.extension == null || this.currentMember == null || this.env == null;
  }

  canSave() {

    return this.memberForm.valid;
  }

  get allCodeSchemes(): CodeScheme[] {

    return [this.extension.parentCodeScheme, ...this.extension.codeSchemes];
  }

  get showCodeDetailLabel(): boolean {

    const currentCode: Code = this.memberForm.controls['code'].value;
    if (currentCode) {
      return currentCode.codeScheme.id !== this.extension.parentCodeScheme.id;
    } else {
      return false;
    }
  }

  getMemberUri() {

    if (this.env !== 'prod') {
      return this.currentMember.uri + '?env=' + this.env;
    }
    return this.currentMember.uri;
  }

  isUnaryOperatorRequired(control: AbstractControl) {

    if (!this.loading) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('unaryOperator');
      return !valueType || (valueType && ((valueType.required && control.value.length > 0) || !valueType.required)) ? null : { 'memberValueValidationError': { value: control.value } };
    }
    return null;
  }

  isComparisonOperatorRequired(control: AbstractControl) {

    if (!this.loading) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('comparisonOperator');
      return !valueType || (valueType && ((valueType.required && control.value.length > 0) || !valueType.required)) ? null : { 'memberValueValidationError': { value: control.value } };
    }
    return null;
  }

  isUnaryOperatorPatternValid(control: AbstractControl) {

    if (!this.loading) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('unaryOperator');
      if (valueType && valueType.regexp) {
        const isMemberValueValid = control.value.match(valueType.regexp);
        return !isMemberValueValid ? { 'memberValueUnaryOperatorRegexpValidationError': { value: control.value } } : null;
      }
      return null;
    }
    return null;
  }

  isComparisonOperatorPatternValid(control: AbstractControl) {

    if (!this.loading) {
      const valueType: ValueType | null = this.extension.propertyType.valueTypeForLocalName('comparisonOperator');
      if (valueType && valueType.regexp) {
        const isMemberValueValid = control.value.match(valueType.regexp);
        return !isMemberValueValid ? { 'memberValueComparisonOperatorRegexpValidationError': { value: control.value } } : null;
      }
      return null;
    }
    return null;
  }
}