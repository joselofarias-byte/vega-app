import {
  DEFAULT_LANGUAGE_PROFILE,
  evaluateLanguageCandidate,
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

  test('explicit audio metadata takes precedence over text inference', () => {
    expect(
      getCandidateLanguages({
        title: 'Spanish edition',
        audioLanguages: ['hi'],
        subtitles: [{language: 'es-419', title: 'Español latino'}],
      }),
    ).toMatchObject({
      audio: ['hi'],
      subtitles: ['es-419'],
      audioKnown: true,
      subtitleKnown: true,
    });
  });

  test('a subtitle title is not mistaken for the stream audio language', () => {
    expect(
      getCandidateLanguages({
        server: 'Server 1',
        subtitles: [{language: 'es-419', title: 'Español latino'}],
      }),
    ).toMatchObject({
      audio: [],
      subtitles: ['es-419'],
      audioKnown: false,
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

  test('Spanish subtitles do not accept an unselected audio language', () => {
    const hindiWithSpanishSubtitles = {
      audioLanguages: ['hi'],
      subtitleLanguages: ['es-419'],
    };

    expect(
      evaluateLanguageCandidate(
        hindiWithSpanishSubtitles,
        DEFAULT_LANGUAGE_PROFILE,
      ).compatibility,
    ).toBe('incompatible');
  });

  test('strict mode hides incompatible and unknown streams', () => {
    const strict = {
      ...DEFAULT_LANGUAGE_PROFILE,
      mode: 'strict' as const,
      allowUnknown: true,
    };
    const hindi = {server: 'Hindi', audioLanguages: ['hi']};
    const unknown = {server: 'Server 1'};

    expect(filterAndRankByLanguage([hindi, unknown], strict)).toEqual([]);
  });

  test('balanced mode respects the unknown-language setting', () => {
    const unknown = {server: 'Server 1'};
    const incompatible = {server: 'Hindi', audioLanguages: ['hi']};

    expect(
      filterAndRankByLanguage(
        [incompatible, unknown],
        {...DEFAULT_LANGUAGE_PROFILE, allowUnknown: true},
      ),
    ).toEqual([unknown]);
    expect(
      filterAndRankByLanguage(
        [incompatible, unknown],
        {...DEFAULT_LANGUAGE_PROFILE, allowUnknown: false},
      ),
    ).toEqual([]);
  });

  test('balanced mode never falls back when a compatible stream exists', () => {
    const unknown = {server: 'Server 1'};
    const incompatible = {server: 'Hindi', audioLanguages: ['hi']};
    const compatible = {server: 'Latin', audioLanguages: ['es-419']};

    expect(
      filterAndRankByLanguage(
        [unknown, compatible, incompatible],
        DEFAULT_LANGUAGE_PROFILE,
      ),
    ).toEqual([compatible]);
  });

  test('flexible mode preserves every stream and ranks by compatibility', () => {
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

  test('original audio requires explicit original-language metadata', () => {
    const profile = {
      ...DEFAULT_LANGUAGE_PROFILE,
      preferredAudio: [],
      subtitleFallbackAudio: [],
      allowOriginalAudio: true,
      mode: 'strict' as const,
    };

    expect(
      filterAndRankByLanguage(
        [
          {audioLanguages: ['ja'], originalLanguage: 'ja'},
          {audioLanguages: ['ko']},
        ],
        profile,
      ),
    ).toEqual([{audioLanguages: ['ja'], originalLanguage: 'ja'}]);
  });
});
