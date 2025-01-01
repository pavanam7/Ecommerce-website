import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-loader"
      [style.width]="width"
      [style.height]="height"
      [class.circle]="circle"
      [class.animate]="animate"
    ></div>
  `,
  styles: [`
    .skeleton-loader {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      border-radius: 4px;
      overflow: hidden;

      &.circle {
        border-radius: 50%;
      }

      &.animate {
        animation: shimmer 1.5s infinite;
      }
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() circle = false;
  @Input() animate = true;
} 