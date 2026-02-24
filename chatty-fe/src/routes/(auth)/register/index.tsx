import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Mail, MessageSquareText } from "lucide-react";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";

import { registerSchema, type RegisterCredentials } from "@auth/schemas";

import { cn } from "@utils/shadcn";
import LoadingSpinner from "@components/loading-spinner";
import { register } from "@auth/service";

export const Route = createFileRoute("/(auth)/register/")({
  component: RegisterPage,
});

function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterCredentials) {
    try {
      setErrorMessage(null);

      const response = await register(data);
      console.log("Registration response:", response);
      navigate({ to: "/chats/new", replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#1a1a1a]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-20%] h-[32rem] w-[32rem] rounded-full bg-[#0f766e]/15 blur-[120px]" />
        <div className="absolute right-[-10%] top-[10%] h-[26rem] w-[26rem] rounded-full bg-[#f97316]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[20%] h-[30rem] w-[30rem] rounded-full bg-[#facc15]/20 blur-[120px]" />
      </div>

      <header className="relative z-10 border-b border-black/5">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f766e] text-white">
              <MessageSquareText size={18} />
            </div>
            <Link to="/" className="text-lg tracking-tight">
              Chatty
            </Link>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/login" search={{ redirect: undefined }}>
              Log in
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl place-items-center px-6 py-10 lg:px-10">
        <Card className="w-full max-w-xl border-black/10 bg-white/85 shadow-xl">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Create your account to start chatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              placeholder="john@example.com"
                              className={
                                form.formState.errors.email
                                  ? cn(
                                      "pl-9 border-red-500",
                                      "focus-visible:ring-red-500",
                                      "focus-visible:border-red-500",
                                    )
                                  : "pl-9"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a secure password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0f766e] hover:bg-[#115e59]"
                  disabled={!form.formState.isValid}>
                  {form.formState.isSubmitting ? (
                    <LoadingSpinner text="Creating account..." />
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="text-[#0f766e] hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
