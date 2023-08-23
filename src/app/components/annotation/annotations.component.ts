import { Component, OnInit } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { LanguageService } from '../../services/language.service';
import { UserService, localizableMatches } from '@mju-psi/yti-common-ui';
import { Annotation } from '../../entities/annotation';

@Component({
  selector: 'app-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss'],
  providers: [EditableService]
})
export class AnnotationsComponent implements OnInit {

  pageTitle = 'Annotations';
  searchTerm = '';
  annotations: Annotation[];

  constructor(private router: Router,
              private dataService: DataService,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private userService: UserService) {

  }

  ngOnInit() {

    this.dataService.getAnnotations(this.searchTerm, this.languageService.language).subscribe(annotations => {
      this.annotations = annotations;

      this.locationService.atAnnotationsPage();
    });
  }

  get loading(): boolean {
    return !this.annotations;
  }

  back() {
    this.location.back();
  }

  get isSuperUser() {
    return this.userService.user.superuser;
  }

  addAnnotation() {
    this.router.navigate(['createannotation']);
  }

  get numberOfAnnotations() {
    return this.searchTermHasValue() ? this.filteredAnnotations.length : this.annotations.length;
  }

  searchTermHasValue() {
    return this.searchTerm ? true : false;
  }

  get filteredAnnotations() {
    return this.annotations.filter(annotation =>
      annotation.codeValue.toLowerCase().includes(this.searchTerm.toLowerCase()) || localizableMatches(annotation.prefLabel, this.searchTerm));
  }
}
