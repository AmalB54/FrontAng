import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Nurse } from '../../models/nurse';

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

@Injectable({ providedIn: 'root' })
export class NurseSupabaseService {
  private table = 'nurses';

  getNurses() {
    return supabase.from(this.table).select('*');
  }

  addNurse(nurse: Partial<Nurse>) {
    return supabase.from(this.table).insert([nurse]);
  }

  updateNurse(nurse: Nurse) {
    return supabase.from(this.table).update(nurse).eq('id', nurse.id);
  }

  deleteNurse(id: number) {
    return supabase.from(this.table).delete().eq('id', id);
  }
}
