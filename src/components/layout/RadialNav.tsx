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

      {/* Navigation Container */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-start gap-2">
        {/* Toggle Button */}
        <button
          onClick={toggleNav}
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-r-full bg-primary text-primary-foreground",
            "flex items-center justify-center shadow-lg",
            "hover:bg-primary/90 transition-all duration-300",
            "hover:scale-105 active:scale-95"
          )}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Navigation Items */}
        <nav 
          className={cn(
            "flex flex-col gap-1 transition-all duration-300 ease-out",
            isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
          )}
        >
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-r-full transition-all duration-300",
                  "shadow-md",
                  isActive 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="pr-2">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Divider */}
          <div className="w-full h-px bg-sidebar-accent my-1" />

          {/* Clear Chat */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-r-full bg-sidebar text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-all duration-300 shadow-md">
                <Trash2 className="w-5 h-5 flex-shrink-0" />
                <span className="pr-2">Clear Chat</span>
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
            className="flex items-center gap-3 px-4 py-2.5 rounded-r-full bg-sidebar text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-all duration-300 shadow-md"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="pr-2">Sign Out</span>
          </button>

          {/* Theme Toggle */}
          <div className="px-4 py-2.5 rounded-r-full bg-sidebar shadow-md">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </>
  );
};

export default RadialNav;
