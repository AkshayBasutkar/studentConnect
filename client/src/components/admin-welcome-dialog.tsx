import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Users, Calendar, CheckCircle } from "lucide-react";

interface AdminWelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function AdminWelcomeDialog({ isOpen, onClose, userName }: AdminWelcomeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-display">
            Welcome, {userName}!
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            You're logged in as an Administrator
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground text-center mb-4">
            As an admin, you have access to powerful features:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">User Management</h4>
                <p className="text-xs text-muted-foreground">Add and manage users, students, and proctors</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Event Management</h4>
                <p className="text-xs text-muted-foreground">Create, update, and delete campus events</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sm">Participation Reviews</h4>
                <p className="text-xs text-muted-foreground">Review and approve student participation submissions</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
