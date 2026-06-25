export const userRoles = ["admin", "manager", "viewer"] as const;

export type UserRole = (typeof userRoles)[number];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AdminUserRecord extends AuthUser {
  password_hash: string;
  created_at?: string;
  updated_at?: string;
}
