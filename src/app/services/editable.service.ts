import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserService } from 'yti-common-ui/services/user.service';
import { Subscription } from 'rxjs/Subscription';
import { CodeListErrorModalService } from '../components/common/error-modal.service';

export interface EditingComponent {
  isEditing(): boolean;
  cancelEditing(): void;
}

@Injectable()
export class EditableService implements OnDestroy {

  editing$ = new BehaviorSubject<boolean>(false);
  saving$ = new BehaviorSubject<boolean>(false);
  cancel$ = new EventEmitter<void>();

  private _onSave: (formValue: any) => Observable<any>;

  private loggedInSubscription: Subscription;

  constructor(private errorModalService: CodeListErrorModalService,
              userService: UserService) {

    this.loggedInSubscription = userService.loggedIn$.subscribe(loggedIn => {
      if (!loggedIn && this.editing) {
        this.cancel();
      }
    });
  }

  set onSave(value: (formValue: any) => Observable<any>) {
    if (this._onSave) {
      throw new Error('Save handler already set');
    }
    this._onSave = value;
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
    this.editing$.next(false);
    this.cancel$.next();
  }

  save(formValue: any) {

    if (!this._onSave) {
      throw new Error('Save handler missing');
    }

    const that = this;
    this.saving$.next(true);

    this._onSave(formValue).subscribe({
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

  ngOnDestroy(): void {
    this.loggedInSubscription.unsubscribe();
  }
}
