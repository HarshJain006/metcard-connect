import { create } from 'zustand';
import { DEMO_MODE, generateMockContact } from '@/lib/mockData';
import { useAuthStore } from './authStore';
import * as api from '@/lib/api';

export interface Contact {
  id: string;
  name: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content?: string;
  imageUrl?: string;
  contact?: Contact;
  isLoading?: boolean;
  timestamp: Date;
  savedToSheet?: boolean;  // Track if auto-saved
  originalContact?: Contact; // For tracking changes
}

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  removeMessage: (id: string) => void;
  clearChat: () => void;
  setProcessing: (processing: boolean) => void;
  
  // API Actions
  extractContact: (imageFile: File) => Promise<Contact | null>;
  extractContactFromText: (text: string) => Promise<Contact | null>;
  updateContactInSheet: (messageId: string, contact: Contact) => Promise<boolean>;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to All We Met! 📸 Take a photo of a business card to get started.',
      timestamp: new Date(),
    },
  ],
  isProcessing: false,

  addMessage: (message) => {
    const id = generateId();
    set((state) => ({
      messages: [...state.messages, { ...message, id, timestamp: new Date() }],
    }));
    return id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },

  clearChat: () => {
    set({
      messages: [
        {
          id: 'welcome',
          type: 'system',
          content: 'Chat cleared. Take a photo of a business card to continue.',
          timestamp: new Date(),
        },
      ],
    });
  },

  setProcessing: (isProcessing) => set({ isProcessing }),

  extractContact: async (imageFile: File) => {
    const { addMessage, updateMessage, setProcessing } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;
    
    // Create image URL for display
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Add user message with image
    addMessage({
      type: 'user',
      imageUrl,
    });
    
    // Add loading bot message
    const loadingId = addMessage({
      type: 'bot',
      isLoading: true,
    });
    
    setProcessing(true);

    // Demo mode - simulate extraction with auto-save
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const contact = generateMockContact();
      
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        originalContact: { ...contact }, // Store original for comparison
        savedToSheet: true,
        content: 'Contact extracted and saved to your sheet:',
      });
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been automatically added to your Google Sheet!`,
      });
      
      setProcessing(false);
      return contact;
    }
    
    try {
      const result = await api.extractContactFromImage(imageFile);
      const contact = result.contact;
      
      // Update loading message with contact - auto-saved by backend
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        originalContact: { ...contact },
        savedToSheet: true,
        content: 'Contact extracted and saved to your sheet:',
      });
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been automatically added to your Google Sheet!`,
      });
      
      setProcessing(false);
      return contact;
    } catch (error) {
      console.error('Extract contact error:', error);
      updateMessage(loadingId, {
        isLoading: false,
        content: 'Sorry, I couldn\'t extract the contact information. Please try again with a clearer image.',
      });
      setProcessing(false);
      return null;
    }
  },

  extractContactFromText: async (text: string) => {
    const { addMessage, updateMessage, setProcessing } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;
    
    // Add user message with text
    addMessage({
      type: 'user',
      content: text,
    });
    
    // Add loading bot message
    const loadingId = addMessage({
      type: 'bot',
      isLoading: true,
    });
    
    setProcessing(true);

    // Demo mode - simulate extraction with auto-save
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const contact = generateMockContact();
      
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        originalContact: { ...contact },
        savedToSheet: true,
        content: 'Contact extracted and saved to your sheet:',
      });
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been automatically added to your Google Sheet!`,
      });
      
      setProcessing(false);
      return contact;
    }
    
    try {
      const result = await api.extractContactFromText(text);
      const contact = result.contact;
      
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        originalContact: { ...contact },
        savedToSheet: true,
        content: 'Contact extracted and saved to your sheet:',
      });
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been automatically added to your Google Sheet!`,
      });
      
      setProcessing(false);
      return contact;
    } catch (error) {
      console.error('Extract contact from text error:', error);
      updateMessage(loadingId, {
        isLoading: false,
        content: "Sorry, I couldn't extract the contact information. Please try again.",
      });
      setProcessing(false);
      return null;
    }
  },

  updateContactInSheet: async (messageId: string, contact: Contact) => {
    const { addMessage, updateMessage } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;

    // Demo mode - simulate update
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateMessage(messageId, {
        contact,
        originalContact: { ...contact },
      });
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name}'s contact has been updated in your Google Sheet!`,
      });
      return true;
    }
    
    try {
      await api.updateContact(contact.id, contact);
      
      updateMessage(messageId, {
        contact,
        originalContact: { ...contact },
      });
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name}'s contact has been updated in your Google Sheet!`,
      });
      
      return true;
    } catch (error) {
      console.error('Update contact error:', error);
      addMessage({
        type: 'system',
        content: '❌ Failed to update contact in sheet. Please try again.',
      });
      return false;
    }
  },
}));
