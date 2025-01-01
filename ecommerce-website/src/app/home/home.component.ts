import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PromotionBannerComponent } from '../promotion-banner/promotion-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule, PromotionBannerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private translate: TranslateService) {
    // Set default language
    translate.setDefaultLang('en');
    translate.use('en');
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
