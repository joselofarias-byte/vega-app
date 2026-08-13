const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withMainApplication,
  withAppBuildGradle,
} = require('@expo/config-plugins');

function withCustomNativeModules(config) {
  // 1. Copy the files over
  config = withDangerousMod(config, [
    'android',
    async cfg => {
      const projectRoot = cfg.modRequest.projectRoot;
      const packageName = cfg.android?.package || 'com.vega';
      const packagePath = packageName.replace(/\./g, '/');
      const targetDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        packagePath,
      );

      fs.mkdirSync(targetDir, {recursive: true});

      // Copy from native-src/android/com/vega
      const sourceDir = path.join(
        projectRoot,
        'native-src',
        'android',
        'com',
        'vega',
      );

      if (fs.existsSync(sourceDir)) {
        const files = fs.readdirSync(sourceDir);
        for (const file of files) {
          if (file.endsWith('.kt')) {
            const sourceFile = path.join(sourceDir, file);
            const targetFile = path.join(targetDir, file);

            let content = fs.readFileSync(sourceFile, 'utf8');
            content = content.replace(
              /^package com\.vega$/m,
              `package ${packageName}`,
            );

            fs.writeFileSync(targetFile, content, 'utf8');
          }
        }
      }

      return cfg;
    },
  ]);

  // 2. Add packages and DoH factory registration to MainApplication.kt
  config = withMainApplication(config, cfg => {
    let currentContents = cfg.modResults.contents;

    const packagesToAdd = [
      'DohPackage()',
      'HttpDownloadPackage()',
      'TorrentPackage()',
      'LauncherIconPackage()',
    ];

    for (const pkg of packagesToAdd) {
      if (!currentContents.includes(`add(${pkg})`)) {
        currentContents = currentContents.replace(
          /PackageList\(this\)\.packages\.apply \{\n/,
          match => `${match}              add(${pkg})\n`,
        );
      }
    }

    // Register DohOkHttpFactory with OkHttpClientProvider in onCreate
    if (!currentContents.includes('setOkHttpClientFactory')) {
      if (
        !currentContents.includes(
          'import com.facebook.react.modules.network.OkHttpClientProvider',
        )
      ) {
        currentContents = currentContents.replace(
          /^(package .+\n)/m,
          match =>
            `${match}\nimport com.facebook.react.modules.network.OkHttpClientProvider\n`,
        );
      }

      currentContents = currentContents.replace(
        /loadReactNative\(this\)\n/,
        match =>
          `${match}    OkHttpClientProvider.setOkHttpClientFactory(DohOkHttpFactory(cacheDir))\n`,
      );
    }

    cfg.modResults.contents = currentContents;
    return cfg;
  });

  // 3. Add necessary dependencies to app/build.gradle
  config = withAppBuildGradle(config, cfg => {
    let contents = cfg.modResults.contents;

    if (!contents.includes('okhttp-dnsoverhttps')) {
      contents = contents.replace(
        /dependencies\s*\{/,
        match =>
          `${match}\n    implementation 'com.squareup.okhttp3:okhttp-dnsoverhttps:4.12.0'\n`,
      );
    }

    if (!contents.includes('com.squareup.okhttp3:okhttp:4.12.0')) {
      contents = contents.replace(
        /dependencies\s*\{/,
        match => `${match}\n    implementation 'com.squareup.okhttp3:okhttp:4.12.0'\n`,
      );
    }

    // Make sure libtorrent4j and nanohttpd are re-added just in case the user's manual addition gets wiped
    if (!contents.includes('libtorrent4j:2.1.0-39')) {
      contents = contents.replace(
        /dependencies\s*\{/,
        match =>
          `${match}\n    implementation 'org.nanohttpd:nanohttpd:2.3.1'\n    implementation 'org.libtorrent4j:libtorrent4j:2.1.0-39'\n    implementation 'org.libtorrent4j:libtorrent4j-android-arm64:2.1.0-39'\n    implementation 'org.libtorrent4j:libtorrent4j-android-x86_64:2.1.0-39'\n`,
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
}

module.exports = withCustomNativeModules;
