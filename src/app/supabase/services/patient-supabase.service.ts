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

  // ✅ Fonction dynamique pour le pie chart
  async getUrgencyLevelCounts(): Promise<{ level: number; count: number }[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('emergency_level');

    if (error || !data) {
      console.error('❌ Erreur chargement niveaux d’urgence :', error);
      return [];
    }

    const levelCounts = [1, 2, 3, 4, 5].map(level => ({
      level,
      count: data.filter((p: any) => Number(p.emergency_level) === level).length
    }));

    console.log('📊 Urgency level counts:', levelCounts); // 👈 pour debug
    return levelCounts;
  }
}
