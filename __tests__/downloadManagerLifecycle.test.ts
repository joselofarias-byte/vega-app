const mockBackendStart = jest.fn(async () => undefined);
const mockBackendCancel = jest.fn(async () => undefined);
const mockBackendCleanup = jest.fn(async () => undefined);
const mockBackendPause = jest.fn(async () => undefined);
const mockBackendResume = jest.fn(async () => undefined);
let mockDownloadConcurrency = 2;

jest.mock('react-native-image-colors', () => ({
  cache: {removeItem: jest.fn()},
  getColors: jest.fn(async () => ({
    platform: 'android',
    lightVibrant: '#FFFFFF',
    vibrant: '#FFFFFF',
    dominant: '#FFFFFF',
    average: '#FFFFFF',
    darkVibrant: '#FFFFFF',
  })),
}));

jest.mock('../src/lib/downloadBackends/registry', () => ({
  getDownloadBackend: () => ({
    start: mockBackendStart,
    pause: mockBackendPause,
    resume: mockBackendResume,
    cancel: mockBackendCancel,
    cleanup: mockBackendCleanup,
  }),
}));

jest.mock('../src/lib/downloadDestination', () => ({
  prepareDownloadDestination: async () => ({
    stagingDirectory: '/cache/downloads/movie',
    stagingPath: '/cache/downloads/movie/Movie.mp4.part',
  }),
  finalizeDownloadOutput: async () => ({
    filePath: 'content://downloads/Movie.mp4',
    finalDocumentUri: 'content://downloads/Movie.mp4',
    size: 100,
  }),
  cleanupDownloadStaging: async () => undefined,
}));

jest.mock('../src/lib/downloadLocation', () => ({
  ensureDownloadLocationAccess: async (location: unknown) => location,
  isSafDownloadLocation: () => true,
}));

jest.mock('../src/lib/services/Notification', () => ({
  notificationService: {
    ensureDownloadPermission: jest.fn(async () => true),
    startForegroundTask: jest.fn(),
    stopForegroundTask: jest.fn(async () => undefined),
    showDownloadStarting: jest.fn(async () => undefined),
    showDownloadQueued: jest.fn(async () => undefined),
    showDownloadProgress: jest.fn(async () => undefined),
    showDownloadComplete: jest.fn(async () => undefined),
    showDownloadFailed: jest.fn(async () => undefined),
    cancelNotification: jest.fn(async () => undefined),
  },
}));

jest.mock('../src/lib/storage', () => ({
  settingsStorage: {
    getDownloadLocationConfig: () => undefined,
    getDownloadConcurrency: () => mockDownloadConcurrency,
    setDownloadLocation: jest.fn(),
  },
}));

jest.mock('react-native-mmkv-storage', () => ({
  MMKVLoader: class {
    withInstanceID() {
      return this;
    }
    initialize() {
      return {
        getString: () => undefined,
        setString: () => undefined,
        getBool: () => undefined,
        setBool: () => undefined,
        getInt: () => undefined,
        setInt: () => undefined,
        removeItem: () => undefined,
        clearStore: () => undefined,
      };
    }
  },
}));

import {
  cancelDownload,
  pauseDownload,
  resumeDownload,
  scheduleQueuedDownloads,
  startDownload,
  startQueuedDownloadNow,
} from '../src/lib/downloadManager';
import {notificationService} from '../src/lib/services/Notification';
import useDownloadsStore from '../src/lib/zustand/downloadsStore';

const mockStartForegroundTask =
  notificationService.startForegroundTask as jest.Mock;
const mockStopForegroundTask =
  notificationService.stopForegroundTask as jest.Mock;
const mockShowStarting = notificationService.showDownloadStarting as jest.Mock;
const mockShowQueued = notificationService.showDownloadQueued as jest.Mock;
const mockShowComplete = notificationService.showDownloadComplete as jest.Mock;
const mockShowFailed = notificationService.showDownloadFailed as jest.Mock;
const mockCancelNotification =
  notificationService.cancelNotification as jest.Mock;

const location = {
  type: 'saf' as const,
  uri: 'content://downloads/tree',
  label: 'Downloads',
};

const flushAsyncWork = () =>
  new Promise<void>(resolve => setImmediate(resolve));

const enqueueDownload = () =>
  useDownloadsStore.getState().enqueueDownload({
    id: 'movie-direct-0',
    title: 'Movie',
    url: 'https://example.com/movie.mp4',
    type: 'video',
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    location,
  });

describe('download manager lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDownloadConcurrency = 2;
    useDownloadsStore.setState({downloads: {}});
  });

  it('starts a queued download and stops foreground task after completion', async () => {
    enqueueDownload();

    await startQueuedDownloadNow('movie-direct-0');
    await flushAsyncWork();

    expect(mockBackendStart).toHaveBeenCalledTimes(1);
    expect(mockStartForegroundTask).toHaveBeenCalled();
    expect(mockShowStarting).toHaveBeenCalled();
    expect(mockShowComplete).toHaveBeenCalled();
    expect(mockStopForegroundTask).toHaveBeenCalled();
  });

  it('pauses, resumes, and cancels through the backend', async () => {
    enqueueDownload();
    useDownloadsStore.getState().updateDownload('movie-direct-0', {
      status: 'downloading',
    });

    await pauseDownload('movie-direct-0');
    await resumeDownload('movie-direct-0');
    await cancelDownload('movie-direct-0');

    expect(mockBackendPause).toHaveBeenCalledWith('movie-direct-0');
    expect(mockBackendResume).toHaveBeenCalledWith('movie-direct-0');
    expect(mockBackendCancel).toHaveBeenCalledWith('movie-direct-0');
    expect(mockCancelNotification).toHaveBeenCalled();
  });

  it('schedules queued downloads up to configured concurrency', async () => {
    enqueueDownload();
    useDownloadsStore.getState().enqueueDownload({
      id: 'movie-direct-1',
      title: 'Movie 2',
      url: 'https://example.com/movie2.mp4',
      type: 'video',
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      location,
    });

    mockDownloadConcurrency = 1;
    scheduleQueuedDownloads();
    await flushAsyncWork();

    expect(mockBackendStart).toHaveBeenCalledTimes(1);
  });

  it('surfaces backend failures and stops foreground task', async () => {
    enqueueDownload();
    mockBackendStart.mockRejectedValueOnce(new Error('network failed'));

    await expect(startDownload('movie-direct-0')).rejects.toThrow('network failed');
    expect(mockShowFailed).toHaveBeenCalled();
    expect(mockStopForegroundTask).toHaveBeenCalled();
  });
});
