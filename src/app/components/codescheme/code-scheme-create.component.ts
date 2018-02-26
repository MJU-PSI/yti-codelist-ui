import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditableService } from '../../services/editable.service';
import { LinkListModalService } from './link-list-modal.component';
import { LinkShowModalService } from './link-show-modal.component';
import { LinkEditModalService } from './link-edit-modal.component';
import { Router } from '@angular/router';
import { CodeRegistry } from '../../entities/code-registry';
import { DataService } from '../../services/data.service';
import { Status } from 'yti-common-ui/entities/status';
import { Code } from '../../entities/code';
import { formatDate, fromPickerDate } from '../../utils/date';
import { CodeSchemeType } from '../../services/api-schema';
import { Observable } from 'rxjs/Observable';
import { requiredList } from 'yti-common-ui/utils/validator';

@Component({
  selector: 'app-code-scheme-create',
  templateUrl: './code-scheme-create.component.html',
  styleUrls: ['./code-scheme-create.component.scss'],
  providers: [EditableService]
})
export class CodeSchemeCreateComponent {
  
  codeRegistriesLoading: boolean;

  codeSchemeForm = new FormGroup({
    codeValue: new FormControl('', Validators.required),
    prefLabel: new FormControl({}),
    description: new FormControl({}),
    definition: new FormControl({}),
    source: new FormControl(''),
    legalBase: new FormControl(''),
    governancePolicy: new FormControl(''),
    startDate: new FormControl(),
    endDate: new FormControl(),
    dataClassifications: new FormControl([], [requiredList]),
    status: new FormControl('DRAFT' as Status),
    codeRegistry: new FormControl(null, Validators.required)
  });

  constructor(private router: Router,
              private dataService: DataService,
              private linkEditModalService: LinkEditModalService,
              private linkShowModalService: LinkShowModalService,
              private linkListModalService: LinkListModalService,
              private editableService: EditableService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  get loading(): boolean {
    return this.codeRegistriesLoading;
  }

  back() {
    this.router.navigate(['importandcreatecodescheme']);
  }

  save(formData: any): Observable<any> {

    console.log('Saving new CodeScheme');

    const { startDate, endDate, codeRegistry, dataClassifications, ...rest } = formData;

    const codeScheme: CodeSchemeType = {
      ...rest,
      startDate: formatDate(fromPickerDate(startDate)),
      endDate: formatDate(fromPickerDate(endDate)),
      codeRegistry: codeRegistry.serialize(),
      dataClassifications: dataClassifications.map((dc: Code) => dc.serialize())
    };

    return this.dataService.createCodeScheme(codeScheme, codeRegistry.codeValue)
      .do(createdCodeScheme => {
        console.log('Saved new CodeScheme');
        this.router.navigate(createdCodeScheme.route);
      });
  }
}
