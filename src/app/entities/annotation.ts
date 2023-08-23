import { formatDateTime, formatDisplayDateTime, parseDate, parseDateTime } from '../utils/date';
import { EditableEntity } from './editable-entity';
import { Moment } from 'moment';
import { AnnotationType } from '../services/api-schema';
import { Localizable, Localizer, hasLocalization, labelNameToResourceIdIdentifier } from '@mju-psi/yti-common-ui';

export class Annotation implements EditableEntity {

  id: string;
  codeValue: string;
  prefLabel: Localizable;
  description: Localizable = {};
  created: Moment | null = null;
  modified: Moment | null = null;

  constructor(data: AnnotationType) {
    this.id = data.id;
    this.codeValue = data.codeValue;
    this.prefLabel = data.prefLabel || {};
    this.description = data.description || {};
    if (data.modified) {
      this.modified = parseDateTime(data.modified);
    }
  }

  getOwningOrganizationIds(): string[] {
    throw new Error('Method not implemented.');
  }

  allowOrganizationEdit(): boolean {
    return true;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.prefLabel, useUILanguage);
  }

  getEditModeDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return this.getDisplayName(localizer, useUILanguage);
  }

  getIdIdentifier(localizer: Localizer): string {
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  get modifiedDisplayValue(): string {
    return formatDisplayDateTime(this.modified);
  }

  get route(): any[] {
    return [
      '/annotation',
      {
        codeValue: this.codeValue
      }
    ];
  }

  get location(): any[] {
    return [
      { localizationKey: 'Annotations', route: ['annotations']},
      {
        localizationKey: 'Annotation',
        label: this.prefLabel,
        value: !hasLocalization(this.prefLabel) ? this.codeValue : '',
        route: this.route
      }];
  }

  serialize(): AnnotationType {
    return {
      id: this.id,
      codeValue: this.codeValue,
      prefLabel: { ...this.prefLabel },
      description: { ...this.description },
      modified: formatDateTime(this.modified)
    };
  }

  hasPrefLabel() {
    return hasLocalization(this.prefLabel);
  }

  clone(): Annotation {
    return new Annotation(this.serialize());
  }
}
