import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" class="popup">
      {{ message }}
    </div>
  `,
  styles: [`
    .popup {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background-color:rgb(53, 51, 51);
      color: #fff;
      padding: 14px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(15, 15, 15, 0.25);
      font-size: 16px;
      max-width: 320px;
      z-index: 1000;
      animation: slideIn 0.5s ease, fadeOut 0.5s ease 15s;
    }
  
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateX(20%);
      }
    }
  `]
  
})
export class NotificationPopupComponent {
  @Input() message: string = '';
}
