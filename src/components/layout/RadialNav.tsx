import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { 
  MessageSquare, 
  FileSpreadsheet, 
  Clock, 
  Crown, 
  Menu,
  X,
  LogOut,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
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

const RadialNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuthStore();
  const { clearChat } = useChatStore();

  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/sheet', icon: FileSpreadsheet, label: 'Contacts' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/premium', icon: Crown, label: 'Premium' },
  ];

  const handleClearChat = () => {
    clearChat();
    setIsOpen(false);
  };

  const toggleNav = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Radial Navigation Container */}
      <div 
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%-1.5rem)] md:-translate-x-[calc(100%-3rem)]"
        )}
      >
        {/* Semi-circle background */}
        <div 
          className={cn(
            "relative w-72 h-[28rem] bg-sidebar rounded-r-full shadow-2xl",
            "border-r border-t border-b border-sidebar-border",
            "flex flex-col items-center justify-center"
          )}
        >
          {/* Toggle Button - positioned on the edge */}
          <button
            onClick={toggleNav}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
              "w-12 h-12 rounded-full bg-primary text-primary-foreground",
              "flex items-center justify-center shadow-lg",
              "hover:bg-primary-dark transition-all duration-300",
              "hover:scale-110 active:scale-95"
            )}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Navigation Items - arranged in an arc */}
          <nav className="flex flex-col items-start gap-2 pl-8 w-full">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-full w-48 transition-all duration-300",
                    "hover:bg-sidebar-accent hover:translate-x-2",
                    isActive 
                      ? "bg-primary text-primary-foreground font-medium shadow-lg" 
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}

            {/* Divider */}
            <div className="w-40 h-px bg-sidebar-accent my-2 ml-4" />

            {/* Clear Chat */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-3 rounded-full w-48 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive hover:translate-x-2 transition-all duration-300">
                  <Trash2 className="w-5 h-5 flex-shrink-0" />
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

            {/* Sign Out */}
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-full w-48 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive hover:translate-x-2 transition-all duration-300"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </nav>

          {/* Theme Toggle - bottom */}
          <div className="absolute bottom-8 left-8">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
};

export default RadialNav;
