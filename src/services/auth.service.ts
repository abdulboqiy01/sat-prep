import { supabase } from '../lib/supabase';
import {
  signUpSchema,
  loginSchema,
  resetPasswordRequestSchema,
  updatePasswordSchema,
  type SignUpInput,
  type LoginInput,
  type ResetPasswordRequestInput,
  type UpdatePasswordInput,
} from '../schemas/auth.schema';
import { AuthenticationError, ValidationError, sanitizeError } from '../lib/errors';
import type { Database } from '../../types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export class AuthService {
  /**
   * Registers a new student account using Supabase Auth.
   * Profile and preferences are initialized via database triggers (handle_new_user).
   */
  static async signUp(input: SignUpInput) {
    const validated = signUpSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Validation failed during registration', validated.error.flatten());
    }

    const { data, error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.fullName,
        },
      },
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Authenticates user with email and password.
   */
  static async login(input: LoginInput) {
    const validated = loginSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid email or password format', validated.error.flatten());
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (error) {
      throw new AuthenticationError('Invalid email or password credentials');
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Terminates the current authenticated session.
   */
  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new ValidationError(error.message);
    }
    return { success: true };
  }

  /**
   * Retrieves verified active session from Supabase client.
   */
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }
    return session;
  }

  /**
   * Retrieves currently authenticated user derived from verified JWT.
   */
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new AuthenticationError('No active authenticated session');
    }
    return user;
  }

  /**
   * Dispatches a secure password reset link to student email.
   */
  static async requestPasswordReset(input: ResetPasswordRequestInput, redirectTo?: string) {
    const validated = resetPasswordRequestSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Invalid email format', validated.error.flatten());
    }

    const { error } = await supabase.auth.resetPasswordForEmail(validated.data.email, {
      redirectTo,
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true };
  }

  /**
   * Updates user password for the authenticated session.
   */
  static async updatePassword(input: UpdatePasswordInput) {
    const validated = updatePasswordSchema.safeParse(input);
    if (!validated.success) {
      throw new ValidationError('Password does not meet security requirements', validated.error.flatten());
    }

    const { error } = await supabase.auth.updateUser({
      password: validated.data.password,
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    return { success: true };
  }

  /**
   * Retrieves profile for the authenticated student or specified user.
   */
  static async getProfile(userId?: string): Promise<Profile | null> {
    const targetId = userId || (await this.getCurrentUser()).id;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .maybeSingle();

    if (error) {
      throw new ValidationError(error.message);
    }

    return data;
  }

  /**
   * Updates student profile details.
   * Role modification is strictly protected at the database trigger layer.
   */
  static async updateProfile(
    updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at' | 'updated_at'>>
  ): Promise<Profile> {
    const user = await this.getCurrentUser();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw sanitizeError(error);
    }

    return data;
  }
}
