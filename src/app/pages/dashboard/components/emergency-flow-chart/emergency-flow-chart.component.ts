import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-emergency-flow-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './emergency-flow-chart.component.html',
  styleUrls: ['./emergency-flow-chart.component.scss']
})
export class EmergencyFlowChartComponent {
  public barChartType: 'bar' = 'bar'; // ✅ FIX ici

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['12h', '14h', '16h', '18h', '20h', '22h'],
    datasets: [
      {
        data: [40, 50, 45, 70, 20, 48],
        label: 'Patients',
        backgroundColor: '#60A5FA',
        hoverBackgroundColor: '#3B82F6',
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { ticks: { color: '#6B7280' } },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#6B7280' }
      }
    }
  };
}