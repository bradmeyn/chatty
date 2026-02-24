import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
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
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Mail, Lock, MessageSquareText } from "lucide-react";
import { Alert, AlertDescription } from "@components/ui/alert";
import { useState } from "react";

// Form
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { loginSchema, type LoginCredentials } from "@auth/schemas";
import { useAuth } from "@auth/context";
import LoadingSpinner from "@components/loading-spinner";

export const Route = createFileRoute("/(auth)/login/")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/(auth)/login/" });
  const [loginError, setLoginError] = useState("");
  const { login } = useAuth();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginCredentials) {
    try {
      setLoginError("");
      await login(data);

      const redirectTo = search.redirect || "/chats/new";
      navigate({ to: redirectTo, replace: true });
    } catch (error) {
      console.error("Login error", error);
      setLoginError(
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please check your credentials and try again."
      );
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
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl place-items-center px-6 py-10 lg:px-10">
        <Card className="w-full max-w-md border-black/10 bg-white/85 shadow-xl">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to continue your conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                              className="pl-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your password"
                              className="pl-9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0f766e] hover:bg-[#115e59]"
                  disabled={!form.formState.isValid}
                >
                  {form.formState.isSubmitting ? (
                    <LoadingSpinner text="Signing in..." />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#0f766e] hover:underline">
                Create one
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
