import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionResult {
  prediction: number;
  real_value: number;
}

export interface PredictionResponse {
  count: number;
  results: PredictionResult[];
}

export interface SurchargeInput {
  visit_date: string;
  day_of_week: string;
  available_beds: number;
  urgency_level: string;
  season: string;
  local_event: number;
  nurse_to_patient_ratio: number;
}

export interface SurchargeResponse {
  prediction: number;
  surcharge: string;
  recommendations?: string;
}

@Injectable({ providedIn: 'root' })
export class FastApiService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  /**
   * Récupère les prédictions vs valeurs réelles depuis la base de données
   */
  getPredictionsFromDb(limit: number = 100): Observable<PredictionResponse> {
    return this.http.get<PredictionResponse>(`${this.baseUrl}/predict_from_db?limit=${limit}`);
  }

  /**
   * Prédiction individuelle
   */
  predict(features: number[]): Observable<{ prediction: number }> {
    return this.http.post<{ prediction: number }>(`${this.baseUrl}/predict`, { features });
  }

  /**
   * Prédiction de surcharge
   */
  predictSurcharge(data: SurchargeInput): Observable<SurchargeResponse> {
    return this.http.post<SurchargeResponse>(`${this.baseUrl}/predict_surcharge`, data);
  }

  /**
   * Prévision de trafic
   */
  forecastTraffic(dayOfWeek: string, season: string, localEvent: number = 0): Observable<any> {
    return this.http.get(`${this.baseUrl}/forecast_traffic`, {
      params: { day_of_week: dayOfWeek, season, local_event: localEvent.toString() }
    });
  }

  /**
   * Analyser les patients critiques
   */
  analyzePatients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/analyze_patients`);
  }

  /**
   * Envoyer une alerte test
   */
  sendTestAlert(message: string = '🚨 Alerte test manuelle'): Observable<any> {
    return this.http.get(`${this.baseUrl}/send_test_alert`, {
      params: { message }
    });
  }
}
