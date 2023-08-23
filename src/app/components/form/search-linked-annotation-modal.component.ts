import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { Annotation } from '../../entities/annotation';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { comparingLocalizable, contains, ModalService } from '@mju-psi/yti-common-ui';

@Component({
  selector: 'app-search-linked-annotation-modal',
  styleUrls: ['./search-linked-annotation-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body full-height">

      <div class="row mb-2">
        <div class="col-12">

          <div class="input-group input-group-lg input-group-search">
            <input #searchInput id="search_linked_annotation_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>
        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div [id]="annotation.getIdIdentifier(languageService) + '_annotation_link'"
                   class="search-result"
                   *ngFor="let annotation of searchResults$ | async; let last = last"
                   (click)="select(annotation)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="annotation.getDisplayName(languageService, useUILanguage)"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">

      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()" translate>Cancel</button>
    </div>
  `
})
export class SearchLinkedAnnotationModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() annotations$: Observable<Annotation[]>;
  @Input() useUILanguage: boolean;

  searchResults$: Observable<Annotation[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService) {
  }

  ngOnInit() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.annotations$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([annotations, search]) => {
          return annotations.filter(annotation => {
            const label = this.languageService.translate(annotation.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, annotation.id);
            return searchMatches && isNotRestricted;
          }).sort(comparingLocalizable<Annotation>(this.languageService, annotation => annotation.prefLabel ? annotation.prefLabel : {}));
        })
      );
  }

  select(annotation: Annotation) {
    this.modal.close(annotation);
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  get search() {
    return this.search$.getValue();
  }

  set search(value: string) {
    this.search$.next(value);
  }

  cancel() {
    this.modal.dismiss('cancel');
  }
}

@Injectable()
export class SearchLinkedAnnotationModalService {

  constructor(private modalService: ModalService) {
  }

  open(annotations$: Observable<Annotation[]>,
       titleLabel: string,
       searchLabel: string,
       restrictAnnotationIds: string[],
       useUILanguage: boolean = false): Promise<Annotation> {

    const modalRef = this.modalService.open(SearchLinkedAnnotationModalComponent, { size: 'sm', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as SearchLinkedAnnotationModalComponent;
    instance.annotations$ = annotations$;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictAnnotationIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
