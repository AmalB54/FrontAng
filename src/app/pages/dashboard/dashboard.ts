import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatsWidget } from './components/statswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { NotificationsWidget } from './components/notificationswidget';
import { UrgencyChartComponent } from '../../urgency-chart/urgency-chart.component';
import { EmergencyFlowChartComponent } from './components/emergency-flow-chart/emergency-flow-chart.component';
import { DashboardSupabaseService } from './dashboard-supabase.service';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';


const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsWidget,
    BestSellingWidget,
    NotificationsWidget,
    UrgencyChartComponent,
    EmergencyFlowChartComponent
  ],
  template: `
    <div class="grid grid-cols-12 gap-4">
      <app-stats-widget
        class="col-span-12"
        [availableBeds]="availableBeds"
        [availableAmbulances]="availableAmbulances"
        [totalPatients]="totalPatients"
        [admittedPatients]="admittedPatients"
        [doctorsOnDuty]="doctorsOnDuty"
      />

      <div class="col-span-12 xl:col-span-6">
        <app-urgency-chart />
        <app-best-selling-widget />
      </div>

      <div class="col-span-12 xl:col-span-6">
        <app-emergency-flow-chart />
        <app-notifications-widget />
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  availableBeds = 0;
  availableAmbulances = 0;
  totalPatients = 0;
  admittedPatients = 0;
  doctorsOnDuty = 0; // ✅ Nouvelle propriété

  constructor(private dashboardService: DashboardSupabaseService) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    try {
      this.availableBeds = await this.dashboardService.getAvailableBeds();
      this.availableAmbulances = await this.dashboardService.getAvailableAmbulances();
      this.totalPatients = await this.dashboardService.getTotalPatients();
      this.admittedPatients = await this.dashboardService.getAdmittedPatients();

      // ✅ Ajout du nombre de médecins en service
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('is_on_duty', true);

      this.doctorsOnDuty = data?.length || 0;

      console.log('Beds:', this.availableBeds);
      console.log('Doctors on duty:', this.doctorsOnDuty);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  }
}
