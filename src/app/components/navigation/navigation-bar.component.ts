import { Component } from '@angular/core';
import { Language, LanguageService } from '../../services/language.service';
import { UserService } from '../../services/user.service';
import { LoginModalService } from 'yti-common-ui/components/login-modal.component';

@Component({
  selector: 'app-navigation-bar',
  styleUrls: ['./navigation-bar.component.scss'],
  templateUrl: './navigation-bar.component.html',
})
export class NavigationBarComponent {

  availableLanguages = [
    { code: 'fi' as Language, name: 'Suomeksi (FI)' },
    { code: 'sv' as Language, name: 'På svenska (SV)' },
    { code: 'en' as Language, name: 'In English (EN)' }
  ];

  constructor(private languageService: LanguageService,
              private userService: UserService,
              private loginModal: LoginModalService) {
  }

  get noMenuItemsAvailable() {
    return true;
  }

  logIn() {
    this.loginModal.open();
  }

  logOut() {
    this.userService.logout();
  }

  get user() {
    return this.userService.user;
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  set language(language: Language) {
    this.languageService.language = language;
  }

  get language(): Language {
    return this.languageService.language;
  }

  isLanguageSelected(language: Language) {
    return language === this.language;
  }
}
