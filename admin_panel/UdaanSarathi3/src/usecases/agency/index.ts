/**
 * Agency Use Cases exports
 * 
 * This module exports all agency management use cases.
 */

// Agency Creation
export { createAgency } from './createAgency';
export type { CreateAgencyInput, CreateAgencyResult } from './createAgency';

// Agency Profile
export {
  getMyAgencyProfile,
  getAgencyById,
  getAgencyByLicense,
} from './getAgencyProfile';
export type { AgencyProfile, GetAgencyProfileResult } from './getAgencyProfile';

// Profile Updates
export {
  updateBasicInfo,
  updateContactInfo,
  updateLocation,
  updateSocialMedia,
  updateServices,
  updateSettings,
} from './updateAgencyProfile';
export type { UpdateResult } from './updateAgencyProfile';

// Media Management
export {
  uploadLogo,
  removeLogo,
  uploadBanner,
  removeBanner,
} from './manageAgencyMedia';
export type {
  MediaUploadResult,
  MediaRemovalResult,
} from './manageAgencyMedia';

// Search
export { searchAgencies } from './searchAgencies';
export type {
  SearchParams,
  SearchResult,
  SearchAgenciesResult,
} from './searchAgencies';
