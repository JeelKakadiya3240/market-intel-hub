import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifyFromUrl = async () => {
      // Get the URL parameters from the current page
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check both URL params and hash params for tokens
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = urlParams.get('type') || hashParams.get('type');

      if (accessToken && refreshToken) {
        try {
          // Set the session using the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: "Verification Failed",
              description: error.message,
              variant: "destructive",
            });
            setLocation("/login");
            return;
          }

          if (data.session) {
            toast({
              title: "Email verified successfully!",
              description: "Welcome to StartupIntel platform.",
            });
            // Clear URL parameters
            window.history.replaceState({}, document.title, "/dashboard");
            setLocation("/dashboard");
          } else {
            toast({
              title: "Verification incomplete",
              description: "Please try logging in with your credentials.",
            });
            setLocation("/login");
          }
        } catch (error) {
          console.error('Verification error:', error);
          toast({
            title: "Verification Failed",
            description: "Something went wrong during verification.",
            variant: "destructive",
          });
          setLocation("/login");
        }
      } else {
        toast({
          title: "Invalid verification link",
          description: "Please try registering again or contact support.",
          variant: "destructive",
        });
        setLocation("/register");
      }
    };

    verifyFromUrl();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Verifying your email
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please wait while we confirm your account...
        </p>
      </div>
    </div>
  );
}