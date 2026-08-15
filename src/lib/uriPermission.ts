import {NativeModules, Platform} from 'react-native';

type UriPermissionModuleType = {
  takePersistableUriPermission: (uri: string) => Promise<boolean>;
  releasePersistableUriPermission: (uri: string) => Promise<boolean>;
  getPersistedUriPermissions: () => Promise<string[]>;
};

const getUriPermissionModule = (): UriPermissionModuleType | undefined =>
  NativeModules.UriPermissionModule as UriPermissionModuleType | undefined;

export const takePersistableUriPermission = async (
  uri: string,
): Promise<boolean> => {
  if (Platform.OS !== 'android' || !uri?.startsWith('content://')) {
    return false;
  }
  try {
    const module = getUriPermissionModule();
    if (!module?.takePersistableUriPermission) {
      return false;
    }
    await module.takePersistableUriPermission(uri);
    return true;
  } catch (error) {
    console.warn('Failed to persist uri permission for', uri, error);
    return false;
  }
};

export const releasePersistableUriPermission = async (
  uri?: string,
): Promise<void> => {
  if (!uri || Platform.OS !== 'android' || !uri.startsWith('content://')) {
    return;
  }
  try {
    const module = getUriPermissionModule();
    await module?.releasePersistableUriPermission?.(uri);
  } catch (error) {
    console.warn('Failed to release uri permission for', uri, error);
  }
};
