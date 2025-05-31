import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

// Configuration avancée pour éviter les problèmes de verrouillage
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-application-name': 'hospital-dashboard'
    }
  },
  realtime: {
    timeout: 30000, // Augmenter le timeout pour éviter les erreurs de verrouillage
    params: {
      eventsPerSecond: 10
    }
  }
};

export const supabase = createClient(
  environment.supabaseUrl,
  environment.supabaseKey,
  supabaseOptions
);

// Fonction utilitaire pour vérifier la connexion
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};
