import { type AuthSessionResponse, type AuthUser } from "@chatty/shared-types";
import { type LoginCredentials, type RegisterCredentials } from "./schemas";
import { api, type ApiError } from "@services/api";
import axios from "axios";

export type User = AuthUser;

interface RegistrationResponse {
  message: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as ApiError;
    return (
      errorData?.error ||
      errorData?.message ||
      errorData?.detail ||
      errorData?.errors?.join(", ") ||
      fallback
    );
  }
  return fallback;
}

export async function register(
  data: RegisterCredentials,
): Promise<RegistrationResponse> {
  try {
    await api.post("/auth/sign-up/email", {
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`.trim(),
      firstName: data.firstName,
      lastName: data.lastName,
    });
    return { message: "Registration successful" };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
}

export async function login(data: LoginCredentials): Promise<User> {
  try {
    await api.post("/auth/sign-in/email", {
      email: data.email,
      password: data.password,
    });

    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Login succeeded but no user session was returned");
    }

    return user;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
}

export async function logout() {
  try {
    await api.post("/auth/sign-out", {});
  } catch (error) {
    throw new Error(getErrorMessage(error, "Logout failed"));
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<AuthSessionResponse | null>(
      "/auth/get-session",
    );
    return response.data?.user ?? null;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 404)
    ) {
      return null;
    }
    throw new Error(getErrorMessage(error, "Failed to fetch session"));
  }
}
