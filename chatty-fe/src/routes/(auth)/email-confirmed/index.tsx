import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { CheckCircle, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";

import { emailConfirmedSearchSchema } from "@/lib/features/auth/schemas";

export const Route = createFileRoute("/(auth)/email-confirmed/")({
  validateSearch: emailConfirmedSearchSchema,
  component: EmailConfirmedPage,
});

export default function EmailConfirmedPage() {
  const search = useSearch({ from: "/(auth)/email-confirmed/" });
  const navigate = useNavigate();

  const status = search?.status as string;

  const getStatusContent = () => {
    if (status === "already-confirmed") {
      return {
        icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
        title: "Welcome Back!",
        message: "Your email was already confirmed.",
        variant: "default" as const,
      };
    }

    if (status === "success") {
      return {
        icon: <CheckCircle className="h-12 w-12 text-green-600" />,
        title: "Email Confirmed! 🎉",
        message: "Welcome to Chatty! Your account is now active.",
        variant: "default" as const,
      };
    }

    return {
      icon: <CheckCircle className="h-12 w-12 text-green-600" />,
      title: "Email Confirmed!",
      message: "Your account has been successfully activated.",
      variant: "default" as const,
    };
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <Card>
          <CardHeader className="text-center">
            {statusContent.icon}
            <CardTitle className="text-2xl font-bold text-gray-900">
              {statusContent.title}
            </CardTitle>
            <CardDescription className="text-base">
              {statusContent.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your email has been confirmed successfully!
                </AlertDescription>
              </Alert>

              <Button
                onClick={() =>
                  navigate({
                    to: "/login",
                    search: { redirect: undefined },
                  })
                }
                className="w-full">
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Welcome to your Chatty journey! We're excited to have you on board.
          </p>
        </div>
      </div>
    </div>
  );
}
