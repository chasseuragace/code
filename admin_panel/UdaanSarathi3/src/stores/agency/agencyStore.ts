import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AgencyState } from './types';
import {
  getMyAgencyProfile,
  updateBasicInfo,
  updateContactInfo,
  updateLocation,
  updateSocialMedia,
  updateServices,
  updateSettings,
  uploadLogo,
  uploadBanner,
  removeLogo,
  removeBanner,
} from '@/usecases/agency';

export const useAgencyStore = create<AgencyState>()(
  devtools(
    (set, get) => ({
      // Initial state
      agency: null,
      loading: false,
      error: null,

      // Setters
      setAgency: (agency) => set({ agency }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Load agency
      loadAgency: async () => {
        set({ loading: true, error: null });
        const result = await getMyAgencyProfile();
        
        if (result.success && result.agency) {
          set({ agency: result.agency, loading: false });
        } else {
          set({ error: result.error || 'Failed to load agency', loading: false });
        }
      },

      // Update profile section
      updateProfile: async (section, data) => {
        set({ loading: true, error: null });
        
        let result;
        switch (section) {
          case 'basic':
            result = await updateBasicInfo(data);
            break;
          case 'contact':
            result = await updateContactInfo(data);
            break;
          case 'location':
            result = await updateLocation(data);
            break;
          case 'social-media':
            result = await updateSocialMedia(data);
            break;
          case 'services':
            result = await updateServices(data);
            break;
          case 'settings':
            result = await updateSettings(data);
            break;
        }
        
        if (result.success && result.agency) {
          set({ agency: result.agency, loading: false });
        } else {
          set({ error: result.error || 'Update failed', loading: false });
        }
      },

      // Upload media
      uploadMedia: async (type, file) => {
        set({ loading: true, error: null });
        const { agency } = get();
        
        if (!agency?.license_number) {
          set({ error: 'No agency found', loading: false });
          return;
        }
        
        const result = type === 'logo' 
          ? await uploadLogo(agency.license_number, file)
          : await uploadBanner(agency.license_number, file);
        
        if (result.success) {
          // Reload agency to get updated URL
          await get().loadAgency();
        } else {
          set({ error: result.error || 'Upload failed', loading: false });
        }
      },

      // Remove media
      removeMedia: async (type) => {
        set({ loading: true, error: null });
        const { agency } = get();
        
        if (!agency?.license_number) {
          set({ error: 'No agency found', loading: false });
          return;
        }
        
        const result = type === 'logo'
          ? await removeLogo(agency.license_number)
          : await removeBanner(agency.license_number);
        
        if (result.success) {
          // Reload agency to get updated state
          await get().loadAgency();
        } else {
          set({ error: result.error || 'Remove failed', loading: false });
        }
      },

      // Clear agency
      clearAgency: () => set({ agency: null, loading: false, error: null }),
    }),
    { name: 'AgencyStore' }
  )
);
