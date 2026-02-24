import * as React from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { emailConfirmationSearchSchema } from "@/lib/features/auth/schemas";

export const Route = createFileRoute("/(auth)/email-confirmation/")({
  component: EmailConfirmationPage,
  validateSearch: emailConfirmationSearchSchema,
});

export default function EmailConfirmationPage() {
  const search = useSearch({ from: "/(auth)/email-confirmation/" });
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  // Get status from URL params
  const status = search?.status as string;
  const error = search?.error as string;

  const handleResendEmail = async () => {
    if (!email) {
      setResendError("Please enter your email address");
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("Confirmation email sent! Please check your inbox.");
      } else {
        setResendError(data.error || "Failed to resend email");
      }
    } catch (error) {
      setResendError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getStatusDisplay = () => {
    if (error) {
      switch (error) {
        case "invalid-link":
          return {
            icon: <AlertTriangle className=" text-destructive" />,
            title: "Invalid confirmation link",
            message:
              "The confirmation link appears to be invalid or malformed.",
            variant: "destructive" as const,
          };
        case "user-not-found":
          return {
            icon: <AlertTriangle className=" text-destructive" />,
            title: "User not found",
            message:
              "We couldn't find an account associated with this confirmation link.",
            variant: "destructive" as const,
          };
        case "confirmation-failed":
          return {
            icon: <AlertTriangle className=" text-destructive" />,
            title: "Confirmation failed",
            message: "Unable to confirm your email. The link may have expired.",
            variant: "destructive" as const,
          };
        default:
          return {
            icon: <AlertTriangle className=" text-destructive" />,
            title: "Something went wrong",
            message: "An unexpected error occurred during email confirmation.",
            variant: "destructive" as const,
          };
      }
    }

    if (status === "already-confirmed") {
      return {
        icon: <CheckCircle className=" text-green-600" />,
        title: "Email already confirmed",
        message:
          "Your email address has already been confirmed. You can log in to your account.",
        variant: "default" as const,
      };
    }

    return null;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-6 text-3xl font-bold ">Check Your Email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a confirmation link to your email address
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Email Confirmation</CardTitle>
            <CardDescription className="text-center">
              Please click the confirmation link in your email to activate your
              account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusDisplay && (
              <Alert variant={statusDisplay.variant}>
                {statusDisplay.icon}
                <div>
                  <AlertTitle>{statusDisplay.title}</AlertTitle>
                  <AlertDescription>{statusDisplay.message}</AlertDescription>
                </div>
              </Alert>
            )}

            {!statusDisplay ? (
              <Alert>
                <CheckCircle />
                <AlertDescription>
                  <strong>Almost there!</strong> Check your email and click the
                  confirmation link to complete your registration.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Didn't receive the email?</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>

              {resendMessage && (
                <Alert>
                  <CheckCircle />
                  <AlertDescription>{resendMessage}</AlertDescription>
                </Alert>
              )}

              {resendError && (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertDescription>{resendError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Already confirmed?
              </p>

              <a
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in to your account
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Check your spam folder if you don't see the email within a few
            minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
