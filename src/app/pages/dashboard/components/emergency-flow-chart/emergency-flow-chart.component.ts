import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { PatientSupabaseService } from '../../../../supabase/services/patient-supabase.service';

@Component({
  selector: 'app-emergency-flow-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './emergency-flow-chart.component.html',
  styleUrls: ['./emergency-flow-chart.component.scss']
})
export class EmergencyFlowChartComponent implements OnInit {
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 40,
        ticks: {
          stepSize: 5,
          maxTicksLimit: 6
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Patients: ${context.raw}`
        }
      }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Patients',
        backgroundColor: '#42A5F5'
      }
    ]
  };

  constructor(private patientService: PatientSupabaseService) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    try {
      const result = await this.patientService.getPatientsByHour();
      this.barChartData.labels = result.map(r => `${r.hour}h`);
      this.barChartData.datasets[0].data = result.map(r => r.count);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  }
}
