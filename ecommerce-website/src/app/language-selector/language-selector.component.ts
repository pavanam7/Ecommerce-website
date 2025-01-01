import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  languages = ['en', 'es', 'fr'];
  selectedLanguage = 'en';

  constructor(private translate: TranslateService) {
    this.selectedLanguage = translate.currentLang || 'en';
  }

  changeLanguage(language: string): void {
    this.selectedLanguage = language;
    this.translate.use(language);
  }
}
