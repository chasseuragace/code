/**
 * Agency Store Usage Examples
 * 
 * This file demonstrates how to use the Agency Store in components
 */

import { useAgencyStore, useAgency, useProfileCompletion } from '@/stores/agency';

// Example 1: Load agency on component mount
export function useLoadAgencyOnMount() {
  const { loadAgency } = useAgencyStore();
  
  // In useEffect:
  // useEffect(() => {
  //   loadAgency();
  // }, []);
}

// Example 2: Display agency data
export function useAgencyDisplay() {
  const agency = useAgency();
  const loading = useAgencyStore((state) => state.loading);
  const error = useAgencyStore((state) => state.error);
  
  return { agency, loading, error };
}

// Example 3: Update profile section
export async function updateBasicProfile(name: string, description: string) {
  const { updateProfile } = useAgencyStore.getState();
  
  await updateProfile('basic', {
    name,
    description,
  });
}

// Example 4: Upload logo
export async function handleLogoUpload(file: File) {
  const { uploadMedia } = useAgencyStore.getState();
  await uploadMedia('logo', file);
}

// Example 5: Check profile completion
export function useProfileStatus() {
  const completion = useProfileCompletion();
  
  // Returns:
  // {
  //   percentage: 67,
  //   completed: 4,
  //   total: 6,
  //   missing: ['branding', 'social']
  // }
  
  return completion;
}

// Example 6: Clear agency on logout
export function handleLogout() {
  const { clearAgency } = useAgencyStore.getState();
  clearAgency();
}
