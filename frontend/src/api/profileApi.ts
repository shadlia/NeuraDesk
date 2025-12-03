import { supabase } from "@/integrations/supabase/client";
import { UserProfile, ProfileUpdateData } from "@/types/profile";

/**
 * Get the current user's profile
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return {
    ...data,
    email: user.email || '',
  };
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  updates: ProfileUpdateData
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Upload avatar image to Supabase Storage
 */
export const uploadAvatar = async (file: File): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');

  // Validate file
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 2MB');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be a JPEG, PNG, or WebP image');
  }

  // Create unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/avatar.${fileExt}`;

  // Delete old avatar if exists
  const { data: existingFiles } = await supabase.storage
    .from('avatars')
    .list(user.id);

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from('avatars')
      .remove([`${user.id}/${existingFiles[0].name}`]);
  }

  // Upload new avatar
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Update user profile with new avatar URL
  await updateUserProfile({ avatar_url: publicUrl });

  return publicUrl;
};

/**
 * Delete user's avatar
 */
export const deleteAvatar = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');

  // List all files in user's folder
  const { data: files } = await supabase.storage
    .from('avatars')
    .list(user.id);

  if (files && files.length > 0) {
    // Delete all files
    const filePaths = files.map(file => `${user.id}/${file.name}`);
    const { error } = await supabase.storage
      .from('avatars')
      .remove(filePaths);

    if (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  }

  // Update profile to remove avatar URL
  await updateUserProfile({ avatar_url: null });
};

/**
 * Update user email (requires confirmation)
 */
export const updateEmail = async (newEmail: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${window.location.origin}/dashboard` }
  );

  if (error) {
    console.error('Error updating email:', error);
    throw error;
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};
