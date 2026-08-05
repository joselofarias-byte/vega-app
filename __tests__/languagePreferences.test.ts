import {
  DEFAULT_LANGUAGE_PROFILE,
  filterAndRankByLanguage,
  getCandidateLanguages,
  normalizeLanguageTag,
} from '../src/lib/languagePreferences';

describe('language preferences', () => {
  test('normalizes common aliases and BCP 47 tags', () => {
    expect(normalizeLanguageTag('latino')).toBe('es-419');
    expect(normalizeLanguageTag('CASTELLANO')).toBe('es-ES');
    expect(normalizeLanguageTag('pt_br')).toBe('pt-BR');
    expect(normalizeLanguageTag('English')).toBe('en');
  });

  test('explicit metadata takes precedence over text inference', () => {
    expect(
      getCandidateLanguages({
        title: 'Spanish edition',
        audioLanguages: ['hi'],
        subtitles: [{language: 'es-419', title: 'Español latino'}],
      }),
    ).toMatchObject({
      audio: ['hi'],
      subtitles: ['es-419'],
      hasMetadata: true,
    });
  });

  test('Spanish profile ranks Latin Spanish before English with Spanish subtitles', () => {
    const latin = {
      server: 'Latino',
      audioLanguages: ['es-419'],
      subtitleLanguages: [],
    };
    const englishSubbed = {
      server: 'English subs',
      audioLanguages: ['en'],
      subtitleLanguages: ['es'],
    };

    expect(
      filterAndRankByLanguage(
        [englishSubbed, latin],
        DEFAULT_LANGUAGE_PROFILE,
      ),
    ).toEqual([latin, englishSubbed]);
  });

  test('strict mode hides incompatible and unknown streams', () => {
    const strict = {
      ...DEFAULT_LANGUAGE_PROFILE,
      mode: 'strict' as const,
      allowUnknown: false,
    };
    const hindi = {server: 'Hindi', audioLanguages: ['hi']};
    const unknown = {server: 'Server 1'};

    expect(filterAndRankByLanguage([hindi, unknown], strict)).toEqual([]);
  });

  test('balanced mode uses unknown streams only when no compatible stream exists', () => {
    const balanced = {
      ...DEFAULT_LANGUAGE_PROFILE,
      mode: 'balanced' as const,
      allowUnknown: true,
    };
    const unknown = {server: 'Server 1'};
    const incompatible = {server: 'Hindi', audioLanguages: ['hi']};
    const compatible = {server: 'Latin', audioLanguages: ['es-419']};

    expect(filterAndRankByLanguage([incompatible, unknown], balanced)).toEqual([
      unknown,
    ]);
    expect(
      filterAndRankByLanguage([unknown, compatible, incompatible], balanced),
    ).toEqual([compatible]);
  });

  test('flexible mode preserves every stream but ranks preferred matches first', () => {
    const flexible = {
      ...DEFAULT_LANGUAGE_PROFILE,
      mode: 'flexible' as const,
    };
    const unknown = {server: 'Server 1'};
    const japanese = {server: 'Japanese', audioLanguages: ['ja']};
    const latin = {server: 'Latin', audioLanguages: ['es-419']};

    expect(
      filterAndRankByLanguage([unknown, japanese, latin], flexible),
    ).toEqual([latin, unknown, japanese]);
  });
});
