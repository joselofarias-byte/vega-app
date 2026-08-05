#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly CAST_COMMIT='86903b3ac624763db41ab38e693794d264672ae8'
readonly TARGET_APK='dist/Vega-4.0.3-sin-telemetria-release.apk'

npm ci --legacy-peer-deps
npm uninstall react-native-google-cast --legacy-peer-deps

git show "${CAST_COMMIT}^:src/screens/home/Player.tsx" \
  > src/screens/home/Player.tsx
git show "${CAST_COMMIT}^:src/components/navigation/StreamingTabBar.tsx" \
  > src/components/navigation/StreamingTabBar.tsx

python3 <<'PY'
from pathlib import Path

player = Path('src/screens/home/Player.tsx')
raw = player.read_bytes()
newline = b'\r\n' if b'\r\n' in raw else b'\n'
lines = raw.replace(b'\r\n', b'\n').splitlines()
obsolete = {
    b"// import {CastButton, useRemoteMediaClient} from 'react-native-google-cast';",
    b"// import GoogleCast from 'react-native-google-cast';",
}
filtered = [line for line in lines if line.strip() not in obsolete]
player.write_bytes(newline.join(filtered) + newline)

config = Path('app.config.js')
raw = config.read_bytes()
block = (
    "    [\n"
    "      'react-native-google-cast',\n"
    "      {\n"
    "        expandedController: true,\n"
    "      },\n"
    "    ],\n"
).encode()
candidates = (block, block.replace(b'\n', b'\r\n'))
matches = [(candidate, raw.count(candidate)) for candidate in candidates]
found = [(candidate, count) for candidate, count in matches if count]
if len(found) != 1 or found[0][1] != 1:
    raise SystemExit(f'Bloque Cast inesperado en app.config.js: {matches}')
config.write_bytes(raw.replace(found[0][0], b'', 1))
PY

rm -f src/components/CastRemotePlayer.tsx
rm -f \
  .github/workflows/strip-cast-pr.yml \
  scripts/strip-cast-and-build.sh

forbidden='react-native-google-cast|com\.google\.android\.gms\.cast|play-services-cast|@react-native-firebase|firebaseSafe|FirebaseAnalytics|FirebaseCrashlytics|Crashlytics|crashlytics|TELEMETRY_OPT_IN|telemetryOptIn|isTelemetryOptIn|setTelemetryOptIn|analytics_storage|ad_storage|ad_user_data|ad_personalization|io\.sentry|appcenter|bugsnag|mixpanel|posthog'
targets=(src app.config.js package.json package-lock.json)
residual="$(grep -RInE "$forbidden" "${targets[@]}" --exclude-dir=node_modules --exclude-dir=build 2>/dev/null || true)"
if [[ -n "$residual" ]]; then
  printf '%s\n' "$residual" >&2
  exit 1
fi

if npm ls react-native-google-cast --all >/dev/null 2>&1; then
  printf 'react-native-google-cast continúa en el árbol npm.\n' >&2
  exit 1
fi

node -e "JSON.parse(require('fs').readFileSync('package.json')); JSON.parse(require('fs').readFileSync('package-lock.json'));"
git -c core.whitespace=cr-at-eol diff --check

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add -A
git -c core.whitespace=cr-at-eol diff --cached --check
git commit -m 'privacy: remove unavoidable Google Cast telemetry'
git push origin HEAD:remove-telemetry-v2

npm run build:sandbox
npx expo prebuild --platform android --clean

pushd android >/dev/null
chmod +x gradlew
./gradlew --no-daemon :app:dependencies --configuration releaseRuntimeClasspath \
  > "$RUNNER_TEMP/release-dependencies.txt"
if grep -Ei 'play-services-cast|firebase-analytics|firebase-crashlytics|firebase-perf|firebase-encoders|sentry|appcenter|bugsnag|mixpanel|posthog' \
  "$RUNNER_TEMP/release-dependencies.txt"; then
  printf 'El grafo Android conserva una dependencia de telemetría.\n' >&2
  exit 1
fi
popd >/dev/null

keytool -genkeypair \
  -keystore "$RUNNER_TEMP/vega-telemetry-free.keystore" \
  -storepass "$MYAPP_UPLOAD_STORE_PASSWORD" \
  -alias "$MYAPP_UPLOAD_KEY_ALIAS" \
  -keypass "$MYAPP_UPLOAD_KEY_PASSWORD" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname 'CN=Vega Telemetry Free, O=Local Build, C=UY'
export MYAPP_UPLOAD_STORE_FILE="$RUNNER_TEMP/vega-telemetry-free.keystore"

(
  cd android
  ./gradlew --no-daemon --stacktrace assembleRelease
)

mkdir -p dist "$RUNNER_TEMP/dex"

source_apk="$(find android/app/build/outputs/apk/release -type f -name '*universal*.apk' | sort | head -n 1)"
if [[ -z "$source_apk" ]]; then
  source_apk="$(find android/app/build/outputs/apk/release -type f -name '*arm64-v8a*.apk' | sort | head -n 1)"
fi
if [[ -z "$source_apk" ]]; then
  source_apk="$(find android/app/build/outputs/apk/release -type f -name '*.apk' | sort | head -n 1)"
fi
[[ -n "$source_apk" ]] || {
  printf 'No se encontró un APK release.\n' >&2
  exit 1
}

cp "$source_apk" "$TARGET_APK"

entries="$(unzip -Z1 "$TARGET_APK")"
if grep -Ei 'play-services-cast|firebase-analytics|firebase-crashlytics|firebase-perf|firebase-encoders|sentry|appcenter|bugsnag|mixpanel|posthog' <<<"$entries"; then
  printf 'El APK conserva archivos de telemetría.\n' >&2
  exit 1
fi

unzip -q "$TARGET_APK" 'classes*.dex' -d "$RUNNER_TEMP/dex"
dex_hits="$(find "$RUNNER_TEMP/dex" -name 'classes*.dex' -print0 \
  | xargs -0 strings -a \
  | grep -Ei 'com[./]google[./]android[./]gms[./]cast|com[./]google[./]firebase[./](analytics|crashlytics|perf)|io[./]sentry|com[./]microsoft[./]appcenter|com[./]bugsnag|com[./]mixpanel|com[./]posthog' \
  || true)"
if [[ -n "$dex_hits" ]]; then
  printf '%s\n' "$dex_hits" >&2
  printf 'El DEX conserva clases de telemetría.\n' >&2
  exit 1
fi

zipalign_bin="$(find "$ANDROID_HOME/build-tools" -type f -name zipalign | sort -V | tail -n 1)"
apksigner_bin="$(find "$ANDROID_HOME/build-tools" -type f -name apksigner | sort -V | tail -n 1)"
"$zipalign_bin" -c -P 16 -v 4 "$TARGET_APK"
"$apksigner_bin" verify --verbose --print-certs "$TARGET_APK" \
  | tee dist/apksigner-verification.txt
sha256sum "$TARGET_APK" | tee dist/SHA256SUMS.txt
unzip -Z1 "$TARGET_APK" | sed -n 's#^lib/\([^/]*\)/.*#\1#p' | sort -u \
  | tee dist/ABIS.txt
ls -lh dist
