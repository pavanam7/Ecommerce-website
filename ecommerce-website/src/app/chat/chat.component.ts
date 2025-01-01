import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, ChatSession } from '../services/chat.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  currentMessage = '';
  isMinimized = true;
  isTyping = false;
  chatSession: ChatSession | null = null;
  private typingSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private chatService: ChatService) {
    this.setupTypingIndicator();
  }

  ngOnInit() {
    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      });

    this.chatService.chatSession$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        this.chatSession = session;
      });

    this.chatService.typing$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isTyping => {
        this.isTyping = isTyping;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.disconnect();
  }

  private setupTypingIndicator() {
    this.typingSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(text => {
        this.chatService.setTyping(text.length > 0);
      });
  }

  toggleChat() {
    if (!this.chatSession && !this.isMinimized) {
      this.chatService.startChat();
    }
    this.isMinimized = !this.isMinimized;
  }

  onMessageInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    this.typingSubject.next(text);
  }

  sendMessage() {
    if (!this.currentMessage.trim()) return;

    this.chatService.sendMessage(this.currentMessage);
    this.currentMessage = '';
    this.chatService.setTyping(false);
  }

  endChat() {
    this.chatService.endChat();
    this.isMinimized = true;
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }

  getMessageClass(message: ChatMessage): string {
    return message.sender === 'user' ? 'message-user' : 'message-agent';
  }

  formatTimestamp(date: Date): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 