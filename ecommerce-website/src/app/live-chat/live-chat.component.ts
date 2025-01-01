import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ChatService } from '@services/chat.service';
import { Subscription } from 'rxjs';

interface ChatMessage {
  id?: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isSupport?: boolean;
}

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './live-chat.component.html',
  styleUrls: ['./live-chat.component.scss']
})
export class LiveChatComponent implements OnInit, OnDestroy {
  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  isChatOpen = false;
  isTyping = false;
  isConnected = false;
  currentUser: any;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private chatService: ChatService
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.connectToChat();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  connectToChat() {
    this.chatService.connect();
    
    const connectionSub = this.chatService.connectionStatus$.subscribe((status: boolean) => {
      this.isConnected = status;
    });

    const messagesSub = this.chatService.messages$.subscribe((message: ChatMessage) => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    const typingSub = this.chatService.typingStatus$.subscribe((typing: boolean) => {
      this.isTyping = typing;
    });

    this.subscriptions.push(connectionSub, messagesSub, typingSub);
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    if (this.chatForm.invalid || !this.currentUser) {
      return;
    }

    const message: ChatMessage = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      message: this.chatForm.value.message,
      timestamp: new Date()
    };

    this.chatService.sendMessage(message);
    this.chatForm.reset();
  }

  startTyping() {
    this.chatService.startTyping();
  }

  stopTyping() {
    this.chatService.stopTyping();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
