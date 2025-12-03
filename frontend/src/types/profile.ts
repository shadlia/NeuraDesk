export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailChangeData {
  newEmail: string;
  password: string;
}
