import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/components/ui/sonner";
import { Heart, ArrowLeft, Mail, Phone, Lock, User, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(1),
  identifier: z.string().min(1),
  password: z.string().min(6),
  registerType: z.enum(["email", "phone"]),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function PatientAuth() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginPatient, registerPatient, forgotPassword } = useAuth();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      identifier: "",
      password: "",
      registerType: "email",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await loginPatient(data.identifier, data.password);
      navigate("/patient");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const registerData = {
        name: data.name,
        password: data.password,
        ...(data.registerType === "email" ? { email: data.identifier } : { phone: data.identifier }),
      };
      await registerPatient(registerData);
      toast.success("Registered successfully");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      toast.success("Password reset email sent");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              MedConnect
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Access your appointments, queue status, and medical records securely
          </p>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-start"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-elevated border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl">Patient Portal</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">Register</TabsTrigger>
                  <TabsTrigger value="forgot" className="text-sm">Reset</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email or Phone
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your email or phone number" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Enter your password" 
                                  type={showPassword ? "text" : "password"}
                                  {...field} 
                                  className="h-11 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="registerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Register with</FormLabel>
                            <FormControl>
                              <div className="flex gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    value="email"
                                    {...field}
                                    checked={field.value === "email"}
                                    onChange={() => field.onChange("email")}
                                    className="text-primary"
                                  />
                                  <span className="text-sm flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    Email
                                  </span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    value="phone"
                                    {...field}
                                    checked={field.value === "phone"}
                                    onChange={() => field.onChange("phone")}
                                    className="text-primary"
                                  />
                                  <span className="text-sm flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    Phone
                                  </span>
                                </label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              {registerForm.watch("registerType") === "email" ? (
                                <Mail className="w-4 h-4" />
                              ) : (
                                <Phone className="w-4 h-4" />
                              )}
                              {registerForm.watch("registerType") === "email" ? "Email" : "Phone Number"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  registerForm.watch("registerType") === "email" 
                                    ? "Enter your email address" 
                                    : "Enter your phone number"
                                }
                                type={registerForm.watch("registerType") === "email" ? "email" : "tel"}
                                {...field}
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Create a strong password" 
                                type="password" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="forgot" className="space-y-4">
                  <Form {...forgotPasswordForm}>
                    <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                      <div className="text-center space-y-2 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <Mail className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold">Reset Your Password</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter your email address and we'll send you a link to reset your password
                        </p>
                      </div>
                      <FormField
                        control={forgotPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your email address" 
                                type="email" 
                                {...field} 
                                className="h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              🔒 Secure
            </Badge>
            <Badge variant="outline" className="text-xs">
              📱 Mobile Friendly
            </Badge>
            <Badge variant="outline" className="text-xs">
              ⚡ Fast
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
