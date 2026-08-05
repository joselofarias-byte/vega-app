import React, {useCallback, useState} from 'react';
import {Pressable, View} from 'react-native';
import AppText from '../../../components/ui/Text';
import SettingsSection from '../../../components/ui/SettingsSection';
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
    description: 'Hide streams that do not match the selected languages.',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Prefer matches and use unknown streams only as a fallback.',
  },
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Rank preferred languages first but keep every stream visible.',
  },
];

const LanguagePreferencesSection = () => {
  const colors = useM3Colors();
  const [profile, setProfileState] = useState<LanguageProfile>(() =>
    languagePreferencesStorage.getProfile(),
  );

  const saveProfile = useCallback((next: LanguageProfile) => {
    const customProfile = {...next, id: next.id || 'custom'};
    setProfileState(customProfile);
    languagePreferencesStorage.setProfile(customProfile);
  }, []);

  const setCustomProfile = useCallback(
    (updates: Partial<LanguageProfile>) => {
      saveProfile({...profile, ...updates, id: 'custom', name: 'Custom'});
    },
    [profile, saveProfile],
  );

  const toggleLanguage = useCallback(
    (key: 'preferredAudio' | 'preferredSubtitles', language: string) => {
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
          <View className="flex-row flex-wrap gap-2">
            {COMMON_LANGUAGE_OPTIONS.map(option => {
              const selected = profile.preferredAudio.includes(option.tag);
              return (
                <Pressable
                  key={`audio-${option.tag}`}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  onPress={() => toggleLanguage('preferredAudio', option.tag)}
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
        </View>

        <View
          className="px-4 pb-4 pt-1"
          style={{borderTopColor: colors.outlineVariant, borderTopWidth: 1}}>
          <AppText
            role="labelLarge"
            className="mb-2 mt-3 text-m3-on-surface-variant">
            Preferred subtitles
          </AppText>
          <View className="flex-row flex-wrap gap-2">
            {COMMON_LANGUAGE_OPTIONS.map(option => {
              const selected = profile.preferredSubtitles.includes(option.tag);
              return (
                <Pressable
                  key={`subtitle-${option.tag}`}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  onPress={() =>
                    toggleLanguage('preferredSubtitles', option.tag)
                  }
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
        </View>

        <SettingsSection title="Language fallbacks">
          <SettingsSwitchRow
            title="Allow original audio"
            description="Accept a stream explicitly marked with its original language."
            value={profile.allowOriginalAudio}
            onValueChange={value =>
              setCustomProfile({allowOriginalAudio: value})
            }
          />
          <SettingsSwitchRow
            title="Other audio with preferred subtitles"
            description="Accept another audio language when preferred subtitles exist."
            value={profile.allowAudioWithPreferredSubtitles}
            onValueChange={value =>
              setCustomProfile({allowAudioWithPreferredSubtitles: value})
            }
          />
          <SettingsSwitchRow
            title="Allow unknown language"
            description="Keep sources that do not provide reliable language metadata."
            value={profile.allowUnknown}
            divider={false}
            onValueChange={value => setCustomProfile({allowUnknown: value})}
          />
        </SettingsSection>
      </Surface>
    </View>
  );
};

export default LanguagePreferencesSection;
