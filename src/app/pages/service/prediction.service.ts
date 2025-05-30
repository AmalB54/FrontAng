import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private apiUrl = 'http://127.0.0.1:8000/predict';

  constructor(private http: HttpClient) {}

  predict(features: number[]) {
    return this.http.post<{ prediction: number }>(this.apiUrl, { features });
  }
}
