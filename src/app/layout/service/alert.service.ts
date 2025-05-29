import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private socket: WebSocket;
  private alertSubject = new Subject<string>();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8001/ws/alerts');
    
    this.socket.onopen = () => {
      console.log('✅ WebSocket connecté');
    };

    this.socket.onmessage = (event) => {
      console.log('📨 Message reçu :', event.data);
      this.alertSubject.next(event.data);
    };

    this.socket.onerror = (err) => {
      console.error('❌ Erreur WebSocket', err);
    };

    this.socket.onclose = () => {
      console.warn('❌ WebSocket fermé');
    };
  }

  getAlerts(): Observable<string> {
    return this.alertSubject.asObservable();
  }
}
