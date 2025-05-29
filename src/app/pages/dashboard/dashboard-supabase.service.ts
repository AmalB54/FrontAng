import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

@Injectable({ providedIn: 'root' })
export class DashboardSupabaseService {
  async getAvailableBeds(): Promise<number> {
    const { data, error } = await supabase.rpc('get_available_beds_count');
    if (error) {
      console.error('Erreur getAvailableBeds:', error);
      return 0;
    }
    return data;
  }

  async getAvailableAmbulances(): Promise<number> {
    const { data, error } = await supabase.rpc('get_available_ambulances_count');
    if (error) {
      console.error('Erreur getAvailableAmbulances:', error);
      return 0;
    }
    return data;
  }

  async getTotalPatients(): Promise<number> {
    const { count, error } = await supabase.from('patients').select('*', { count: 'exact', head: true });
    if (error) {
      console.error('Erreur getTotalPatients:', error);
      return 0;
    }
    return count || 0;
  }

async getAdmittedPatients(): Promise<number> {
  const { count, error } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('etat', 'admitted'); // 👈 ici on remplace 'status' par 'etat'

  if (error) {
    console.error('Erreur getAdmittedPatients:', error);
    return 0;
  }
  return count || 0;
}

}
