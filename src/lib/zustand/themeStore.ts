import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {MMKVLoader} from 'react-native-mmkv-storage';
import {settingsStorage} from '../storage';
import {DEFAULT_SEED} from '../../theme/seeds';

const storage = new MMKVLoader().initialize();

export type AccentSource = 'wallpaper' | 'custom';

export interface Theme {
  primary: string;
  isCustom: boolean;
  /** Where the Material 3 palette comes from: the device wallpaper or a curated seed. */
  source: AccentSource;
  setPrimary: (type: Theme['primary']) => void;
  setCustom: (isCustom: boolean) => void;
  setSource: (source: AccentSource) => void;
}

const storedPrimary = settingsStorage.getPrimaryColor();
const initialPrimary =
  storedPrimary.toUpperCase() === '#FFFFFF' && !settingsStorage.isCustomTheme()
    ? DEFAULT_SEED
    : storedPrimary;

const useThemeStore = create<Theme>()(
  persist(
    set => ({
      primary: initialPrimary,
      isCustom: settingsStorage.isCustomTheme(),
      source: settingsStorage.getAccentSource(),

      setPrimary: (primary: Theme['primary']) => {
        set({primary});
        settingsStorage.setPrimaryColor(primary);
      },
      setCustom: (isCustom: Theme['isCustom']) => {
        set({isCustom});
        settingsStorage.setCustomTheme(isCustom);
      },
      setSource: (source: AccentSource) => {
        set({source});
        settingsStorage.setAccentSource(source);
      },
    }),
    {
      name: 'content-storage',
      //@ts-expect-error
      storage: createJSONStorage(() => storage),
    },
  ),
);

export default useThemeStore;
