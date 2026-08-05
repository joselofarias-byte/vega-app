export type LanguageFilterMode = 'strict' | 'balanced' | 'flexible';

export interface LanguageProfile {
  id: string;
  name: string;
  preferredAudio: string[];
  preferredSubtitles: string[];
  mode: LanguageFilterMode;
  allowOriginalAudio: boolean;
  allowAudioWithPreferredSubtitles: boolean;
  allowUnknown: boolean;
}

export interface LanguageCandidate {
  server?: string;
  title?: string;
  description?: string;
  audioLanguages?: string[];
  subtitleLanguages?: string[];
  originalLanguage?: string;
  releaseType?: 'dubbed' | 'subbed' | 'dual' | 'original' | 'unknown';
  subtitles?: Array<{
    language?: string;
    title?: string;
    uri?: string;
    type?: string;
  }>;
}

export const COMMON_LANGUAGE_OPTIONS = [
  {tag: 'es-419', label: 'Español latino'},
  {tag: 'es-ES', label: 'Español de España'},
  {tag: 'en', label: 'English'},
  {tag: 'pt-BR', label: 'Português do Brasil'},
  {tag: 'pt-PT', label: 'Português de Portugal'},
  {tag: 'fr', label: 'Français'},
  {tag: 'de', label: 'Deutsch'},
  {tag: 'it', label: 'Italiano'},
  {tag: 'ja', label: '日本語'},
  {tag: 'ko', label: '한국어'},
  {tag: 'zh', label: '中文'},
  {tag: 'hi', label: 'हिन्दी'},
  {tag: 'ar', label: 'العربية'},
  {tag: 'ru', label: 'Русский'},
  {tag: 'tr', label: 'Türkçe'},
  {tag: 'pl', label: 'Polski'},
] as const;

export const LANGUAGE_PRESETS: LanguageProfile[] = [
  {
    id: 'spanish-latin',
    name: 'Español latino',
    preferredAudio: ['es-419', 'es', 'es-ES'],
    preferredSubtitles: ['es-419', 'es', 'es-ES'],
    mode: 'balanced',
    allowOriginalAudio: false,
    allowAudioWithPreferredSubtitles: true,
    allowUnknown: true,
  },
  {
    id: 'spanish-spain',
    name: 'Español de España',
    preferredAudio: ['es-ES', 'es', 'es-419'],
    preferredSubtitles: ['es-ES', 'es', 'es-419'],
    mode: 'balanced',
    allowOriginalAudio: false,
    allowAudioWithPreferredSubtitles: true,
    allowUnknown: true,
  },
  {
    id: 'english',
    name: 'English',
    preferredAudio: ['en'],
    preferredSubtitles: ['en'],
    mode: 'balanced',
    allowOriginalAudio: true,
    allowAudioWithPreferredSubtitles: true,
    allowUnknown: true,
  },
  {
    id: 'portuguese-brazil',
    name: 'Português do Brasil',
    preferredAudio: ['pt-BR', 'pt'],
    preferredSubtitles: ['pt-BR', 'pt'],
    mode: 'balanced',
    allowOriginalAudio: false,
    allowAudioWithPreferredSubtitles: true,
    allowUnknown: true,
  },
  {
    id: 'original-subtitles',
    name: 'Audio original',
    preferredAudio: [],
    preferredSubtitles: ['es-419', 'es', 'es-ES', 'en'],
    mode: 'balanced',
    allowOriginalAudio: true,
    allowAudioWithPreferredSubtitles: true,
    allowUnknown: true,
  },
];

export const DEFAULT_LANGUAGE_PROFILE: LanguageProfile = {
  ...LANGUAGE_PRESETS[0],
};

const ALIASES: Record<string, string> = {
  latino: 'es-419',
  latam: 'es-419',
  'latin spanish': 'es-419',
  'spanish latino': 'es-419',
  castellano: 'es-ES',
  español: 'es',
  espanol: 'es',
  spanish: 'es',
  english: 'en',
  inglés: 'en',
  ingles: 'en',
  português: 'pt',
  portugues: 'pt',
  french: 'fr',
  français: 'fr',
  francais: 'fr',
  german: 'de',
  deutsch: 'de',
  italian: 'it',
  italiano: 'it',
  japanese: 'ja',
  japonés: 'ja',
  japones: 'ja',
  korean: 'ko',
  coreano: 'ko',
  chinese: 'zh',
  chino: 'zh',
  hindi: 'hi',
  arabic: 'ar',
  árabe: 'ar',
  arabe: 'ar',
  russian: 'ru',
  ruso: 'ru',
  turkish: 'tr',
  turco: 'tr',
  polish: 'pl',
  polaco: 'pl',
  unknown: 'und',
  undefined: 'und',
};

export const normalizeLanguageTag = (value?: string): string => {
  if (!value) return 'und';

  const normalized = value.trim().toLowerCase().replaceAll('_', '-');
  if (!normalized) return 'und';

  const alias = ALIASES[normalized];
  if (alias) return alias;

  const parts = normalized.split('-').filter(Boolean);
  if (parts.length === 0) return 'und';
  if (parts.length === 1) return parts[0];

  return `${parts[0]}-${parts[1].toUpperCase()}`;
};

const uniqueTags = (values: Array<string | undefined>): string[] =>
  [...new Set(values.map(normalizeLanguageTag).filter(tag => tag !== 'und'))];

