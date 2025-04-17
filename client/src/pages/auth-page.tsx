import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, registerSchema } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked } from "lucide-react";
import { Loader2 } from "lucide-react";

type LoginFormValues = {
  username: string;
  password: string;
};

type RegisterFormValues = z.infer<typeof registerSchema>;



// Simple auth page that doesn't rely on authentication context 
export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  
  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
      }
      
      // Redirect to home page after successful login
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...userData } = data;
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include"
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Registration failed");
      }
      
      // Redirect to home page after successful registration
      setLocation("/");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (res.ok) {
          // User is already logged in, redirect to home
          setLocation("/");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    }
    
    checkUser();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <BookMarked className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">StudyShare</h1>
            </div>
            <p className="text-gray-600">
              Your college resource portal for sharing and accessing academic materials
            </p>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "register")}>
            <TabsList className="grid grid-cols-2 w-full mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    type="button"
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setLocation("/")}
                  >
                    Continue as Guest
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    <span>Don't have an account? </span>
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => setTab("register")}
                    >
                      Sign up now
                    </button>
                  </p>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
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
                          <Input type="email" placeholder="you@university.edu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
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
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Register
                  </Button>
                  <Button
                    type="button"
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setLocation("/")}
                  >
                    Continue as Guest
                  </Button>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      className="text-primary font-medium hover:underline"
                      onClick={() => setTab("login")}
                    >
                      Login here
                    </button>
                  </p>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero/Info Section */}
      <div
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-12 flex-col justify-center"
      >
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-6">Share Knowledge, Ace Your Exams</h2>
          <p className="text-xl mb-8">
            Join a community of students helping each other succeed through shared resources
            and collaborative learning.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Share Your Notes</h3>
                <p className="text-blue-100">
                  Upload your class notes and study guides to help other students
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Download Resources</h3>
                <p className="text-blue-100">
                  Find and download quality study materials from your peers
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-white/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Earn Recognition</h3>
                <p className="text-blue-100">
                  Get rated and recognized for your helpful contributions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
