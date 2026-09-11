import React, {useCallback, useState} from 'react';
import {Pressable, View} from 'react-native';
import AppText from '../../../components/ui/Text';
import SettingsSwitchRow from '../../../components/ui/SettingsSwitchRow';
import Surface from '../../../components/ui/Surface';
import {useM3Colors} from '../../../theme/M3PaletteContext';
import {
  COMMON_LANGUAGE_OPTIONS,
  LANGUAGE_PRESETS,
  LanguageFilterMode,
  LanguageProfile,
} from '../../../lib/languagePreferences';
import {languagePreferencesStorage} from '../../../lib/storage/languagePreferencesStorage';

const MODE_OPTIONS: Array<{
  value: LanguageFilterMode;
  label: string;
  description: string;
}> = [
  {
    value: 'strict',
    label: 'Strict',
    description: 'Show only sources that match the selected rules.',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description:
      'Prefer matches and use unknown sources only when no match exists.',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Rank preferred languages first but keep every source visible.',
  },
];

type LanguageListKey =
  | 'preferredAudio'
  | 'preferredSubtitles'
  | 'subtitleFallbackAudio';

const LanguagePreferencesSection = () => {
  const colors = useM3Colors();
  const [profile, setProfileState] = useState<LanguageProfile>(() =>
    languagePreferencesStorage.getProfile(),
  );

  const saveProfile = useCallback((next: LanguageProfile) => {
    const savedProfile = {...next, id: next.id || 'custom'};
    setProfileState(savedProfile);
    languagePreferencesStorage.setProfile(savedProfile);
  }, []);

  const setCustomProfile = useCallback(
    (updates: Partial<LanguageProfile>) => {
      saveProfile({...profile, ...updates, id: 'custom', name: 'Custom'});
    },
    [profile, saveProfile],
  );

  const toggleLanguage = useCallback(
    (key: LanguageListKey, language: string) => {
      const current = profile[key];
      const next = current.includes(language)
        ? current.filter(item => item !== language)
        : [...current, language];
      setCustomProfile({[key]: next});
    },
    [profile, setCustomProfile],
  );

  const chipStyle = (selected: boolean) => ({
    backgroundColor: selected
      ? colors.secondaryContainer
      : colors.surfaceContainerHigh,
    borderColor: selected ? colors.primary : colors.outlineVariant,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  });

  const renderLanguageChips = (key: LanguageListKey) => (
    <View className="flex-row flex-wrap gap-2">
      {COMMON_LANGUAGE_OPTIONS.map(option => {
        const selectedIndex = profile[key].indexOf(option.tag);
        const selected = selectedIndex !== -1;
        return (
          <Pressable
            key={`${key}-${option.tag}`}
            accessibilityRole="button"
            accessibilityState={{selected}}
            onPress={() => toggleLanguage(key, option.tag)}
            style={chipStyle(selected)}>
            <AppText
              role="labelLargeEmphasized"
              style={{
                color: selected
                  ? colors.onSecondaryContainer
                  : colors.onSurface,
              }}>
              {selected ? `${selectedIndex + 1}. ` : ''}
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View className="mb-6">
      <AppText
        role="labelLarge"
        className="mb-3 text-m3-on-surface-variant">
        Languages
      </AppText>

      <Surface level="low" className="overflow-hidden">
        <View className="p-4">
          <AppText role="bodyLarge" className="text-m3-on-surface">
            Language profile
          </AppText>
          <AppText
            role="bodySmall"
            className="mb-4 mt-1 text-m3-on-surface-variant">
            Filter and rank sources by audio and subtitle language.
          </AppText>

          <View className="flex-row flex-wrap gap-2">
            {LANGUAGE_PRESETS.map(preset => {
              const selected = profile.id === preset.id;
              return (
                <Pressable
                  key={preset.id}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  onPress={() => saveProfile({...preset})}
                  style={chipStyle(selected)}>
                  <AppText
                    role="labelLargeEmphasized"
                    style={{
                      color: selected
                        ? colors.onSecondaryContainer
                        : colors.onSurface,
                    }}>
                    {preset.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          className="px-4 pb-4 pt-1"
          style={{borderTopColor: colors.outlineVariant, borderTopWidth: 1}}>
          <AppText
            role="labelLarge"
            className="mb-2 mt-3 text-m3-on-surface-variant">
            Filter mode
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {MODE_OPTIONS.map(option => {
              const selected = profile.mode === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  onPress={() => setCustomProfile({mode: option.value})}
                  style={chipStyle(selected)}>
                  <AppText
                    role="labelLargeEmphasized"
                    style={{
                      color: selected
                        ? colors.onSecondaryContainer
                        : colors.onSurface,
                    }}>
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          <AppText
            role="bodySmall"
            className="mt-2 text-m3-on-surface-variant">
            {MODE_OPTIONS.find(option => option.value === profile.mode)
              ?.description || ''}
          </AppText>
        </View>

        <View
          className="px-4 pb-4 pt-1"
          style={{borderTopColor: colors.outlineVariant, borderTopWidth: 1}}>
          <AppText
            role="labelLarge"
            className="mb-2 mt-3 text-m3-on-surface-variant">
            Preferred audio
          </AppText>
          <AppText
            role="bodySmall"
            className="mb-3 text-m3-on-surface-variant">
            Numbers show priority. Remove and add a language again to reorder it.
          </AppText>
          {renderLanguageChips('preferredAudio')}
        </View>

        <View
          className="px-4 pb-4 pt-1"
          style={{borderTopColor: colors.outlineVariant, borderTopWidth: 1}}>
          <AppText
            role="labelLarge"
            className="mb-2 mt-3 text-m3-on-surface-variant">
            Preferred subtitles
          </AppText>
          {renderLanguageChips('preferredSubtitles')}
        </View>

        <View
          className="px-4 pb-4 pt-1"
          style={{borderTopColor: colors.outlineVariant, borderTopWidth: 1}}>
          <AppText
            role="labelLarge"
            className="mb-2 mt-3 text-m3-on-surface-variant">
            Audio accepted with preferred subtitles
          </AppText>
          <AppText
            role="bodySmall"
            className="mb-3 text-m3-on-surface-variant">
            A source must have one of these audio languages and a preferred
            subtitle. The Spanish profiles include English by default.
          </AppText>
          {renderLanguageChips('subtitleFallbackAudio')}
        </View>

        <View
          style={{borderTopColor: colors.outlineVariant, borderTopWidth: 1}}>
          <View className="px-4 pb-2 pt-4">
            <AppText role="labelLarge" className="text-m3-on-surface-variant">
              Fallbacks
            </AppText>
          </View>
          <SettingsSwitchRow
            title="Allow original audio"
            description="Accept a source explicitly marked with its original language."
            value={profile.allowOriginalAudio}
            onValueChange={value =>
              setCustomProfile({allowOriginalAudio: value})
            }
          />
          <SettingsSwitchRow
            title="Allow unknown language"
            description="In Balanced mode, use unresolved sources only when no match exists."
            value={profile.allowUnknown}
            divider={false}
            onValueChange={value => setCustomProfile({allowUnknown: value})}
          />
        </View>
      </Surface>
    </View>
  );
};

export default LanguagePreferencesSection;
