import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { debounceTime, Subscription, interval } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { PatientSupabaseService } from '../../../supabase/services/patient-supabase.service';
import { Patient } from '../../../models/patient';

@Component({
    standalone: true,
    selector: 'app-prediction-comparison-widget',
    imports: [CommonModule, ChartModule, ButtonModule],
    template: `<div class="card !mb-8">
        <div class="flex justify-between items-center mb-4">
            <div>
                <div class="font-semibold text-xl">Prédictions vs Temps d'attente réels</div>
                <div class="text-sm text-muted-color mt-1">
                    Dernière mise à jour: {{ lastUpdate | date:'HH:mm:ss' }}
                    <span class="ml-2" [class]="isRealTime ? 'text-green-500' : 'text-orange-500'">
                        {{ isRealTime ? '🟢 Temps réel' : '🟡 Pause' }}
                    </span>
                </div>
            </div>
            <div class="flex gap-2">
                <p-button
                    [icon]="isRealTime ? 'pi pi-pause' : 'pi pi-play'"
                    [label]="isRealTime ? 'Pause' : 'Reprendre'"
                    (onClick)="toggleRealTime()"
                    [severity]="isRealTime ? 'secondary' : 'success'"
                    size="small">
                </p-button>
                <p-button
                    icon="pi pi-refresh"
                    label="Actualiser"
                    (onClick)="refreshData()"
                    severity="info"
                    size="small">
                </p-button>
            </div>
        </div>
        <p-chart type="line" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>`
})
export class PredictionComparisonWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;
    realTimeSubscription!: Subscription;

    // Propriétés pour le temps réel
    isRealTime: boolean = true;
    lastUpdate: Date = new Date();
    refreshInterval: number = 30000; // 30 secondes
    maxDataPoints: number = 20; // Nombre maximum de points à afficher

    constructor(
        private patientService: PatientSupabaseService,
        public layoutService: LayoutService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
        this.loadPredictionData();
        this.startRealTimeUpdates();
    }

    async loadPredictionData() {
        try {
            console.log('🔄 Chargement des données patients depuis Supabase...');
            const patients = await this.patientService.getPatients();
            this.lastUpdate = new Date();

            if (patients && patients.length > 0) {
                console.log(`📊 ${patients.length} patients trouvés:`, patients);

                // Filtrer les patients qui ont des prédictions et calculer les temps réels
                const patientsWithData = patients
                    .filter(p => p.predicted_wait_time !== undefined && p.predicted_wait_time !== null)
                    .map(p => ({
                        ...p,
                        realWaitTime: this.calculateRealWaitTime(p)
                    }))
                    .slice(-this.maxDataPoints); // Limiter le nombre de points

                if (patientsWithData.length > 0) {
                    // Créer les labels avec les noms des patients
                    const labels = patientsWithData.map(p => p.nom);
                    const predictions = patientsWithData.map(p => p.predicted_wait_time || 0);
                    const reals = patientsWithData.map(p => p.realWaitTime);

                    console.log('📈 Données du graphique:', { labels, predictions, reals });
                    this.updateChartData(labels, predictions, reals);
                } else {
                    console.warn('⚠️ Aucun patient avec des prédictions trouvé');
                    this.setTestData();
                }
            } else {
                console.warn('⚠️ Aucun patient trouvé dans la base');
                this.setTestData();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données patients:', error);
            this.setTestData();
        }
    }

    // Calculer le temps d'attente réel basé sur les dates
    calculateRealWaitTime(patient: Patient): number {
        const entryTime = new Date(patient.date_entree);
        const currentTime = new Date();

        // Si le patient a été pris en charge, utiliser cette date
        if (patient.date_prise_en_charge) {
            const treatmentTime = new Date(patient.date_prise_en_charge);
            return Math.round((treatmentTime.getTime() - entryTime.getTime()) / (1000 * 60)); // en minutes
        }

        // Sinon, calculer depuis l'entrée jusqu'à maintenant
        const waitTimeMinutes = Math.round((currentTime.getTime() - entryTime.getTime()) / (1000 * 60));

        // Limiter à des valeurs raisonnables (max 8 heures = 480 minutes)
        return Math.min(waitTimeMinutes, 480);
    }

    startRealTimeUpdates() {
        if (this.realTimeSubscription) {
            this.realTimeSubscription.unsubscribe();
        }

        if (this.isRealTime) {
            this.realTimeSubscription = interval(this.refreshInterval).subscribe(() => {
                this.loadPredictionData();
            });
        }
    }

    toggleRealTime() {
        this.isRealTime = !this.isRealTime;

        if (this.isRealTime) {
            this.startRealTimeUpdates();
        } else {
            if (this.realTimeSubscription) {
                this.realTimeSubscription.unsubscribe();
            }
        }
    }

    refreshData() {
        this.loadPredictionData();
    }

    updateChartData(labels: string[], predictions: number[], reals: number[]) {
        const documentStyle = getComputedStyle(document.documentElement);

        this.chartData = {
            labels: labels, // Labels pour l'axe X
            datasets: [
                {
                    label: 'Prédiction',
                    data: predictions,
                    borderColor: '#3B82F6', // Bleu plus visible
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.2,
                    fill: false
                },
                {
                    label: 'Temps réel',
                    data: reals,
                    borderColor: '#10B981', // Vert plus visible
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    tension: 0.2,
                    fill: false
                }
            ]
        };
    }

    setTestData() {
        // Données de test pour le développement avec timestamps réalistes
        const now = new Date();
        const labels = Array.from({length: 10}, (_, i) => {
            const time = new Date(now.getTime() - (9 - i) * 60000); // 1 min entre chaque point
            return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        });

        const testPredictions = Array.from({length: 10}, (_, i) =>
            Math.round((Math.sin(i * 0.5) * 30 + 70 + Math.random() * 15) * 100) / 100
        );
        const testReals = Array.from({length: 10}, (_, i) =>
            Math.round((Math.sin(i * 0.5) * 30 + 70 + Math.random() * 20) * 100) / 100
        );

        this.lastUpdate = new Date();
        this.updateChartData(labels, testPredictions, testReals);
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: borderColor,
                    borderWidth: 1,
                    callbacks: {
                        title: function(context: any) {
                            return `Patient: ${context[0].label}`;
                        },
                        label: function(context: any) {
                            const value = context.parsed.y;
                            const label = context.dataset.label;
                            const formattedTime = value >= 60
                                ? `${Math.floor(value / 60)}h ${value % 60}min`
                                : `${value} min`;
                            return `${label}: ${formattedTime}`;
                        },
                        afterBody: function(context: any) {
                            if (context.length >= 2) {
                                const predicted = context.find((c: any) => c.dataset.label === 'Prédiction')?.parsed.y;
                                const real = context.find((c: any) => c.dataset.label === 'Temps réel')?.parsed.y;
                                if (predicted && real) {
                                    const diff = Math.abs(predicted - real);
                                    const accuracy = Math.max(0, 100 - (diff / Math.max(predicted, real)) * 100);
                                    const formattedDiff = diff >= 60
                                        ? `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}min`
                                        : `${Math.round(diff)} min`;
                                    return [`Écart: ${formattedDiff}`, `Précision: ${accuracy.toFixed(1)}%`];
                                }
                            }
                            return [];
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Patients',
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: textMutedColor,
                        maxRotation: 45,
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Temps d\'attente (minutes)',
                        color: textColor,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: textMutedColor,
                        font: {
                            size: 12
                        },
                        callback: function(value: any) {
                            if (value >= 60) {
                                const hours = Math.floor(value / 60);
                                const minutes = value % 60;
                                return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
                            }
                            return value + ' min';
                        }
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.realTimeSubscription) {
            this.realTimeSubscription.unsubscribe();
        }
    }
}
