import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Bell,
  Calendar,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
  FileCheck,
  Award,
  PlusCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ];

    if (user?.role === "student") {
      return [
        ...baseItems,
        { name: "Events", href: "/events", icon: Calendar },
        { name: "My Submissions", href: "/participations", icon: FileCheck },
      ];
    } else if (user?.role === "proctor") {
      return [
        ...baseItems,
        { name: "Post Event", href: "/events/create", icon: PlusCircle },
        { name: "Review Submissions", href: "/reviews", icon: Award },
        { name: "Students", href: "/students", icon: Users },
      ];
    } else if (user?.role === "admin") {
      return [
        ...baseItems,
        { name: "Manage Users", href: "/admin/users", icon: Users },
      ];
    }
    return baseItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-card border-r border-border">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
            <Award className="w-6 h-6" />
            <span>CampusPulse</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-6 hover:bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3 text-left w-full">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.role === 'student' ? user.student?.profilePhotoUrl || '' : ''} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-primary">
            <Award className="w-5 h-5" />
            <span>CampusPulse</span>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="h-16 flex items-center px-6 border-b border-border">
                <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
                  <Award className="w-6 h-6" />
                  <span>CampusPulse</span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium cursor-pointer
                        ${isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted"
                        }
                      `}>
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
