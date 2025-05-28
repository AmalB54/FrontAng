import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { Nurse } from '../models/nurse';
import { NurseSupabaseService } from '../supabase/services/nurse-supabase.service';
import { TagModule } from 'primeng/tag';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-nurses',
  standalone: true,
  templateUrl: './nurse.component.html',
  styleUrls: ['./nurse.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    InputSwitchModule,
    
  ]
})
export class NursesComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  nurses: Nurse[] = [];
  nurseDialog = false;
  editDialogVisible = false;
  newNurse: Partial<Nurse> = {};
  selectedNurse: Nurse = {} as Nurse;
  submitted = false;

  constructor(private nurseService: NurseSupabaseService) {}

  ngOnInit(): void {
    this.loadNurses();
  }

  async loadNurses(): Promise<void> {
    const result = await this.nurseService.getNurses();
    if (result && 'data' in result) {
      this.nurses = result.data as Nurse[];
    } else {
      console.error('Erreur de chargement des infirmiers:', result);
    }
  }

  openNewNurseDialog(): void {
    this.newNurse = {};
    this.submitted = false;
    this.nurseDialog = true;
  }

  async saveNurse(): Promise<void> {
    this.submitted = true;
    if (this.newNurse.name && this.newNurse.age !== undefined && this.newNurse.department) {
      const nurse: Partial<Nurse> = {
        ...this.newNurse,
        is_on_duty: this.newNurse.is_on_duty ?? true
      };
      try {
        await this.nurseService.addNurse(nurse);
        this.nurseDialog = false;
        await this.loadNurses();
      } catch (error) {
        console.error("Erreur lors de l’ajout de l’infirmier :", error);
      }
    }
  }

  editNurse(nurse: Nurse): void {
    this.selectedNurse = { ...nurse };
    this.editDialogVisible = true;
  }

  async updateNurse(): Promise<void> {
    try {
      await this.nurseService.updateNurse(this.selectedNurse);
      this.editDialogVisible = false;
      await this.loadNurses();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l’infirmier :", error);
    }
  }

  async deleteNurse(id: number): Promise<void> {
    try {
      await this.nurseService.deleteNurse(id);
      await this.loadNurses();
    } catch (error) {
      console.error("Erreur lors de la suppression de l’infirmier :", error);
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }
  
}
