import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  searchForm: FormGroup;
  searchResults: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      query: ['', { updateOn: 'submit' }]
    });
  }

  async onSubmit() {
    if (this.searchForm.invalid) {
      return;
    }

    const query = this.searchForm.value.query?.trim();
    if (!query) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.searchResults = [];

    try {
      const results = await this.productService.searchProducts(query).toPromise();
      this.searchResults = results || [];
    } catch (error) {
      this.errorMessage = 'Failed to search products. Please try again.';
      console.error('Search error:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/products', productId]);
  }
}
