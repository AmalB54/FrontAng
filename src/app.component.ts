import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertService } from './app/layout/service/alert.service';
import { NotificationPopupComponent } from './app/shared/notification-popup/notification-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationPopupComponent],
  template: `
    <app-notification-popup *ngIf="showPopup" [message]="alertMessage"></app-notification-popup>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  alertMessage = '';
  showPopup = false;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.getAlerts().subscribe((message) => {
      this.alertMessage = message;
      this.showPopup = true;

      // Cacher le pop-up après 6s
      setTimeout(() => {
        this.showPopup = false;
      }, 30000);
    });
  }
}
