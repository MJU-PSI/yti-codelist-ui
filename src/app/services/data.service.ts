import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { CodeScheme } from '../entities/code-scheme';
import { CodeRegistry } from '../entities/code-registry';
import { Observable } from 'rxjs/Observable';
import { DataClassification } from '../entities/data-classification';
import { Code } from '../entities/code';
import {
  ApiResponseType,
  BaseResourceType,
  CodeRegistryType,
  CodeSchemeType,
  CodeType,
  DataClassificationType,
  ExternalReferenceType,
  OrganizationType,
  PropertyTypeType
} from './api-schema';
import { AbstractResource } from '../entities/abstract-resource';
import { PropertyType } from '../entities/property-type';
import { ExternalReference } from '../entities/external-reference';
import { Organization } from '../entities/organization';
import { ServiceConfiguration } from '../entities/service-configuration';
import { UserRequest } from '../entities/user-request';

const intakeContext = 'codelist-intake';
const apiContext = 'codelist-api';
const api = 'api';

const version = 'v1';
const registries = 'coderegistries';
const configuration = 'configuration';
const codeSchemes = 'codeschemes';
const codes = 'codes';
const externalReferences = 'externalreferences';
const classifications = 'dataclassifications';
const propertytypes = 'propertytypes';
const organizations = 'organizations';
const fakeableUsers = 'fakeableUsers';
const groupmanagement = 'groupmanagement';
const requests = 'requests';
const request = 'request';

