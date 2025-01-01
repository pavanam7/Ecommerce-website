import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';      
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Set up the Jest environment
setupZoneTestEnv();

// Global mocks for jsdom
const mock = (): Storage => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
    key: (index: number) => Object.keys(storage)[index] || null,
    length: Object.keys(storage).length,
  };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
});

// Configure TestBed with common providers
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
  providers: [
    {
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          paramMap: {
            get: () => '1', // mock paramMap
          },
        },
      },
    },
  ],
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});
