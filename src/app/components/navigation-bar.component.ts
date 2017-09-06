import { Component } from '@angular/core';
import { Language, LanguageService } from '../services/language.service';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  template: `
    <nav class="navbar navbar-toggleable-md navbar-inverse bg-primary">
      
      <a class="navbar-brand" [routerLink]="['/']"><span>Koodistoeditori</span></a>

      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item" *ngFor="let language of languages">
            <a class="nav-link" (click)="setLanguage(language.code)">{{language.name}}</a>
          </li>
        </ul>
      </div>
    </nav>
  `
})
export class NavigationBarComponent {

  languages = [
    { code: 'fi' as Language, name: 'Suomeksi' },
    { code: 'en' as Language, name: 'In english' }
  ];

  constructor(private languageService: LanguageService) {
  }

  setLanguage(language: Language) {
    this.languageService.language = language;
  }
}
