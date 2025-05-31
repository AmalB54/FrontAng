import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-stats-widget',
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-12 gap-4">
      
      <!-- Available Beds -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card h-full flex flex-col justify-between p-4">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-muted text-sm mb-1 uppercase font-semibold tracking-wide">Available Beds</span>
              <div class="text-4xl font-bold text-surface-900 dark:text-white">{{ availableBeds }}</div>
            </div>
            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 3rem; height: 3rem">
              <i class="fas fa-procedures text-blue-500 text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Ambulances -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card h-full flex flex-col justify-between p-4">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-muted text-sm mb-1 uppercase font-semibold tracking-wide">Available Ambulances</span>
              <div class="text-4xl font-bold text-surface-900 dark:text-white">{{ availableAmbulances }}</div>
            </div>
            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 3rem; height: 3rem">
              <i class="pi pi-truck text-blue-500 text-5xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Patients -->
      <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card h-full flex flex-col justify-between p-4">
          <div class="flex justify-between items-center">
            <div>
              <span class="block text-muted text-sm mb-1 uppercase font-semibold tracking-wide">Total Patients</span>
              <div class="text-4xl font-bold text-surface-900 dark:text-white">{{ totalPatients }}</div>
            </div>
            <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 3rem; height: 3rem">
              <i class="pi pi-users text-cyan-500 text-2xl"></i>
            </div>
          </div>
       
        </div>
      </div>

      

  <!-- Doctors on Duty -->
<div class="col-span-12 lg:col-span-6 xl:col-span-3" *ngIf="doctorsOnDuty !== undefined">
  <div class="card h-full flex flex-col justify-between p-4">
    <div class="flex justify-between items-center">
      <div>
        <span class="block text-muted text-sm mb-1 uppercase font-semibold tracking-wide">Doctors on Duty</span>
        <div class="text-4xl font-bold text-surface-900 dark:text-white">{{ doctorsOnDuty }}</div>
      </div>
      <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-xl" style="width: 3rem; height: 3rem">
        <div class="text-green-600 text-2xl">🩺</div>
      </div>
    </div>
  </div>
</div>

  `
})
export class StatsWidget {
  @Input() availableBeds: number = 0;
  @Input() availableAmbulances: number = 0;
  @Input() totalPatients: number = 0;
  @Input() admittedPatients: number = 0;
  @Input() doctorsOnDuty: number = 0;
}
