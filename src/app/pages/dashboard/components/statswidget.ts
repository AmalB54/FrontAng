import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-stats-widget',
  imports: [CommonModule],
  template: `
  <div class="grid grid-cols-12 gap-6">
    <ng-container *ngFor="let stat of stats">
      <div class="col-span-12 md:col-span-6 xl:col-span-3">
        <div
          class="card p-5 rounded-2xl shadow-lg bg-white dark:bg-slate-900 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
          [ngClass]="stat.bgGradient"
        >
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-sm font-medium uppercase text-gray-600 dark:text-gray-400 tracking-wide">
                {{ stat.label }}
              </span>
              <div class="text-4xl font-extrabold mt-1 text-gray-900 dark:text-white">
                {{ stat.value }}
              </div>
            </div>
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
              [ngClass]="stat.iconBg"
            >
              <ng-container *ngIf="!stat.svg; else svgIcon">
                <i [class]="stat.icon" [ngClass]="stat.iconColor + ' text-2xl'"></i>
              </ng-container>
              <ng-template #svgIcon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-8 h-8"
                  [ngClass]="stat.iconColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4zm6 14v3a1 1 0 0 1-1 1h-2v-2a1 1 0 0 0-2 0v2h-2v-2a1 1 0 0 0-2 0v2H7a1 1 0 0 1-1-1v-3a6 6 0 0 1 12 0z" />
                </svg>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  </div>
  `,
})
export class StatsWidget {
  @Input() availableBeds!: number;
  @Input() availableAmbulances!: number;
  @Input() totalPatients!: number;
  @Input() admittedPatients: number = 0;

  @Input() doctorsOnDuty: number = 0;

  get stats() {
    return [
      {
        label: 'Available Beds',
        value: this.availableBeds,
        icon: 'fas fa-procedures',
        iconColor: 'text-blue-700',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        bgGradient: 'bg-gradient-to-tr from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800',
        svg: false,
      },
      {
        label: 'Available Ambulances',
        value: this.availableAmbulances,
        icon: 'pi pi-truck',
        iconColor: 'text-purple-700',
        iconBg: 'bg-purple-100 dark:bg-purple-900/50',
        bgGradient: 'bg-gradient-to-tr from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800',
        svg: false,
      },
      {
        label: 'Total Patients',
        value: this.totalPatients,
        icon: 'pi pi-users',
        iconColor: 'text-cyan-700',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
        bgGradient: 'bg-gradient-to-tr from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800',
        svg: false,
      },
      {
        label: 'Doctors en service',
        value: this.doctorsOnDuty,
        icon: '',
        iconColor: 'text-green-700',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        bgGradient: 'bg-gradient-to-tr from-green-50 to-green-100 dark:from-green-900 dark:to-green-800',
        svg: true,
      },
    ];
  }
}
