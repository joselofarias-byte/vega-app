import {mainStorage} from './StorageService';
import {
  DEFAULT_LANGUAGE_PROFILE,
  LanguageFilterMode,
  LanguageProfile,
  normalizeLanguageTag,
} from '../languagePreferences';

const LANGUAGE_PROFILE_KEY = 'languageProfileV1';

const normalizeList = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map(normalizeLanguageTag)
        .filter(tag => tag !== 'und'),
    ),
  ];
};

const isMode = (value: unknown): value is LanguageFilterMode =>
  value === 'strict' || value === 'balanced' || value === 'flexible';

export const sanitizeLanguageProfile = (value: unknown): LanguageProfile => {
  if (!value || typeof value !== 'object') {
    return {...DEFAULT_LANGUAGE_PROFILE};
  }

  const profile = value as Partial<LanguageProfile>;
  return {
    id:
      typeof profile.id === 'string' && profile.id.trim()
        ? profile.id.trim()
        : 'custom',
    name:
      typeof profile.name === 'string' && profile.name.trim()
        ? profile.name.trim()
        : 'Custom',
    preferredAudio: normalizeList(profile.preferredAudio),
    preferredSubtitles: normalizeList(profile.preferredSubtitles),
    mode: isMode(profile.mode) ? profile.mode : 'balanced',
    allowOriginalAudio: Boolean(profile.allowOriginalAudio),
    allowAudioWithPreferredSubtitles:
      profile.allowAudioWithPreferredSubtitles !== false,
    allowUnknown: Boolean(profile.allowUnknown),
  };
};

export const languagePreferencesStorage = {
  getProfile(): LanguageProfile {
    const stored = mainStorage.getObject<LanguageProfile>(LANGUAGE_PROFILE_KEY);
    return sanitizeLanguageProfile(stored || DEFAULT_LANGUAGE_PROFILE);
  },

  setProfile(profile: LanguageProfile): void {
    mainStorage.setObject(
      LANGUAGE_PROFILE_KEY,
      sanitizeLanguageProfile(profile),
    );
  },

  reset(): void {
    mainStorage.delete(LANGUAGE_PROFILE_KEY);
  },
};
