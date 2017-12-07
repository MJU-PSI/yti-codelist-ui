import { Localizable } from 'yti-common-ui/types/localization';

export class PropertyType {

  id: string;
  uri: string;
  propertyUri: string;
  context: string;
  localName: string;
  type: string;
  prefLabel: Localizable;
  definition: Localizable;

  clone() {
    return Object.assign(new PropertyType(), this);
  }
}
