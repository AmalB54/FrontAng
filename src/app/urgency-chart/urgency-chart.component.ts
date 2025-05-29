import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { PatientSupabaseService } from '../supabase/services/patient-supabase.service';

@Component({
  selector: 'app-urgency-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './urgency-chart.component.html',
  styleUrls: ['./urgency-chart.component.scss']
})
export class UrgencyChartComponent implements OnInit {
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  public pieChartLabels = ['1', '2', '3', '4', '5'];

  public pieChartData = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#ECEFF1', '#BBDEFB', '#C8E6C9', '#FFE0B2', '#FFCDD2'],
        borderWidth: 1
      }
    ]
  };

  constructor(private patientService: PatientSupabaseService) {}

  ngOnInit(): void {
    this.loadUrgencyData();
  }

  async loadUrgencyData() {
    try {
      const counts = await this.patientService.getUrgencyLevelCounts();
      const values = [0, 0, 0, 0, 0];

      counts.forEach(({ level, count }) => {
        if (level >= 1 && level <= 5) {
          values[level - 1] = count;
        }
      });

      // Injecte les données dans le graphique
      this.pieChartData.datasets[0].data = values;

      // 🔁 Important pour forcer le rafraîchissement du graphique
      this.pieChartData = { ...this.pieChartData };

      console.log('📊 Données injectées :', values); // pour debug
    } catch (error) {
      console.error('❌ Erreur chargement graphique urgences :', error);
    }
  }
}
