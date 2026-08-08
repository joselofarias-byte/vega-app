import {mainStorage} from './StorageService';
import {
  DEFAULT_LANGUAGE_PROFILE,
  LanguageFilterMode,
  LanguageProfile,
  normalizeLanguageTag,
} from '../languagePreferences';

const LANGUAGE_PROFILE_KEY = 'languageProfileV2';
const LEGACY_LANGUAGE_PROFILE_KEY = 'languageProfileV1';

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

const normalizeListOrDefault = (
  values: unknown,
  defaultValues: string[],
): string[] =>
  Array.isArray(values) ? normalizeList(values) : [...defaultValues];

const isMode = (value: unknown): value is LanguageFilterMode =>
  value === 'strict' || value === 'balanced' || value === 'flexible';

const booleanOrDefault = (value: unknown, defaultValue: boolean): boolean =>
  typeof value === 'boolean' ? value : defaultValue;

export const sanitizeLanguageProfile = (value: unknown): LanguageProfile => {
  if (!value || typeof value !== 'object') {
    return {...DEFAULT_LANGUAGE_PROFILE};
  }

  const profile = value as Partial<LanguageProfile> & {
    allowAudioWithPreferredSubtitles?: boolean;
  };
  const legacyFallbackEnabled =
    profile.allowAudioWithPreferredSubtitles !== false;

  return {
    id:
      typeof profile.id === 'string' && profile.id.trim()
        ? profile.id.trim()
        : 'custom',
    name:
      typeof profile.name === 'string' && profile.name.trim()
        ? profile.name.trim()
        : 'Custom',
    preferredAudio: normalizeListOrDefault(
      profile.preferredAudio,
      DEFAULT_LANGUAGE_PROFILE.preferredAudio,
    ),
    preferredSubtitles: normalizeListOrDefault(
      profile.preferredSubtitles,
      DEFAULT_LANGUAGE_PROFILE.preferredSubtitles,
    ),
    subtitleFallbackAudio: Array.isArray(profile.subtitleFallbackAudio)
      ? normalizeList(profile.subtitleFallbackAudio)
      : legacyFallbackEnabled
        ? [...DEFAULT_LANGUAGE_PROFILE.subtitleFallbackAudio]
        : [],
    mode: isMode(profile.mode)
      ? profile.mode
      : DEFAULT_LANGUAGE_PROFILE.mode,
    allowOriginalAudio: booleanOrDefault(
      profile.allowOriginalAudio,
      DEFAULT_LANGUAGE_PROFILE.allowOriginalAudio,
    ),
    allowUnknown: booleanOrDefault(
      profile.allowUnknown,
      DEFAULT_LANGUAGE_PROFILE.allowUnknown,
    ),
  };
};

export const languagePreferencesStorage = {
  getProfile(): LanguageProfile {
    const stored =
      mainStorage.getObject<LanguageProfile>(LANGUAGE_PROFILE_KEY) ||
      mainStorage.getObject<LanguageProfile>(LEGACY_LANGUAGE_PROFILE_KEY);
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
    mainStorage.delete(LEGACY_LANGUAGE_PROFILE_KEY);
  },
};
