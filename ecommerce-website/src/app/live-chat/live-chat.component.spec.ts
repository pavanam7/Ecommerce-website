import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LiveChatComponent } from './live-chat.component';
import { ChatService } from '@services/chat.service';

describe('LiveChatComponent', () => {
  let component: LiveChatComponent;
  let fixture: ComponentFixture<LiveChatComponent>;
  let chatService: jest.Mocked<ChatService>;

  beforeEach(async () => {
    const chatServiceMock = {
      getMessages: jest.fn(),
      sendMessage: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LiveChatComponent, HttpClientTestingModule],
      providers: [
        { provide: ChatService, useValue: chatServiceMock }
      ]
    }).compileComponents();

    chatService = TestBed.inject(ChatService) as jest.Mocked<ChatService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
