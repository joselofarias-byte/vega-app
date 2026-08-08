from pathlib import Path

season_path = Path('src/components/SeasonList.tsx')
season = season_path.read_text()

imp = "import EpisodeRowContent from './EpisodeRowContent';\n"
new_imp = imp + "import {setSyncedEpisodeProgress} from '../lib/sync/syncService';\n"
if "setSyncedEpisodeProgress" not in season:
    if imp not in season:
        raise SystemExit('SeasonList import anchor missing')
    season = season.replace(imp, new_imp, 1)

watched_start = season.index('  // Memoized mark as watched handler')
unwatched_start = season.index('  // Memoized mark as unwatched handler')
sticky_start = season.index('  // Memoized sticky menu external player handler')

watched_block = '''  // Memoized mark as watched handler
  const markAsWatched = useCallback(() => {
    if (stickyMenu.link) {
      cacheStorage.setString(
        stickyMenu.link,
        JSON.stringify({
          position: 10000,
          duration: 1,
        }),
      );
      const episode = [...episodeList, ...(activeSeason.directLinks || [])].find(
        item => item.link === stickyMenu.link,
      );
      if (episode) {
        setSyncedEpisodeProgress({
          episode,
          title: metaTitle,
          poster: poster.poster,
          background: poster.background,
          provider: providerValue,
          infoUrl: routeParams.link,
          type,
          position: 10000,
          duration: 1,
        });
      }
      setStickyMenu({active: false});
    }
  }, [
    activeSeason.directLinks,
    episodeList,
    metaTitle,
    poster.background,
    poster.poster,
    providerValue,
    routeParams.link,
    stickyMenu.link,
    type,
  ]);

'''

unwatched_block = '''  // Memoized mark as unwatched handler
  const markAsUnwatched = useCallback(() => {
    if (stickyMenu.link) {
      cacheStorage.setString(
        stickyMenu.link,
        JSON.stringify({
          position: 0,
          duration: 1,
        }),
      );
      const episode = [...episodeList, ...(activeSeason.directLinks || [])].find(
        item => item.link === stickyMenu.link,
      );
      if (episode) {
        setSyncedEpisodeProgress({
          episode,
          title: metaTitle,
          poster: poster.poster,
          background: poster.background,
          provider: providerValue,
          infoUrl: routeParams.link,
          type,
          position: 0,
          duration: 1,
        });
      }
      setStickyMenu({active: false});
    }
  }, [
    activeSeason.directLinks,
    episodeList,
    metaTitle,
    poster.background,
    poster.poster,
    providerValue,
    routeParams.link,
    stickyMenu.link,
    type,
  ]);

'''

season = season[:watched_start] + watched_block + unwatched_block + season[sticky_start:]
season_path.write_text(season)

service_path = Path('src/lib/sync/syncService.ts')
service = service_path.read_text()

old_remote = '''  Object.values(limitedHistory).forEach(item => {
    if (!item.link || !item.provider) {
      return;
    }'''
new_remote = '''  Object.values(limitedHistory).forEach(item => {
    const episode = item.episode;
    const position = item.progress ?? item.currentTime ?? 0;
    const duration = item.duration ?? 0;
    if (episode?.link && duration > 0) {
      cacheStorage.setString(
        episode.link,
        JSON.stringify({position, duration}),
      );
    }
    if (!item.link || !item.provider) {
      return;
    }'''
if old_remote in service:
    service = service.replace(old_remote, new_remote, 1)

old_inner = '''      const position = item.progress ?? item.currentTime ?? 0;
      const duration = item.duration ?? 0;
      if (episode.link && position > 0) {
        cacheStorage.setString(
          episode.link,
          JSON.stringify({position, duration}),
        );
      }
      return {'''
new_inner = '''      const position = item.progress ?? item.currentTime ?? 0;
      const duration = item.duration ?? 0;
      return {'''
if old_inner in service:
    service = service.replace(old_inner, new_inner, 1)

if 'export const setSyncedEpisodeProgress' not in service:
    anchor = '''const applyRemoteDownloads = async (
  downloads: Record<string, SyncedDownload>,
) => {'''
    fn = '''export const setSyncedEpisodeProgress = ({
  episode,
  title,
  poster,
  background,
  provider,
  infoUrl,
  type,
  position,
  duration,
}: {
  episode: ContinueWatchingItem['episode'];
  title: string;
  poster?: string;
  background?: string;
  provider: string;
  infoUrl: string;
  type: string;
  position: number;
  duration: number;
}) => {
  const id = episode.sourceLink || episode.id || episode.link;
  if (!id) {
    return;
  }
  const updatedAt = Date.now();
  const history = getLocalHistory();
  history[id] = {
    id,
    title,
    poster,
    background,
    provider,
    link: infoUrl,
    duration,
    progress: position,
    currentTime: position,
    isSeries: type === 'series',
    lastPlayed: updatedAt,
    episodeTitle: episode.title,
    episode,
    type,
    updatedAt,
  };
  saveLocalHistory(history);
  cacheStorage.setString(
    episode.link,
    JSON.stringify({position, duration}),
  );
  schedulePublish();
};

'''
    if anchor not in service:
        raise SystemExit('syncService anchor missing')
    service = service.replace(anchor, fn + anchor, 1)

if 'const MAX_HISTORY_ITEMS = 100;' not in service:
    raise SystemExit('Refusing port: fork history limit no longer 100')

service_path.write_text(service)
