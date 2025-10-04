import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/components/ui/sonner";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  staffId: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function StaffAuth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { loginStaff, registerStaff } = useAuth();
  const [staffId, setStaffId] = useState("");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginForm) => {
    try {
      await loginStaff(data.email, data.password, staffId);
      navigate("/staff");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      await registerStaff(data.email, data.password, data.name, data.staffId);
      toast.success("Registered successfully");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-cyan-600 mb-2"
      >
        Staff Dashboard
      </motion.h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Login to manage patient queues, monitor performance, and update schedules.
      </p>

      <div className="w-full max-w-md">
        <div className="grid grid-cols-2 mb-4 border rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("login")}
            className={`p-2 w-full ${activeTab === "login" ? "bg-cyan-100" : "bg-white"}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`p-2 w-full ${activeTab === "register" ? "bg-cyan-100" : "bg-white"}`}
          >
            Register
          </button>
        </div>

        {activeTab === "login" && (
          <>
            <input
              type="text"
              placeholder="Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            />
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="bg-white shadow-md border rounded-lg p-6 space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" type="email" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder="Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Login</Button>
              </form>
            </Form>
          </>
        )}

        {activeTab === "register" && (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="bg-white shadow-md border rounded-lg p-6 space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" type="email" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Staff ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Register</Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
