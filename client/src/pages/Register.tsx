import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Link } from "wouter";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, UserCheck } from "lucide-react";
import prognosticzLogo from "@assets/Transparent - PNG_1749995576885.png";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    role: "investor"
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            username: data.username,
            role: data.role
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      return authData;
    },
    onSuccess: (data) => {
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account, then try logging in.",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Registration successful!",
          description: "Welcome to the platform.",
        });
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-purple-50/20 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={prognosticzLogo} 
              alt="Prognosticz Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Join Prognosticz
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Create your account to get started
          </p>
        </div>

        {/* Register Form */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-11 h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    title="Please enter a valid email address"
                    className="pl-11 h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="pl-11 pr-11 h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="pl-11 pr-11 h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Role Field */}
              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-700">
                  Your Role
                </Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="pl-11 h-12 border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="founder">Founder</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error Alert */}
              {registerMutation.error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {registerMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}