import {
  Component,
  ElementRef,
  Injectable,
  ViewChild,
  Renderer,
  OnChanges
} from '@angular/core';
import {EditableService} from '../../services/editable.service';
import {Router} from '@angular/router';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {Vocabulary} from '../../entities/Vocabulary';
import { LanguageService } from '../../services/language.service';
import {ModalService} from '../../services/modal.service';
import { OnInit } from '@angular/core';
import {FilterOptions} from 'yti-common-ui/components/filter-dropdown.component';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {TranslateService} from 'ng2-translate';
import {Observable} from 'rxjs/Rx';
import {Concept} from '../../entities/concept';
import {CodeListErrorModalService} from '../common/error-modal.service';

@Injectable()
export class TerminologyIntegrationModalService {

  constructor(private modalService: ModalService) {
  }

  public open(): Promise<Concept> {
    const modalRef = this.modalService.open(TerminologyIntegrationCodeschemeModalComponent, {size: 'lg'});
    return modalRef.result;
  }
}


@Component({
  selector: 'app-terminology-integration-codescheme-modal',
  templateUrl: './terminology-integration-codescheme-modal.component.html',
  styleUrls: ['./terminology-integration-codescheme-modal.component.scss'],
  providers: [EditableService]
})
export class TerminologyIntegrationCodeschemeModalComponent implements OnInit, OnChanges {

  vocabularyOptions: FilterOptions<Vocabulary>;
  vocabulary$ = new BehaviorSubject<Vocabulary|null>(null);
  nrOfSearchResults: number = -1;

  @ViewChild('searchInput') searchInput: ElementRef;

  searchResults$: Observable<Concept[]>;
  search$ = new BehaviorSubject('');

  constructor(private editableService: EditableService,
              private dataService: DataService,
              private router: Router,
              private modal: NgbActiveModal,
              private languageService: LanguageService,
              private translateService: TranslateService,
              private renderer: Renderer,
              private codeListErrorModalService: CodeListErrorModalService) {
  }

  ngOnInit() {
    Observable.combineLatest(this.vocabulary$, this.search$)
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe(() => this.goSearch(this.search$.getValue()));

    this.dataService.getVocabularies().subscribe(vocabularies => {
      this.vocabularyOptions = [null, ...vocabularies].map(voc => ({
        value: voc,
        name: () => voc ? this.languageService.translate(voc.prefLabel, true)
          : this.translateService.instant('All vocabularies')
      }));
      this.renderer.invokeElementMethod(this.searchInput.nativeElement, 'focus');
    }, error => {
      this.vocabularyOptions = [
        { value: null, name: () => this.translateService.instant('All vocabularies')}];
      this.codeListErrorModalService.openSubmitError(error);
    });
  }

  ngOnChanges() {
    this.goSearch(this.search$.getValue());
  }

  close() {
    this.modal.dismiss('cancel');
  }

  select(concept: Concept) {
    this.modal.close(concept);
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

  goSearch(searchTerm: string) {
    if (!searchTerm) {
      this.nrOfSearchResults = 0;
      return;
    }
    let vocabularyId = '0'; // Kaikki Sanastot (All Vocabularies)
    const vocabulary = this.vocabulary$.getValue();
    if (vocabulary) {
      vocabularyId = vocabulary.id;
    }
    this.dataService.getConcepts(searchTerm, vocabularyId ).subscribe(concepts => {
      this.searchResults$ = Observable.of(concepts);
      this.nrOfSearchResults = concepts.length || 0;
    }, error => {
      this.nrOfSearchResults = 0;
      this.codeListErrorModalService.openSubmitError(error);
    });
  }
}