import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Loader2, Award, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@shared/routes";
import { AdminWelcomeDialog } from "@/components/admin-welcome-dialog";

const formSchema = api.auth.login.input;

export default function LoginPage() {
  const { login, isLoggingIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setAdminName(user.firstName);
        setShowAdminDialog(true);
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  const handleAdminDialogClose = () => {
    setShowAdminDialog(false);
    setLocation("/");
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  if (user && showAdminDialog) {
    return (
      <AdminWelcomeDialog 
        isOpen={showAdminDialog} 
        onClose={handleAdminDialogClose}
        userName={adminName}
      />
    );
  }

  if (user && !showAdminDialog) {
    return null;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden md:flex flex-col justify-between bg-primary p-10 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-indigo-900/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:30px_30px]" />
        
        {/* Unsplash image of a university campus */}
        {/* university campus students studying */}
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=900&fit=crop&q=80" 
          alt="Campus Life" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-display font-bold">
            <Award className="w-8 h-8" />
            CampusPulse
          </div>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
            Empowering Student Growth & Participation
          </h1>
          <p className="text-lg text-primary-foreground/90 font-light">
            Track your achievements, join campus events, and build your professional portfolio with verified participation records.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">Student Focused</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Verified Proofs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm opacity-60">
          © 2024 CampusPulse System. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-none shadow-none md:shadow-lg md:border md:border-border/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold font-display">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username / Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
            <p>
              Don't have an account? Contact your department proctor.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
