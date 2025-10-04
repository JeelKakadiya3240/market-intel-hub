import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have hash parameters from the email verification
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken && type === 'signup') {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
            setLocation("/login");
            return;
          }

          if (data.session) {
            toast({
              title: "Email verified successfully!",
              description: "Welcome to the platform.",
            });
            // Clear the hash from URL
            window.history.replaceState(null, "", window.location.pathname);
            setLocation("/dashboard");
          } else {
            setLocation("/login");
          }
        } else {
          // Check for existing session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
            setLocation("/login");
            return;
          }

          if (data.session) {
            setLocation("/dashboard");
          } else {
            setLocation("/login");
          }
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        toast({
          title: "Authentication Error",
          description: "Something went wrong. Please try logging in again.",
          variant: "destructive",
        });
        setLocation("/login");
      }
    };

    handleAuthCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Verifying your email...</p>
      </div>
    </div>
  );
}