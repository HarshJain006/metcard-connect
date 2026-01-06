import { useState, useRef, useEffect } from 'react';
import { useChatStore, type ChatMessage } from '@/stores/chatStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Send, X, Loader2, Building, Mail, Phone, User, Briefcase, Plus, Check, Edit3, Image, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contact } from '@/stores/chatStore';

const ChatPage = () => {
  const { 
    messages, 
    isProcessing, 
    extractContact, 
    extractContactFromText, 
    appendContact, 
    updateMessageContact, 
    deleteMessage,
    setPendingRetake,
    pendingRetakeMessageId
  } = useChatStore();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const retakeCameraRef = useRef<HTMLInputElement>(null);
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

  const handleRetakeImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // This is a retake - will replace the pending message
      await extractContact(file, true);
      if (retakeCameraRef.current) retakeCameraRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (selectedImage) {
      await extractContact(selectedImage, false);
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

  const handleRetake = (messageId: string) => {
    setPendingRetake(messageId);
    retakeCameraRef.current?.click();
  };

  const canSend = selectedImage || textInput.trim();

  return (
    <div className="flex flex-col h-full bg-gradient-hero">
      {/* Hidden retake camera input */}
      <input
        ref={retakeCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleRetakeImageSelect}
        className="hidden"
      />

      {/* Chat Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              onAddToSheet={appendContact}
              onUpdateContact={updateMessageContact}
              onRetake={handleRetake}
              onDelete={deleteMessage}
              isProcessing={isProcessing}
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
  onAddToSheet: (contact: Contact, messageId: string) => Promise<boolean>;
  onUpdateContact: (messageId: string, contact: Contact, needsConfirmation?: boolean) => void;
  onRetake: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  isProcessing: boolean;
}

const MessageBubble = ({ message, onAddToSheet, onUpdateContact, onRetake, onDelete, isProcessing }: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(message.contact || null);
  const [isAdding, setIsAdding] = useState(false);

  // Sync editedContact when message.contact changes
  useEffect(() => {
    if (message.contact) {
      setEditedContact(message.contact);
    }
  }, [message.contact]);

  const handleSaveToSheet = async () => {
    if (!editedContact) return;
    setIsAdding(true);
    await onAddToSheet(editedContact, message.id);
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (editedContact) {
      // Mark as needs confirmation after edit
      onUpdateContact(message.id, editedContact, true);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContact(message.contact || null);
    setIsEditing(false);
  };

  const handleRetake = () => {
    onRetake(message.id);
  };

  const handleDelete = () => {
    onDelete(message.id);
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
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <ContactCard contact={editedContact || message.contact} />
              )}
            </div>

            {/* Action Buttons - Always visible */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      disabled={isProcessing}
                      className="text-muted-foreground hover:text-foreground h-8 w-8"
                      title="Edit contact"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRetake}
                      disabled={isProcessing}
                      className="text-muted-foreground hover:text-primary h-8 w-8"
                      title="Retake photo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isProcessing}
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Status indicator or Save button */}
              {message.isSaved ? (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </div>
              ) : message.needsConfirmation ? (
                <Button
                  onClick={handleSaveToSheet}
                  disabled={isAdding || isProcessing}
                  size="sm"
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Save to Sheet
                </Button>
              ) : null}
            </div>
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
  onCancel: () => void;
}

const EditableContactCard = ({ contact, onChange, onSave, onCancel }: EditableContactCardProps) => {
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
      <div className="flex gap-2 pt-2">
        <Button onClick={onSave} size="sm" className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground">
          <Check className="w-4 h-4 mr-1" />
          Done
        </Button>
        <Button onClick={onCancel} size="sm" variant="ghost" className="flex-1 text-muted-foreground">
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
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