const languageMatches = (actual: string, preferred: string): boolean => {
  const normalizedActual = normalizeLanguageTag(actual);
  const normalizedPreferred = normalizeLanguageTag(preferred);
  if (normalizedActual === normalizedPreferred) return true;

  const actualBase = normalizedActual.split('-')[0];
  const preferredBase = normalizedPreferred.split('-')[0];
  return actualBase === preferredBase && !normalizedPreferred.includes('-');
};

const includesPreferred = (actual: string[], preferred: string[]): boolean =>
  preferred.some(wanted => actual.some(value => languageMatches(value, wanted)));

const inferFromText = (candidate: LanguageCandidate) => {
  const text = [
    candidate.server,
    candidate.title,
    candidate.description,
    ...(candidate.subtitles?.map(track => track.title) || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const audio: string[] = [];
  const subtitles: string[] = [];

  if (/\b(latino|latam|es[- ]?419|audio lat)\b/i.test(text)) audio.push('es-419');
  if (/\b(castellano|es[- ]?es|spanish spain)\b/i.test(text)) audio.push('es-ES');
  if (/\b(español|espanol|spanish|dual esp)\b/i.test(text)) audio.push('es');
  if (/\b(english|inglés|ingles|audio en)\b/i.test(text)) audio.push('en');
  if (/\b(portugu[eê]s|pt[- ]?br|brasil)\b/i.test(text)) audio.push('pt-BR');
  if (/\b(français|francais|french)\b/i.test(text)) audio.push('fr');
  if (/\b(deutsch|german)\b/i.test(text)) audio.push('de');
  if (/\b(italiano|italian)\b/i.test(text)) audio.push('it');
  if (/\b(japanese|japon[eé]s)\b/i.test(text)) audio.push('ja');
  if (/\b(korean|coreano)\b/i.test(text)) audio.push('ko');
  if (/\b(chinese|mandarin|chino)\b/i.test(text)) audio.push('zh');
  if (/\b(hindi)\b/i.test(text)) audio.push('hi');
  if (/\b(arabic|árabe|arabe)\b/i.test(text)) audio.push('ar');
  if (/\b(russian|ruso)\b/i.test(text)) audio.push('ru');
  if (/\b(turkish|turco)\b/i.test(text)) audio.push('tr');
  if (/\b(polish|polaco)\b/i.test(text)) audio.push('pl');

  if (/\b(sub(?:title|titulado)?s?[- ]?(?:es|esp|latino)|sub español|sub esp)\b/i.test(text)) {
    subtitles.push(/\b(latino|latam|es[- ]?419)\b/i.test(text) ? 'es-419' : 'es');
  }
  if (/\b(english subs?|sub(?:title)?s? en)\b/i.test(text)) subtitles.push('en');
  if (/\b(portugu[eê]s subs?|legendas? pt)\b/i.test(text)) subtitles.push('pt-BR');

  return {audio: uniqueTags(audio), subtitles: uniqueTags(subtitles)};
};

export const getCandidateLanguages = (candidate: LanguageCandidate) => {
  const explicitAudio = uniqueTags(candidate.audioLanguages || []);
  const explicitSubtitles = uniqueTags([
    ...(candidate.subtitleLanguages || []),
    ...(candidate.subtitles?.map(track => track.language) || []),
  ]);
  const inferred = inferFromText(candidate);
  const originalLanguage = normalizeLanguageTag(candidate.originalLanguage);
  const audio = explicitAudio.length > 0 ? explicitAudio : inferred.audio;
  const subtitles =
    explicitSubtitles.length > 0 ? explicitSubtitles : inferred.subtitles;

  return {
    audio,
    subtitles,
    originalLanguage,
    hasMetadata:
      audio.length > 0 ||
      subtitles.length > 0 ||
      originalLanguage !== 'und',
  };
};

export const getLanguageCompatibilityScore = (
  candidate: LanguageCandidate,
  profile: LanguageProfile,
): number => {
  const languages = getCandidateLanguages(candidate);
  let score = 0;

  profile.preferredAudio.forEach((preferred, index) => {
    if (languages.audio.some(actual => languageMatches(actual, preferred))) {
      score = Math.max(score, 1000 - index * 100);
    }
  });

  if (
    profile.allowOriginalAudio &&
    languages.originalLanguage !== 'und' &&
    (languages.audio.includes(languages.originalLanguage) ||
      languages.audio.length === 0)
  ) {
    score = Math.max(score, 750);
  }

  if (
    profile.allowAudioWithPreferredSubtitles &&
    includesPreferred(languages.subtitles, profile.preferredSubtitles)
  ) {
    score = Math.max(score, 600);
  }

  profile.preferredSubtitles.forEach((preferred, index) => {
    if (languages.subtitles.some(actual => languageMatches(actual, preferred))) {
      score += Math.max(1, 50 - index * 5);
    }
  });

  if (languages.hasMetadata && score > 0) score += 10;
  return score;
};

export const filterAndRankByLanguage = <T extends LanguageCandidate>(
  candidates: T[],
  profile: LanguageProfile,
): T[] => {
  const ranked = candidates
    .map((candidate, index) => ({
      candidate,
      index,
      score: getLanguageCompatibilityScore(candidate, profile),
      metadata: getCandidateLanguages(candidate).hasMetadata,
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (profile.mode === 'flexible') {
    return ranked.map(item => item.candidate);
  }

  const compatible = ranked.filter(item => item.score > 0);
  if (compatible.length > 0) {
    return compatible.map(item => item.candidate);
  }

  if (profile.mode === 'balanced' || profile.allowUnknown) {
    return ranked.filter(item => !item.metadata).map(item => item.candidate);
  }

  return [];
};