const codeSchemesBasePath = `/${apiContext}/${api}/${version}/${codeSchemes}`;
const codeRegistriesBasePath = `/${apiContext}/${api}/${version}/${registries}`;
const configurationIntakeBasePath = `/${intakeContext}/${api}/${version}/${configuration}`;
const externalReferencesBasePath = `/${apiContext}/${api}/${version}/${externalReferences}`;
const codeRegistriesIntakeBasePath = `/${intakeContext}/${api}/${version}/${registries}`;
const dataClassificationsBasePath = `/${intakeContext}/${api}/${version}/${classifications}`;
const propertyTypesBasePath = `/${apiContext}/${api}/${version}/${propertytypes}`;
const organizationsBasePath = `/${intakeContext}/${api}/${version}/${organizations}`;
const fakeableUsersPath = `/${intakeContext}/${api}/${fakeableUsers}`;
const groupManagementRequestBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${request}`;
const groupManagementRequestsBasePath = `/${intakeContext}/${api}/${version}/${groupmanagement}/${requests}`;

function setBaseValues(entity: AbstractResource, type: BaseResourceType) {

  entity.id = type.id;
  entity.uri = type.uri;
  entity.codeValue = type.codeValue;
  entity.modified = type.modified;
  entity.prefLabel = type.prefLabel || {};
}

function createCodeRegistryEntity(registry: CodeRegistryType): CodeRegistry {

  const entity = new CodeRegistry();
  setBaseValues(entity, registry);
  entity.codeSchemes = registry.codeSchemes;
  entity.organizations = (registry.organizations || []).map(createOrganizationEntity);
  return entity;
}

function createOrganizationEntity(organization: OrganizationType): Organization {

  const entity = new Organization();
  entity.id = organization.id;
  entity.prefLabel = organization.prefLabel || {};
  entity.description = organization.description || {};
  entity.url = organization.url;
  return entity;
}

function createExternalReferenceEntity(externalReference: ExternalReferenceType): ExternalReference {

  const entity = new ExternalReference();
  entity.id = externalReference.id;
  entity.title = externalReference.title || {};
  entity.description = externalReference.description || {};
  entity.global = externalReference.global;
  entity.uri = externalReference.uri;
  entity.url = externalReference.url;
  entity.propertyType = createPropertyTypeEntity(externalReference.propertyType);
  return entity;
}

function createCodeSchemeEntity(scheme: CodeSchemeType): CodeScheme {

  const entity = new CodeScheme();
  setBaseValues(entity, scheme);
  entity.version = scheme.version;
  entity.source = scheme.source;
  entity.status = scheme.status;
  entity.legalBase = scheme.legalBase;
  entity.governancePolicy = scheme.governancePolicy;
  entity.license = scheme.license;
  entity.startDate = scheme.startDate;
  entity.endDate = scheme.endDate;
  entity.codeRegistry = createCodeRegistryEntity(scheme.codeRegistry);
  entity.description = scheme.description || {};
  entity.changeNote = scheme.changeNote || {};
  entity.definition = scheme.definition || {};
  entity.dataClassifications = (scheme.dataClassifications || []).map(createCodeEntity);
  entity.externalReferences = (scheme.externalReferences || []).map(createExternalReferenceEntity);
  return entity;
}

function createCodeEntity(code: CodeType): Code {

  const entity = new Code();
  setBaseValues(entity, code);
  if (code.codeScheme != null) {
    entity.codeScheme = createCodeSchemeEntity(code.codeScheme);
  }
  entity.shortName = code.shortName;
  entity.status = code.status;
  entity.startDate = code.startDate;
  entity.endDate = code.endDate;
  entity.description = code.description || {};
  entity.definition = code.definition || {};
  entity.externalReferences = (code.externalReferences || []).map(createExternalReferenceEntity);
  return entity;
}

function createPropertyTypeEntity(propertyType: PropertyTypeType): PropertyType {

  const entity = new PropertyType();
  entity.id = propertyType.id;
  entity.prefLabel = propertyType.prefLabel || {};
  entity.definition = propertyType.definition || {};
  entity.uri = propertyType.uri;
  entity.propertyUri = propertyType.propertyUri;
  entity.context = propertyType.context;
  entity.localName = propertyType.localName;
  entity.type = propertyType.type;
  return entity;
}

function createDataClassificationEntity(classification: DataClassificationType): DataClassification {

  const entity = new DataClassification();
  entity.id = classification.id;
  entity.uri = classification.uri;
  entity.status = classification.status;
  entity.modified = classification.modified;
  entity.codeValue = classification.codeValue;
  entity.prefLabel = classification.prefLabel || {};
  entity.codeScheme = classification.codeScheme;
  entity.count = classification.count;
  return entity;
}

@Injectable()
export class DataService {

  constructor(private http: Http) {
  }

  getFakeableUsers(): Observable<{ email: string, firstName: string, lastName: string }[]> {
    return this.http.get(fakeableUsersPath)
      .map(response => response.json());
  }

  getCodeRegistries(): Observable<CodeRegistry[]> {
    return this.http.get(codeRegistriesBasePath)
      .map(res => res.json().results.map(createCodeRegistryEntity));
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get(organizationsBasePath)
      .map(res => res.json().results.map(createOrganizationEntity));
  }

  getCodeRegistry(codeRegistryCodeValue: string): Observable<CodeRegistry> {
    return this.http.get(`${codeRegistriesBasePath}/${codeRegistryCodeValue}/`)
      .map(res => createCodeRegistryEntity(res.json()));
  }

  searchCodeSchemes(searchTerm: string, classification: string | null, organization: string | null): Observable<CodeScheme[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,externalReference,propertyType,code,organization');

    if (searchTerm) {
      params.append('prefLabel', searchTerm);
    }

    if (classification) {
      params.append('dataClassification', classification);
    }

    if (organization) {
      params.append('organizationId', organization);
    }

    return this.http.get(`${codeSchemesBasePath}`, {params})
      .map(res => res.json().results.map(createCodeSchemeEntity));
  }

  getPropertyTypes(context: string): Observable<PropertyType[]> {

    const params = new URLSearchParams();
    params.append('context', context);

    return this.http.get(`${propertyTypesBasePath}/`, {params})
      .map(res => res.json().results.map(createPropertyTypeEntity));
  }

  getDataClassifications(): Observable<DataClassification[]> {
    return this.http.get(`${dataClassificationsBasePath}/`)
      .map(res => res.json().results.map(createDataClassificationEntity));
  }

  getDataClassificationsAsCodes(): Observable<Code[]> {
    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry');

    return this.http.get(`${codeRegistriesBasePath}/yti/${codeSchemes}/dcat/${codes}/`, {params})
      .map(res => res.json().results.map(createCodeEntity));
  }

  getCodeScheme(registryCode: string, schemeCode: string): Observable<CodeScheme> {

    const params = new URLSearchParams();
    params.append('expand', 'codeRegistry,organization,code,externalReference,propertyType,codeScheme,code');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeCode}/`, {params})
      .map(res => createCodeSchemeEntity(res.json()));
  }

  getExternalReferences(codeSchemeId: string): Observable<ExternalReference[]> {

    const params = new URLSearchParams();
    params.append('codeSchemeId', codeSchemeId);
    params.append('expand', 'propertyType');

    return this.http.get(`${externalReferencesBasePath}/`, {params})
      .map(res => res.json().results.map(createExternalReferenceEntity));
  }

  getCodes(registryCode: string, schemeId: string): Observable<Code[]> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/`, {params})
      .map(res => res.json().results.map(createCodeEntity));
  }

  getCode(registryCode: string, schemeId: string, codeId: string): Observable<Code> {

    const params = new URLSearchParams();
    params.append('expand', 'codeScheme,codeRegistry,externalReference,propertyType,organization');

    return this.http.get(`${codeRegistriesBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/${codeId}/`, {params})
      .map(res => createCodeEntity(res.json()));
  }

  createCode(code: CodeType, registryCode: string, schemeId: string): Observable<Code[]> {

    const codeList: CodeType[] = [];
    codeList.push(code);

    return this.createCodes(codeList, registryCode, schemeId);
  }

  createCodes(codeList: CodeType[], registryCode: string, schemeId: string): Observable<Code[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/`,
      codeList)
      .map(res => res.json().results.map(createCodeEntity));
  }

  saveCode(code: CodeType): Observable<ApiResponseType> {

    const registryCode = code.codeScheme.codeRegistry.codeValue;
    const schemeId = code.codeScheme.id;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${schemeId}/${codes}/${code.id}/`, code)
      .map(res => res.json() as ApiResponseType);
  }

  createCodeScheme(codeScheme: CodeSchemeType, registryCode: string): Observable<CodeScheme[]> {

    const codeSchemeList: CodeSchemeType[] = [];
    codeSchemeList.push(codeScheme);

    return this.createCodeSchemes(codeSchemeList, registryCode);
  }

  createCodeSchemes(codeSchemeList: CodeSchemeType[], registryCode: string): Observable<CodeScheme[]> {

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`,
      codeSchemeList)
      .map(res => res.json().results.map(createCodeSchemeEntity));
  }

  saveCodeScheme(codeScheme: CodeSchemeType): Observable<ApiResponseType> {

    const registryCode = codeScheme.codeRegistry.codeValue;

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeScheme.id}/`, codeScheme)
      .map(res => res.json() as ApiResponseType);
  }

  uploadCodeSchemes(registryCode: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/`, formData, {params})
      .map(res => res.json().results.map(createCodeSchemeEntity));
  }

  uploadCodes(registryCode: string, codeSchemeId: string, file: File, format: string): Observable<CodeScheme[]> {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const params = new URLSearchParams();
    params.append('format', format);

    return this.http.post(`${codeRegistriesIntakeBasePath}/${registryCode}/${codeSchemes}/${codeSchemeId}/${codes}`, formData, {params})
      .map(res => res.json().results.map(createCodeEntity));
  }

  getServiceConfiguration() {
    return this.http.get(`${configurationIntakeBasePath}`)
      .map(res => res.json() as ServiceConfiguration);
  }

  getUserRequests(): Observable<UserRequest[]> {
    return this.http.get(`${groupManagementRequestsBasePath}/`, undefined)
      .map(response => response.json() as UserRequest[]);
  }

  sendUserRequest(organizationId: string): Observable<any> {
    return this.http.post(`${groupManagementRequestBasePath}/?organizationId=${organizationId}`, null, undefined);
  }
}
