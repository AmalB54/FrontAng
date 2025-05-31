import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { debounceTime, Subscription, interval } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { PatientSupabaseService } from '../../../supabase/services/patient-supabase.service';
import { FastApiService } from '../../service/fastapi.service';
import { Patient } from '../../../models/patient';

@Component({
    standalone: true,
    selector: 'app-surcharge-evolution-widget',
    imports: [CommonModule, ChartModule, ButtonModule],
    template: `<div class="card !mb-8">
        <div class="flex justify-between items-center mb-4">
            <div>
                <div class="font-semibold text-xl">Évolution de la surcharge par heure</div>
                <div class="text-sm text-muted-color mt-1">
                    Dernière analyse: {{ lastUpdate | date:'HH:mm:ss' }}
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
                    label="Analyser"
                    (onClick)="refreshData()"
                    severity="info"
                    size="small">
                </p-button>
            </div>
        </div>
        <p-chart type="line" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>`
})
export class SurchargeEvolutionWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;
    realTimeSubscription!: Subscription;

    // Propriétés pour le temps réel
    isRealTime: boolean = true;
    lastUpdate: Date = new Date();
    refreshInterval: number = 60000; // 1 minute

    // Seuils de surcharge
    surchargeThreshold: number = 8; // Plus de 8 patients/heure = surcharge

    constructor(
        private patientService: PatientSupabaseService,
        private fastApiService: FastApiService,
        public layoutService: LayoutService
    ) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
        this.loadSurchargeData();
        this.startRealTimeUpdates();
    }

    async loadSurchargeData() {
        try {
            console.log('🔄 Analyse de la surcharge par heure...');
            const patients = await this.patientService.getPatients();
            this.lastUpdate = new Date();

            if (patients && patients.length > 0) {
                // Analyser les patients par heure
                const hourlyData = this.analyzePatientsByHour(patients);

                // Prédire la surcharge pour chaque heure
                const surchargeData = await this.predictSurchargeByHour(hourlyData);

                this.updateChartData(surchargeData);
            } else {
                console.warn('⚠️ Aucun patient trouvé');
                this.setTestData();
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'analyse de surcharge:', error);
            this.setTestData();
        }
    }

    analyzePatientsByHour(patients: Patient[]): any[] {
        // Obtenir l'heure actuelle pour limiter l'analyse
        const currentHour = new Date().getHours();
        const hoursToAnalyze = currentHour + 1; // Inclure l'heure actuelle

        const hourlyStats = Array.from({length: hoursToAnalyze}, (_, hour) => ({
            hour,
            patientCount: 0,
            urgencyLevels: [] as number[],
            avgUrgency: 0
        }));

        // Compter les patients par heure basé sur date_entree (seulement pour aujourd'hui)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Début de la journée

        patients.forEach(patient => {
            const entryDate = new Date(patient.date_entree);
            const patientDay = new Date(entryDate);
            patientDay.setHours(0, 0, 0, 0);

            // Vérifier que le patient est arrivé aujourd'hui
            if (patientDay.getTime() === today.getTime()) {
                const hour = entryDate.getHours();

                // Seulement compter les heures passées et l'heure actuelle
                if (hour <= currentHour && hour < hourlyStats.length) {
                    hourlyStats[hour].patientCount++;
                    hourlyStats[hour].urgencyLevels.push(parseInt(patient.emergency_level));
                }
            }
        });

        // Calculer la moyenne d'urgence par heure
        hourlyStats.forEach(stat => {
            if (stat.urgencyLevels.length > 0) {
                stat.avgUrgency = stat.urgencyLevels.reduce((a, b) => a + b, 0) / stat.urgencyLevels.length;
            }
        });

        console.log(`📊 Statistiques par heure (00h à ${currentHour}h):`, hourlyStats);
        return hourlyStats;
    }

    async predictSurchargeByHour(hourlyData: any[]): Promise<number[]> {
        const surchargeResults: number[] = [];

        // Analyser seulement les heures disponibles dans hourlyData
        for (let i = 0; i < hourlyData.length; i++) {
            const data = hourlyData[i];

            // 🤖 UTILISER SEULEMENT VOTRE IA - Pas de fallback simple
            let surcharge = 0; // Par défaut Normal si IA échoue

            try {
                const today = new Date();
                const visitDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), data.hour);

                const surchargeInput = {
                    visit_date: visitDate.toISOString(),
                    day_of_week: this.getDayOfWeek(today),
                    available_beds: 75, // TODO: Récupérer depuis Supabase
                    urgency_level: Math.round(data.avgUrgency || 3).toString(),
                    season: this.getSeason(today),
                    local_event: 0, // TODO: Configurable selon événements
                    nurse_to_patient_ratio: Math.max(1, Math.floor(data.patientCount / 2) || 5)
                };

                console.log(`🤖 Appel IA pour ${data.hour}h (${data.patientCount} patients):`, surchargeInput);

                // ✅ SEULEMENT VOTRE IA - Pas d'autre logique
                const apiResult = await this.fastApiService.predictSurcharge(surchargeInput).toPromise();

                if (apiResult && typeof apiResult.prediction === 'number') {
                    surcharge = apiResult.prediction;
                    console.log(`🎯 IA décision ${data.hour}h: ${surcharge === 1 ? '🔴 SURCHARGE' : '🟢 NORMAL'} (${apiResult.surcharge})`);
                    if (apiResult.recommendations) {
                        console.log(`💡 Recommandation IA: ${apiResult.recommendations}`);
                    }
                } else {
                    console.warn(`⚠️ IA non disponible pour ${data.hour}h - Résultat: Normal par défaut`);
                }

            } catch (error) {
                console.warn(`❌ Erreur IA pour ${data.hour}h:`, error);
                console.log(`🔄 IA indisponible - Résultat: Normal par défaut`);
            }

            surchargeResults.push(surcharge);
        }

        console.log('🚨 Résultats de surcharge par heure:', surchargeResults);
        return surchargeResults;
    }

    getDayOfWeek(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    getSeason(date: Date): string {
        const month = date.getMonth() + 1;
        if (month >= 3 && month <= 5) return 'Spring';
        if (month >= 6 && month <= 8) return 'Summer';
        if (month >= 9 && month <= 11) return 'Autumn';
        return 'Winter';
    }

    updateChartData(surchargeData: number[]) {
        // Générer les labels seulement pour les heures analysées
        const hours = Array.from({length: surchargeData.length}, (_, i) => `${i.toString().padStart(2, '0')}h`);

        this.chartData = {
            labels: hours,
            datasets: [
                {
                    label: `État de surcharge`,
                    data: surchargeData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: surchargeData.map(val => val === 1 ? '#EF4444' : '#10B981'),
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 8,
                    tension: 0.1,
                    fill: true,
                    stepped: true // Courbe en escalier pour 0/1
                }
            ]
        };
    }

    setTestData() {
        // Données de test avec pattern réaliste seulement pour les heures passées
        const currentHour = new Date().getHours();
        const fullTestData = [
            0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,0,0,0
        ]; // Surcharge typique aux heures de pointe

        // Prendre seulement les heures jusqu'à maintenant
        const testData = fullTestData.slice(0, currentHour + 1);

        this.lastUpdate = new Date();
        this.updateChartData(testData);
    }

    startRealTimeUpdates() {
        if (this.realTimeSubscription) {
            this.realTimeSubscription.unsubscribe();
        }

        if (this.isRealTime) {
            this.realTimeSubscription = interval(this.refreshInterval).subscribe(() => {
                this.loadSurchargeData();
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
        this.loadSurchargeData();
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
                        font: { size: 14 },
                        generateLabels: function(chart: any) {
                            const original = chart.constructor.defaults.plugins.legend.labels.generateLabels;
                            const labels = original.call(this, chart);

                            // Forcer la couleur rouge pour la légende
                            labels.forEach((label: any) => {
                                if (label.text && label.text.includes('État de surcharge')) {
                                    label.fillStyle = '#EF4444';
                                    label.strokeStyle = '#EF4444';
                                }
                            });

                            return labels;
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
                            return `Heure: ${context[0].label}`;
                        },
                        label: function(context: any) {
                            const value = context.parsed.y;
                            return value === 1 ? '🔴 SURCHARGE' : '🟢 NORMAL';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Heures de la journée',
                        color: textColor,
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: textMutedColor,
                        font: { size: 11 }
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent'
                    }
                },
                y: {
                    display: true,
                    min: -0.1,
                    max: 1.1,
                    title: {
                        display: true,
                        text: 'État (0=Normal, 1=Surcharge)',
                        color: textColor,
                        font: { size: 14, weight: 'bold' }
                    },
                    ticks: {
                        color: textMutedColor,
                        font: { size: 12 },
                        stepSize: 1,
                        callback: function(value: any) {
                            return value === 1 ? 'Surcharge' : value === 0 ? 'Normal' : '';
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
