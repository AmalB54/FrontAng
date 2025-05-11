// Correction complète du service PatientSupabaseService
import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Patient } from '../../models/patient';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

@Injectable({ providedIn: 'root' })
export class PatientSupabaseService {
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw error;
    return data as Patient[];
  }

  async addPatient(patient: Partial<Patient>): Promise<void> {
    // Éviter d'envoyer un champ id, Supabase va le générer
    const { id, ...patientWithoutId } = patient;
    const { error } = await supabase.from('patients').insert(patientWithoutId);
    if (error) throw error;
  }

  async updatePatient(patient: Patient): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update(patient)
      .eq('id', patient.id);
    if (error) throw error;
  }

  async deletePatient(id: number): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
