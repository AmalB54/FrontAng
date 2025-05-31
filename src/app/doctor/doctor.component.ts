import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Doctor } from '../models/doctor';
import { Table } from 'primeng/table';
import { DoctorSupabaseService } from '../supabase/services/doctor-supabase.service';
import { TagModule } from 'primeng/tag'; // <-- ajouter cette ligne
import { InputSwitchModule } from 'primeng/inputswitch';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor',
  standalone: true,
  templateUrl: './doctor.component.html',
  styleUrls: ['./doctor.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    IconFieldModule,
    TagModule,
    InputIconModule,
    InputSwitchModule 
  ]
})
export class DoctorListComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  doctors: Doctor[] = [];
  doctorDialog = false;
  editDialogVisible = false;
  newDoctor: Partial<Doctor> = {};
  selectedDoctor: Doctor = {} as Doctor;
  submitted = false;

  constructor(private doctorService: DoctorSupabaseService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  async loadDoctors() {
    try {
      this.doctors = await this.doctorService.getDoctors();
    } catch (error) {
      console.error('Erreur de chargement des médecins:', error);
    }
  }
  

  openNewDoctorDialog(): void {
    this.newDoctor = {};
    this.submitted = false;
    this.doctorDialog = true;
  }

  async saveDoctor(): Promise<void> {
    this.submitted = true;
    if (this.newDoctor.name && this.newDoctor.age && this.newDoctor.specialty && this.newDoctor.department) {
      try {
        await this.doctorService.addDoctor({
          ...this.newDoctor,
          is_on_duty: this.newDoctor.is_on_duty ?? true        } as Doctor);
        this.doctorDialog = false;
        this.loadDoctors();
      } catch (error) {
        console.error('Erreur lors de l’ajout du médecin :', error);
      }
    }
  }

  editDoctor(doctor: Doctor): void {
    this.selectedDoctor = { ...doctor };
    this.editDialogVisible = true;
  }

  async updateDoctor(): Promise<void> {
    try {
      await this.doctorService.updateDoctor(this.selectedDoctor);
      this.editDialogVisible = false;
      this.loadDoctors();
    } catch (error) {
      console.error('Erreur de mise à jour :', error);
    }
  }

  async deleteDoctor(id: number): Promise<void> {
    try {
      await this.doctorService.deleteDoctor(id);
      this.loadDoctors();
    } catch (error) {
      console.error('Erreur de suppression :', error);
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }
  
}