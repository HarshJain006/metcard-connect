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
  isSaved?: boolean;
  needsConfirmation?: boolean; // For edited/retaken contacts
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  pendingRetakeMessageId: string | null;
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  updateMessageContact: (id: string, contact: Contact, needsConfirmation?: boolean) => void;
  deleteMessage: (id: string) => void;
  removeMessage: (id: string) => void;
  clearChat: () => void;
  setProcessing: (processing: boolean) => void;
  setPendingRetake: (messageId: string | null) => void;
  
  // API Actions
  extractContact: (imageFile: File, isRetake?: boolean) => Promise<Contact | null>;
  extractContactFromText: (text: string) => Promise<Contact | null>;
  appendContact: (contact: Contact, messageId?: string) => Promise<boolean>;
  saveContactAndMarkSaved: (contact: Contact, messageId: string) => Promise<boolean>;
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
  pendingRetakeMessageId: null,

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

  updateMessageContact: (id, contact, needsConfirmation = false) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, contact, needsConfirmation, isSaved: false } : msg
      ),
    }));
  },

  deleteMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
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
      pendingRetakeMessageId: null,
    });
  },

  setProcessing: (isProcessing) => set({ isProcessing }),

  setPendingRetake: (messageId) => set({ pendingRetakeMessageId: messageId }),

  extractContact: async (imageFile: File, isRetake = false) => {
    const { addMessage, updateMessage, setProcessing, pendingRetakeMessageId, setPendingRetake, deleteMessage } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;
    
    // If this is a retake, delete the old message first
    if (isRetake && pendingRetakeMessageId) {
      deleteMessage(pendingRetakeMessageId);
      setPendingRetake(null);
    }
    
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
        isSaved: false,
        needsConfirmation: isRetake,
      });
      
      // Auto-save if not a retake
      if (!isRetake) {
        setProcessing(false);
        await get().saveContactAndMarkSaved(contact, loadingId);
      } else {
        setProcessing(false);
      }
      
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
        isSaved: false,
        needsConfirmation: isRetake,
      });
      
      // Auto-save if not a retake
      if (!isRetake) {
        setProcessing(false);
        await get().saveContactAndMarkSaved(contact, loadingId);
      } else {
        setProcessing(false);
      }
      
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
        isSaved: false,
      });
      
      // Auto-save
      setProcessing(false);
      await get().saveContactAndMarkSaved(contact, loadingId);
      
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
        isSaved: false,
      });
      
      // Auto-save
      setProcessing(false);
      await get().saveContactAndMarkSaved(contact, loadingId);
      
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

  appendContact: async (contact: Contact, messageId?: string) => {
    const { addMessage, updateMessage } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;

    // Demo mode - simulate adding
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} has been added to your Google Sheet!`,
      });
      if (messageId) {
        updateMessage(messageId, { isSaved: true, needsConfirmation: false });
      }
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
      
      if (messageId) {
        updateMessage(messageId, { isSaved: true, needsConfirmation: false });
      }
      
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

  saveContactAndMarkSaved: async (contact: Contact, messageId: string) => {
    const { addMessage, updateMessage } = get();
    const isDemoMode = useAuthStore.getState().isDemoMode;

    // Demo mode - simulate saving
    if (isDemoMode || DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateMessage(messageId, { isSaved: true });
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} saved to your Google Sheet!`,
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
        throw new Error('Failed to save contact');
      }
      
      updateMessage(messageId, { isSaved: true });
      addMessage({
        type: 'system',
        content: `✅ ${contact.name} saved to your Google Sheet!`,
      });
      
      return true;
    } catch (error) {
      console.error('Save contact error:', error);
      addMessage({
        type: 'system',
        content: '❌ Failed to save contact. You can try adding it manually.',
      });
      // Mark as needs confirmation so user can retry
      updateMessage(messageId, { needsConfirmation: true });
      return false;
    }
  },
}));
