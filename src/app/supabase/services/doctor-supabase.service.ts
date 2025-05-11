import { Injectable } from '@angular/core';
import { Doctor } from '../../models/doctor';
import { supabase } from '../../supabaseClient';

@Injectable({
  providedIn: 'root'
})
export class DoctorSupabaseService {
  private table = 'doctors';

  async getDoctors(): Promise<Doctor[]> {
    const response = await supabase.from(this.table).select('*');
    if (response.error) {
      console.error('Erreur de chargement des docteurs :', response.error.message);
      return [];
    }
    return response.data as Doctor[];
  }

  async addDoctor(doctor: Partial<Doctor>): Promise<void> {
    const response = await supabase.from(this.table).insert(doctor);
    if (response.error) {
      throw new Error(response.error.message);
    }
  }

  async updateDoctor(doctor: Doctor): Promise<void> {
    const response = await supabase
      .from(this.table)
      .update(doctor)
      .eq('id', doctor.id);
    if (response.error) {
      throw new Error(response.error.message);
    }
  }

  async deleteDoctor(id: number): Promise<void> {
    const response = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);
    if (response.error) {
      throw new Error(response.error.message);
    }
  }
}
