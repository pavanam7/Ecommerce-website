import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  agentName?: string;
  agentAvatar?: string;
  status: 'waiting' | 'connected' | 'ended';
  startTime: Date;
  endTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket$: WebSocketSubject<any>;
  private chatSession = new BehaviorSubject<ChatSession | null>(null);
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private typing = new BehaviorSubject<boolean>(false);
  private reconnection$ = new Subject<void>();
  private readonly RECONNECT_INTERVAL = 5000;

  chatSession$ = this.chatSession.asObservable();
  messages$ = this.messages.asObservable();
  typing$ = this.typing.asObservable();

  constructor() {
    this.socket$ = this.createWebSocket();
    this.setupReconnection();
  }

  private createWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: `${environment.wsUrl}/chat`,
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
          this.authenticate();
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed');
          this.reconnection$.next();
        }
      }
    });
  }

  private setupReconnection(): void {
    this.reconnection$.subscribe(() => {
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.socket$ = this.createWebSocket();
        this.setupSocketListeners();
      }, this.RECONNECT_INTERVAL);
    });
  }

  private setupSocketListeners(): void {
    this.socket$.subscribe({
      next: (message) => this.handleMessage(message),
      error: (error) => {
        console.error('WebSocket error:', error);
        this.reconnection$.next();
      }
    });
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case 'session':
        this.chatSession.next(message.data);
        break;
      case 'message':
        const currentMessages = this.messages.value;
        this.messages.next([...currentMessages, message.data]);
        break;
      case 'typing':
        this.typing.next(message.data.isTyping);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private authenticate(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.socket$.next({
        type: 'auth',
        data: { token }
      });
    }
  }

  startChat(): void {
    this.socket$.next({
      type: 'start',
      data: { timestamp: new Date() }
    });
  }

  sendMessage(text: string): void {
    const message: Partial<ChatMessage> = {
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    this.socket$.next({
      type: 'message',
      data: message
    });
  }

  setTyping(isTyping: boolean): void {
    this.socket$.next({
      type: 'typing',
      data: { isTyping }
    });
  }

  endChat(): void {
    this.socket$.next({
      type: 'end',
      data: { timestamp: new Date() }
    });
    this.chatSession.next(null);
    this.messages.next([]);
  }

  disconnect(): void {
    this.socket$.complete();
  }
}
