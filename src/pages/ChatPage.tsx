import { useState, useRef, useEffect } from 'react';
import { useChatStore, type ChatMessage } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Send, X, Loader2, Building, Mail, Phone, User, Briefcase, Plus, Check, Edit3, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contact } from '@/stores/chatStore';

const ChatPage = () => {
  const { messages, isProcessing, extractContact, extractContactFromText, appendContact } = useChatStore();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [textInput]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setTextInput('');
    }
  };

  const handleSend = async () => {
    if (selectedImage) {
      await extractContact(selectedImage);
      setSelectedImage(null);
      setPreviewUrl(null);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    } else if (textInput.trim()) {
      await extractContactFromText(textInput.trim());
      setTextInput('');
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing && (selectedImage || textInput.trim())) {
        handleSend();
      }
    }
  };

  const canSend = selectedImage || textInput.trim();

  return (
    <div className="flex flex-col h-full bg-gradient-hero">
      {/* Chat Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              onAddToSheet={appendContact}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/30 bg-surface-1/95 backdrop-blur-sm px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {/* Preview */}
          {previewUrl && (
            <div className="mb-3 relative inline-block">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-20 w-auto rounded-lg object-cover border border-border"
              />
              <button
                onClick={handleClearImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-2">
            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {/* Camera button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
              className="h-11 w-11 shrink-0 rounded-full bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-primary transition-colors"
              title="Take a photo"
            >
              <Camera className="w-5 h-5" />
            </Button>

            {/* Gallery button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isProcessing}
              className="h-11 w-11 shrink-0 rounded-full bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-primary transition-colors"
              title="Upload from gallery"
            >
              <Image className="w-5 h-5" />
            </Button>

            {/* Text input */}
            <div className="flex-1 bg-surface-2 rounded-2xl px-4 py-2.5 min-h-[44px] flex items-center">
              <textarea
                ref={textareaRef}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedImage ? selectedImage.name : "Type contact details or take a photo..."}
                disabled={isProcessing || !!selectedImage}
                rows={1}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={!canSend || isProcessing}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-primary hover:bg-primary-dark text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  onAddToSheet: (contact: Contact) => Promise<boolean>;
}

const MessageBubble = ({ message, onAddToSheet }: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(message.contact || null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToSheet = async () => {
    if (!editedContact) return;
    setIsAdding(true);
    const success = await onAddToSheet(editedContact);
    setIsAdding(false);
    if (success) {
      setIsAdded(true);
    }
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="bg-surface-2 text-muted-foreground text-sm px-4 py-2 rounded-full max-w-xs text-center">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.type === 'user') {
    return (
      <div className="flex justify-end animate-slide-in-right">
        <div className="chat-bubble-user p-3 max-w-xs">
          {message.imageUrl && (
            <img 
              src={message.imageUrl} 
              alt="Business card" 
              className="rounded-lg max-w-full"
            />
          )}
          {message.content && (
            <p className="text-sm mt-2">{message.content}</p>
          )}
        </div>
      </div>
    );
  }

  // Bot message
  return (
    <div className="flex justify-start animate-slide-in-left">
      <div className="chat-bubble-bot p-4 max-w-sm w-full">
        {message.isLoading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Analyzing business card...</span>
          </div>
        ) : message.contact ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{message.content}</p>
            
            {/* Contact Card */}
            <div className="bg-surface-1 rounded-xl p-4 space-y-3 border border-border/50">
              {isEditing && editedContact ? (
                <EditableContactCard 
                  contact={editedContact} 
                  onChange={setEditedContact}
                  onSave={() => setIsEditing(false)}
                />
              ) : (
                <ContactCard contact={editedContact || message.contact} />
              )}
            </div>

            {/* Actions */}
            {!isAdded && (
              <div className="flex gap-2">
                <Button
                  onClick={handleAddToSheet}
                  disabled={isAdding}
                  className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add to Sheet
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isAdded && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <Check className="w-4 h-4" />
                <span>Added to your sheet!</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
      </div>
    </div>
  );
};

const ContactCard = ({ contact }: { contact: Contact }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-primary" />
      <span className="font-medium">{contact.name || 'Unknown'}</span>
    </div>
    {contact.company && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building className="w-4 h-4" />
        <span>{contact.company}</span>
      </div>
    )}
    {contact.title && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Briefcase className="w-4 h-4" />
        <span>{contact.title}</span>
      </div>
    )}
    {contact.phone && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="w-4 h-4" />
        <span>{contact.phone}</span>
      </div>
    )}
    {contact.email && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="w-4 h-4" />
        <span>{contact.email}</span>
      </div>
    )}
  </div>
);

interface EditableContactCardProps {
  contact: Contact;
  onChange: (contact: Contact) => void;
  onSave: () => void;
}

const EditableContactCard = ({ contact, onChange, onSave }: EditableContactCardProps) => {
  const updateField = (field: keyof Contact, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <div className="space-y-3">
      <EditableField 
        icon={<User className="w-4 h-4 text-primary" />}
        value={contact.name}
        onChange={(v) => updateField('name', v)}
        placeholder="Name"
      />
      <EditableField 
        icon={<Building className="w-4 h-4 text-muted-foreground" />}
        value={contact.company || ''}
        onChange={(v) => updateField('company', v)}
        placeholder="Company"
      />
      <EditableField 
        icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
        value={contact.title || ''}
        onChange={(v) => updateField('title', v)}
        placeholder="Title"
      />
      <EditableField 
        icon={<Phone className="w-4 h-4 text-muted-foreground" />}
        value={contact.phone || ''}
        onChange={(v) => updateField('phone', v)}
        placeholder="Phone"
      />
      <EditableField 
        icon={<Mail className="w-4 h-4 text-muted-foreground" />}
        value={contact.email || ''}
        onChange={(v) => updateField('email', v)}
        placeholder="Email"
      />
      <Button onClick={onSave} size="sm" variant="ghost" className="w-full text-primary">
        Done Editing
      </Button>
    </div>
  );
};

interface EditableFieldProps {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const EditableField = ({ icon, value, onChange, placeholder }: EditableFieldProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-surface-2 border-none rounded px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    />
  </div>
);

export default ChatPage;
