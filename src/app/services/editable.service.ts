import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ErrorModalService } from '../components/common/error-modal.component';

export interface EditingComponent {
  isEditing(): boolean;
  cancelEditing(): void;
}

@Injectable()
export class EditableService {

  editing$ = new BehaviorSubject<boolean>(false);
  saving$ = new BehaviorSubject<boolean>(false);

  onSave: (formValue: any) => Observable<any>;
  onCanceled: () => void;

  constructor(private errorModalService: ErrorModalService) {
  }

  get editing() {
    return this.editing$.getValue();
  }

  get saving() {
    return this.saving$.getValue();
  }

  edit() {
    this.editing$.next(true);
  }

  cancel() {

    if (!this.onCanceled) {
      throw new Error('Cancel handler missing');
    }

    this.editing$.next(false);
    this.onCanceled();
  }

  save(formValue: any) {

    if (!this.onSave) {
      throw new Error('Save handler missing');
    }

    const that = this;
    this.saving$.next(true);

    this.onSave(formValue).subscribe({
      next() {
        that.saving$.next(false);
        that.editing$.next(false);
      },
      error(err: any) {
        that.saving$.next(false);
        that.errorModalService.openSubmitError(err);
      }
    });
  }
}