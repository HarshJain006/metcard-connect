import { useEffect } from 'react';
import { useContactsStore } from '@/stores/contactsStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Building, Mail, Phone, User, Briefcase, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const HistoryPage = () => {
  const { contacts, isLoading, error, fetchContacts } = useContactsStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading contacts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => fetchContacts()}
            className="text-primary hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-xl font-semibold">Contact History</h1>
        <p className="text-sm text-muted-foreground">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <ScrollArea className="flex-1 px-6 py-4">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No contacts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Scan a business card to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact) => (
              <Card 
                key={contact.id} 
                className="bg-card border-border/50 p-4 hover:border-primary/30 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        {contact.title && (
                          <p className="text-xs text-muted-foreground">{contact.title}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {contact.company && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default HistoryPage;
