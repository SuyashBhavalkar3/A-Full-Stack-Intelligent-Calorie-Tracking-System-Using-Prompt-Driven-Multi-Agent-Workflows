import { profileAPI } from '@/lib/api';

export interface ProfileSetupData {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity_level: string;
}

export interface Profile extends ProfileSetupData {
  created_at?: string;
  updated_at?: string;
}

/**
 * Profile Service
 * Handles user profile management
 */
export const profileService = {
  /**
   * Setup user profile
   */
  async setupProfile(data: ProfileSetupData): Promise<Profile> {
    try {
      const response = await profileAPI.setup(data);
      return response.data as Profile;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<Profile | null> {
    try {
      const response = await profileAPI.getMe();
      return response.data as Profile;
    } catch {
      return null;
    }
  },

  /**
   * Check if profile is complete
   */
  isProfileComplete(profile: Profile | null): boolean {
    return !!(
      profile &&
      profile.age &&
      profile.height &&
      profile.weight &&
      profile.gender &&
      profile.activity_level
    );
  },
};
