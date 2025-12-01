import type { Response } from '@/api/types/helpers';

// Agency profile type from API
export type AgencyProfile = Response<'/agencies/owner/agency', 'get'>;

// Store state interface
export interface AgencyState {
  // Data
  agency: AgencyProfile | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Actions
  setAgency: (agency: AgencyProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadAgency: () => Promise<void>;
  updateProfile: (section: ProfileSection, data: any) => Promise<void>;
  uploadMedia: (type: 'logo' | 'banner', file: File) => Promise<void>;
  removeMedia: (type: 'logo' | 'banner') => Promise<void>;
  clearAgency: () => void;
}

export type ProfileSection = 
  | 'basic' 
  | 'contact' 
  | 'location' 
  | 'social-media' 
  | 'services' 
  | 'settings';
