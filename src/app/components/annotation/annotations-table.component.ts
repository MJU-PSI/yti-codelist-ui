import { Component, Input } from '@angular/core';
import { Annotation } from '../../entities/annotation';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-annotations-table',
  templateUrl: './annotations-table.component.html',
  styleUrls: ['./annotations-table.component.scss']
})
export class AnnotationsTableComponent {

  @Input() annotations: Annotation[];

  constructor(private router: Router,
              public languageService: LanguageService,
              public translateService: TranslateService,
              private configurationService: ConfigurationService) {
  }

  editAnnotation(annotation: Annotation) {
    this.router.navigate(
      ['annotation',
        {
          codeValue: annotation.codeValue,
        }
      ]
    );
  }

}
