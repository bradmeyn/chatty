export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthSessionResponse {
  user: AuthUser;
  session: AuthSession;
}
