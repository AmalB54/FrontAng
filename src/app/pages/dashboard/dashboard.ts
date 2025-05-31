import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatsWidget } from './components/statswidget';
import { UrgencyChartComponent } from '../../urgency-chart/urgency-chart.component';
import { EmergencyFlowChartComponent } from './components/emergency-flow-chart/emergency-flow-chart.component';
import { PredictionComparisonWidget } from './components/prediction-comparison-widget';
import { SurchargeEvolutionWidget } from './components/surcharge-evolution-widget';
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
    UrgencyChartComponent,
    EmergencyFlowChartComponent,
    PredictionComparisonWidget,
    SurchargeEvolutionWidget
  ],
  template: `
    <div class="grid grid-cols-12 gap-4">
      <!-- Statistiques hautes -->
      <app-stats-widget
        class="col-span-12"
        [availableBeds]="availableBeds"
        [availableAmbulances]="availableAmbulances"
        [totalPatients]="totalPatients"
        [doctorsOnDuty]="doctorsOnDuty"
      />

      <!-- Les deux graphiques alignés -->
      <div class="col-span-12 xl:col-span-6">
        <div class="card h-full p-4">
          <app-urgency-chart class="w-full h-[300px]" />
        </div>
      </div>

      <div class="col-span-12 xl:col-span-6">
        <div class="card h-full p-4">
          <app-emergency-flow-chart class="w-full h-[300px]" />
        </div>
      </div>

      <!-- Autres widgets -->
      <div class="col-span-12 xl:col-span-6">
        <app-prediction-comparison-widget />
      </div>

      <div class="col-span-12 xl:col-span-6">
        <app-surcharge-evolution-widget />
      </div>
    </div>
  `
})
export class Dashboard implements OnInit {
  availableBeds = 0;
  availableAmbulances = 0;
  totalPatients = 0;
  doctorsOnDuty = 0;

  constructor(private dashboardService: DashboardSupabaseService) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    try {
      this.availableBeds = await this.dashboardService.getAvailableBeds();
      this.availableAmbulances = await this.dashboardService.getAvailableAmbulances();
      this.totalPatients = await this.dashboardService.getTotalPatients();

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

// ✅ Alias pour Angular
export { Dashboard as DashboardComponent };
