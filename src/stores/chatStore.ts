import { create } from 'zustand';
import { API_BASE_URL, API_ENDPOINTS } from '@/config';
import { DEMO_MODE, generateMockContact } from '@/lib/mockData';
import { useAuthStore } from './authStore';

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
  appendContact: (contact: Contact) => Promise<boolean>;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      type: 'system',
      content: 'Welcome to SaveMyName! 📸 Take a photo of a business card to get started.',
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

    // Demo mode - simulate extraction
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const contact = generateMockContact();
      
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        content: 'I found the following contact information:',
      });
      
      setProcessing(false);
      return contact;
    }
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTRACT_CONTACT}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract contact');
      }
      
      const contact: Contact = await response.json();
      
      // Update loading message with contact
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        content: 'I found the following contact information:',
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

    // Demo mode - simulate extraction
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const contact = generateMockContact();
      
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        content: 'I found the following contact information:',
      });
      
      setProcessing(false);
      return contact;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXTRACT_CONTACT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract contact');
      }
      
      const contact: Contact = await response.json();
      
      updateMessage(loadingId, {
        isLoading: false,
        contact,
        content: 'I found the following contact information:',
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

  appendContact: async (contact: Contact) => {
    const { addMessage } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;

    // Demo mode - simulate adding
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been added to your Google Sheet!`,
      });
      return true;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPEND_CONTACT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to add contact to sheet');
      }
      
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been added to your Google Sheet!`,
      });
      
      return true;
    } catch (error) {
      console.error('Append contact error:', error);
      addMessage({
        type: 'system',
        content: '❌ Failed to add contact to sheet. Please try again.',
      });
      return false;
    }
  },
}));
