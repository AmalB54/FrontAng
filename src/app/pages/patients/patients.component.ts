import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient';
import { PredictionService } from '../service/prediction.service';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { PatientSupabaseService } from '../../supabase/services/patient-supabase.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    TableModule,
    MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    RatingModule,
    RippleModule,
    IconFieldModule,
    DropdownModule,
    DialogModule,
    CalendarModule
  ],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  etatOptions = [
    { label: 'En attente', value: 'waiting' },
    { label: 'Pris en charge', value: 'in-progress' },
    { label: 'Sorti', value: 'left' }
  ];
  selectedEtat = '';
  patientDialog = false;
  submitted = false;
  newPatient: Partial<Patient> = {};
  selectedPatient: Patient = {} as Patient;
  editDialogVisible = false;

  emergencyLevels = [
    { label: '1 - Faible', value: '1' },
    { label: '2 - Légère', value: '2' },
    { label: '3 - Moyenne', value: '3' },
    { label: '4 - Élevée', value: '4' },
    { label: '5 - Critique', value: '5' }
  ];
  selectedUrgenceLevel = '';

  @ViewChild('filter') filter!: ElementRef;

  constructor(
    private patientService: PatientSupabaseService,
    private predictionService: PredictionService
  ) {}
  now: Date = new Date();


  ngOnInit(): void {
    this.loadPatients();
    setInterval(() => {
      this.now = new Date(); // Met à jour l'heure actuelle chaque minute
    }, 60000);
  }
  

  async loadPatients(): Promise<void> {
    try {
      const raw = await this.patientService.getPatients();
      this.patients = raw
        .map(p => ({
          ...p,
          emergency_level: String(p.emergency_level)
        }))
        .sort((a, b) => {
          const etatOrder = { 'waiting': 0, 'in-progress': 1, 'left': 2 };
          return etatOrder[a.etat] - etatOrder[b.etat];
        });
    } catch (error) {
      console.error('Erreur chargement patients :', error);
    } finally {
      this.loading = false;
    }
  }
  
  openNewPatientDialog() {
    this.newPatient = {};
    this.submitted = false;
    this.patientDialog = true;
  }

  async savePatient() {
    this.submitted = true;
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);


    const p = this.newPatient;
    if (
      p.nom &&
      p.date_naissance &&
      p.maladie &&
      p.emergency_level &&
      p.nurse_to_patient_ratio !== undefined &&
      p.specialist_availability !== undefined &&
      p.time_to_registration_min !== undefined &&
      p.time_to_medical_professional_min !== undefined &&
      p.available_beds_percent !== undefined
    ) {
      const features = [
        parseFloat(p.emergency_level),
        p.nurse_to_patient_ratio,
        p.specialist_availability,
        p.time_to_registration_min,
        p.time_to_medical_professional_min,
        p.available_beds_percent
      ];

      try {
        const res = await this.predictionService.predict(features).toPromise();

        if (res && res.prediction !== undefined) {
          const predicted = res.prediction;

          const patientToAdd: Omit<Patient, 'id'> = {
            nom: p.nom,
            maladie: p.maladie,
            date_naissance: p.date_naissance,
            emergency_level: p.emergency_level,
            nurse_to_patient_ratio: p.nurse_to_patient_ratio,
            specialist_availability: p.specialist_availability,
            time_to_registration_min: p.time_to_registration_min,
            time_to_medical_professional_min: p.time_to_medical_professional_min,
            available_beds_percent: p.available_beds_percent,
            predicted_wait_time: predicted,
            date_entree: localDate,
            etat: 'waiting'
          };

          await this.patientService.addPatient(patientToAdd);
          this.patientDialog = false;
          await this.loadPatients();
        } else {
          console.error('Réponse invalide de prédiction :', res);
        }
      } catch (err) {
        console.error('Erreur ajout patient :', err);
      }
    }
  }

  async deletePatient(id: number) {
    try {
      await this.patientService.deletePatient(id);
      this.loadPatients();
    } catch (err) {
      console.error('Erreur suppression patient :', err);
    }
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onEtatChange(event: any, table: Table) {
    table.filter(event.value, 'etat', 'equals');
  }

  onUrgenceChange(event: any, table: Table) {
    table.filter(event.value, 'emergency_level', 'equals');
  }

  getSeverity(level: string) {
    switch (level) {
      case '1': return 'secondary';
      case '2': return 'info';
      case '3': return 'success';
      case '4': return 'warn';
      case '5': return 'danger';
      default: return 'contrast';
    }
  }

  calculateAge(dateNaissance: Date): number {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  calculateWaitingTime(dateEntree: Date, dateFin?: Date): string {
    const entree = new Date(dateEntree);
    const end = dateFin ? new Date(dateFin) : this.now;
  
    const diffMs = end.getTime() - entree.getTime();
  
    if (diffMs < 0) return '0 min'; // sécurité si entrée > now
  
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) return `${days}j ${hours % 24}h`;
    else if (hours > 0) return `${hours}h ${minutes % 60}m`;
    else return `${minutes} min`;
  }
  

  async changerEtat(patient: Patient, nouvelEtat: 'waiting' | 'in-progress' | 'left') {
    patient.etat = nouvelEtat;
  
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  
    if (nouvelEtat === 'in-progress') {
      patient.date_prise_en_charge = localNow;
    }
  
    if (nouvelEtat === 'left') {
      patient.date_sortie = localNow;
    }
  
    try {
      await this.patientService.updatePatient(patient);
      this.loadPatients();
    } catch (err) {
      console.error('Erreur maj état patient :', err);
    }
  }
  

  getEtatLabel(etat: string): string {
    switch (etat) {
      case 'waiting': return 'En attente';
      case 'in-progress': return 'Pris en charge';
      case 'left': return 'Sorti';
      default: return '';
    }
  }

  getEtatSeverity(etat: 'waiting' | 'in-progress' | 'left'): 'success' | 'info' | 'warn' | 'danger' | 'contrast' | 'secondary' {
    switch (etat) {
      case 'waiting': return 'warn';
      case 'in-progress': return 'success';
      case 'left': return 'danger';
      default: return 'secondary';
    }
  }

  editPatient(patient: Patient) {
    this.selectedPatient = { ...patient };
    this.editDialogVisible = true;
  }

  async updatePatient() {
    if (!this.selectedPatient.nom) return;
    try {
      await this.patientService.updatePatient(this.selectedPatient);
      this.editDialogVisible = false;
      this.loadPatients();
    } catch (err) {
      console.error('Erreur maj patient :', err);
    }
  }

  getWaitingTime(patient: Patient): string {
    if (patient.etat === 'waiting') {
      return '0 min';
    }

    const start = new Date(patient.date_entree);
    const end =
      patient.etat === 'in-progress' && patient.date_prise_en_charge
        ? new Date(patient.date_prise_en_charge)
        : patient.etat === 'left' && patient.date_sortie
        ? new Date(patient.date_sortie)
        : new Date();

    return this.calculateWaitingTime(start, end);
  }
}
