import { useState } from "react";
import { Brain, Mail, Lock, User, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  
  // OTP state
  const [otp, setOtp] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the confirmation code.",
      });
      
      setShowOtpInput(true);
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Verifying OTP for:", signupEmail, "Code:", otp);
      
      const { error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otp,
        type: 'signup'
      });

      if (error) throw error;

      toast({
        title: "Account verified!",
        description: "You have successfully created your account.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signupEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend the code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
      });

      if (error) throw error;

      toast({
        title: "Code resent",
        description: "Please check your email for a new verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error resending code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Floating Shapes & Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Vibrant Blobs */}
        <motion.div
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
            scale: [1, 1.4, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            y: [0, 100, 0],
            x: [0, -60, 0],
            scale: [1, 1.5, 1],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-blue-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            y: [0, -50, 0],
            x: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]"
        />

        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.3,
            }}
            animate={{
              y: [null, Math.random() * -100],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            className="absolute w-2 h-2 bg-primary/40 rounded-full blur-[1px]"
          />
        ))}
      </div>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b relative z-10 backdrop-blur-sm bg-background/50"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 hover:bg-accent/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 shadow-lg ring-1 ring-accent/20"
            >
              <Brain className="h-10 w-10 text-accent" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-heading font-bold tracking-tight">Welcome to NeuraDesk</h1>
              <p className="text-muted-foreground mt-2">Your AI Knowledge Assistant</p>
            </motion.div>
          </div>

          {/* Auth Forms */}
          <Card className="border shadow-xl bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>{showOtpInput ? "Verify Account" : "Get Started"}</CardTitle>
              <CardDescription>
                {showOtpInput 
                  ? "Enter the code sent to your email"
                  : "Sign in to your account or create a new one"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {showOtpInput ? (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="verify-email">Email</Label>
                        <Input
                          id="verify-email"
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-2 flex flex-col items-center">
                        <Label htmlFor="otp">Verification Code</Label>
                        <InputOTP
                          maxLength={8}
                          value={otp}
                          onChange={(value) => setOtp(value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                            <InputOTPSlot index={6} />
                            <InputOTPSlot index={7} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 transition-all hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify & Login"}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={handleResendCode}
                          disabled={isLoading}
                        >
                          Resend Code
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setShowOtpInput(false)}
                          disabled={isLoading}
                        >
                          Back to Signup
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="auth-tabs"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      </TabsList>

                      {/* Login Form */}
                      <TabsContent value="login" className="mt-0">
                        <motion.form 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          onSubmit={handleLogin} 
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="pl-10 bg-background/50 transition-all focus:bg-background"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                              <Input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="pl-10 bg-background/50 transition-all focus:bg-background"
                                required
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90 transition-all hover:scale-[1.02] shadow-lg shadow-accent/20"
                            disabled={isLoading}
                          >
                            {isLoading ? "Signing in..." : "Sign In"}
                          </Button>
                        </motion.form>
                      </TabsContent>

                      {/* Signup Form */}
                      <TabsContent value="signup" className="mt-0">
                        <motion.form 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          onSubmit={handleSignup} 
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="signup-firstName">First Name</Label>
                              <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <Input
                                  id="signup-firstName"
                                  type="text"
                                  placeholder="John"
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  className="pl-10 bg-background/50 transition-all focus:bg-background"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="signup-lastName">Last Name</Label>
                              <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <Input
                                  id="signup-lastName"
                                  type="text"
                                  placeholder="Doe"
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  className="pl-10 bg-background/50 transition-all focus:bg-background"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative group">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                className="pl-10 bg-background/50 transition-all focus:bg-background"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                              <Input
                                id="signup-password"
                                type="password"
                                placeholder="••••••••"
                                value={signupPassword}
                                onChange={(e) => setSignupPassword(e.target.value)}
                                className="pl-10 bg-background/50 transition-all focus:bg-background"
                                required
                                minLength={6}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                              <Input
                                id="signup-confirm-password"
                                type="password"
                                placeholder="••••••••"
                                value={signupConfirmPassword}
                                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                className="pl-10 bg-background/50 transition-all focus:bg-background"
                                required
                                minLength={6}
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90 transition-all hover:scale-[1.02] shadow-lg shadow-accent/20"
                            disabled={isLoading}
                          >
                            {isLoading ? "Creating account..." : "Create Account"}
                          </Button>
                        </motion.form>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
