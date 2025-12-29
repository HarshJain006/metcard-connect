import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/card';
import { ExternalLink, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SheetPage = () => {
  const { user } = useAuthStore();

  if (!user?.sheetId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground">No sheet connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a contact to create your sheet
            </p>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = `https://docs.google.com/spreadsheets/d/${user.sheetId}/preview`;
  const sheetUrl = user.sheetUrl || `https://docs.google.com/spreadsheets/d/${user.sheetId}/edit`;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Contacts Sheet</h1>
          <p className="text-sm text-muted-foreground">
            All your scanned contacts in one place
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            Open in Google Sheets
          </a>
        </Button>
      </div>

      <div className="flex-1 p-6">
        <Card className="h-full bg-card border-border/50 overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full min-h-[500px]"
            title="Google Sheet Preview"
          />
        </Card>
      </div>
    </div>
  );
};

export default SheetPage;
