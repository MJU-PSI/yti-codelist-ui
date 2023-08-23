import { labelNameToResourceIdIdentifier, Localizable, Localizer } from '@mju-psi/yti-common-ui';
import { CodeSchemeAnnotationType } from '../services/api-schema';
import { Annotation } from './annotation';
import { CodeScheme } from './code-scheme';

export class CodeSchemeAnnotation {

  codeschemeId: string;
  annotationId: string;
  value: Localizable;
  codescheme: CodeScheme;
  annotation: Annotation;

  constructor(data: CodeSchemeAnnotationType) {
    this.codeschemeId = data.codeschemeId;
    this.annotationId = data.annotationId;
    this.value = data.value || {};
    if (data.codescheme) {
      this.codescheme = new CodeScheme (data.codescheme);
    }
    if (data.annotation) {
      this.annotation = new Annotation (data.annotation);
    }
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.value, useUILanguage);
  }
  getIdIdentifier(localizer: Localizer): string {
    const value = localizer.translate(this.value);
    return `${labelNameToResourceIdIdentifier(value)}`;
  }

  serialize(): CodeSchemeAnnotationType {
    return {
      codeschemeId: this.codeschemeId,
      annotationId: this.annotationId,
      value: {...this.value},
      codescheme: this.codescheme && this.codescheme.serialize(),
      annotation: this.annotation.serialize()
    };
  }

  clone(): CodeSchemeAnnotation {
    return new CodeSchemeAnnotation(this.serialize());
  }
}
