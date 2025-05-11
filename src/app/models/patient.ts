export interface Patient {
  id: number;
  nom: string;
  maladie: string;
  emergency_level: string;
  date_naissance: Date;
  date_entree: Date;
  etat: 'waiting' | 'in-progress' | 'left';
  date_sortie?: Date;

  // Champs ajoutés pour la prédiction
  available_beds_percent?: number;
  nurse_to_patient_ratio?: number;
  specialist_availability?: number;
  time_to_registration_min?: number;
  time_to_medical_professional_min?: number;
  date_prise_en_charge?: Date;
  // Résultat de prédiction
  predicted_wait_time?: number;
}
