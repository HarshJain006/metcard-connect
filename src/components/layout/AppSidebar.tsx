import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useThemeStore } from '@/stores/themeStore';
import { APP_INFO } from '@/config';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  MessageSquare, 
  FileSpreadsheet, 
  Clock, 
  Crown, 
  Trash2, 
  LogOut, 
  X,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AppSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const AppSidebar = ({ isMobile = false, isOpen = true, onClose }: AppSidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { clearChat } = useChatStore();
  const { theme, toggleTheme } = useThemeStore();

  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/sheet', icon: FileSpreadsheet, label: 'My Contacts Sheet' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/premium', icon: Crown, label: 'Go Premium' },
  ];

  const handleClearChat = () => {
    clearChat();
    onClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-sidebar text-sidebar-foreground" style={{ boxShadow: 'var(--shadow-sidebar)' }}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">{APP_INFO.name}</h1>
            <p className="text-xs text-muted-foreground">v{APP_INFO.version}</p>
          </div>
          {isMobile && (
            <button onClick={onClose} className="p-2 hover:bg-sidebar-accent rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive 
                    ? 'bg-sidebar-accent text-primary font-medium' 
                    : 'text-sidebar-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Clear Chat */}
        <div className="px-3 mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors">
                <Trash2 className="w-5 h-5" />
                <span>Clear Chat</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all messages from the current chat. Your saved contacts will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-surface-2 border-border hover:bg-surface-3">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearChat}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        {/* Theme Toggle */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-sidebar-accent/50">
            <div className="flex items-center gap-3 text-muted-foreground">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="text-sm">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </div>
            <Switch
              checked={theme === 'light'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-sidebar-accent"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Powered by Groq + Google Sheets
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
        {/* Drawer */}
        <div 
          className={cn(
            'fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 md:hidden',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <div className="hidden md:flex w-72 border-r border-border">
      {sidebarContent}
    </div>
  );
};

export default AppSidebar;
