import { useAgencyStore } from './agencyStore';

// Basic selectors
export const useAgency = () => useAgencyStore((state) => state.agency);
export const useAgencyLoading = () => useAgencyStore((state) => state.loading);
export const useAgencyError = () => useAgencyStore((state) => state.error);

// Derived selectors
export const useHasAgency = () => useAgencyStore((state) => !!state.agency);
export const useAgencyName = () => useAgencyStore((state) => state.agency?.name);
export const useAgencyLicense = () => useAgencyStore((state) => state.agency?.license_number);
export const useAgencyLogo = () => useAgencyStore((state) => state.agency?.logo_url);
export const useAgencyBanner = () => useAgencyStore((state) => state.agency?.banner_url);

// Profile completion
export const useProfileCompletion = () => {
  return useAgencyStore((state) => {
    if (!state.agency) return { percentage: 0, completed: 0, total: 0, missing: [] };

    const sections = {
      basic: !!(state.agency.name && state.agency.description),
      contact: !!(state.agency.phones?.length && state.agency.emails?.length),
      location: !!state.agency.address,
      branding: !!state.agency.logo_url,
      services: !!state.agency.services?.length,
      social: !!state.agency.social_media?.facebook,
    };

    const completed = Object.values(sections).filter(Boolean).length;
    const total = Object.keys(sections).length;
    const missing = Object.entries(sections)
      .filter(([_, complete]) => !complete)
      .map(([section]) => section);

    return {
      percentage: Math.round((completed / total) * 100),
      completed,
      total,
      missing,
    };
  });
};
