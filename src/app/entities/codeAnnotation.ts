import { labelNameToResourceIdIdentifier, Localizable, Localizer } from '@mju-psi/yti-common-ui';
import { CodeAnnotationType } from '../services/api-schema';
import { Annotation } from './annotation';
import { Code } from './code';

export class CodeAnnotation {

  codeId: string;
  annotationId: string;
  value: Localizable;
  code: Code;
  annotation: Annotation;

  constructor(data: CodeAnnotationType) {
    this.codeId = data.codeId;
    this.annotationId = data.annotationId;
    this.value = data.value || {};
    if (data.code) {
      this.code = new Code (data.code);
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

  serialize(): CodeAnnotationType {
    return {
      codeId: this.codeId,
      annotationId: this.annotationId,
      value: {...this.value},
      code: this.code && this.code.serialize(),
      annotation: this.annotation.serialize()
    };
  }

  clone(): CodeAnnotation {
    return new CodeAnnotation(this.serialize());
  }
}
