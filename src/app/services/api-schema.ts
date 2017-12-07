import { Localizable } from 'yti-common-ui/types/localization';
import { Organization } from '../entities/organization';

export interface ApiResponseType {

  meta: {
    message: string,
    code: number
  };
}

export interface BaseResourceType {

  id: string;
  uri: string;
  codeValue: string;
  modified: string;
  prefLabel?: Localizable;
}

export interface CodeRegistryType extends BaseResourceType {
  codeSchemes?: { uri: string };
  organizations: Organization[];
}

export interface CodeSchemeType extends BaseResourceType {

  version: string;
  source: string;
  status: string;
  legalBase: string;
  governancePolicy: string;
  license: string;
  startDate: string;
  endDate: string;
  codeRegistry: CodeRegistryType;
  description?: Localizable;
  changeNote?: Localizable;
  definition?: Localizable;
  dataClassifications: DataClassificationType[];
  externalReferences?: ExternalReferenceType[];
}

export interface CodeType extends BaseResourceType {

  codeScheme: CodeSchemeType;
  shortName: string;
  status: string;
  startDate: string;
  endDate: string;
  description?: Localizable;
  definition?: Localizable;
}

export interface ExternalReferenceType  {

  id: string;
  uri: string;
  url: string;
  title?: Localizable;
  description?: Localizable;
  propertyType: PropertyTypeType;
}

export interface PropertyTypeType  {

  id: string;
  prefLabel: Localizable;
  definition: Localizable;
  localName: string;
  uri: string;
  propertyUri: string;
  context: string;
  externaluri: string;
  type: string;
}

export interface DataClassificationType  {

  id: string;
  uri: string;
  status: string;
  modified: string;
  codeValue: string;
  prefLabel: Localizable;
  codeScheme: { uri: string };
  count: number;
}

export interface OrganizationType {

    id: string;
    prefLabel: Localizable;
    description: Localizable;
    url: string;
  }
