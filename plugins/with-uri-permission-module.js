const fs = require('fs');
const path = require('path');
const {withDangerousMod, withMainApplication} = require('expo/config-plugins');

const URI_PERMISSION_MODULE_SOURCE = packageName => `package ${packageName}

import android.content.Intent
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.ReactPackage
import com.facebook.react.uimanager.ViewManager
import android.net.Uri

class UriPermissionModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "UriPermissionModule"

  @ReactMethod
  fun takePersistableUriPermission(uriString: String, promise: Promise) {
    try {
      val uri = Uri.parse(uriString)
      val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
      reactContext.contentResolver.takePersistableUriPermission(uri, flags)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("TAKE_PERSISTABLE_URI_PERMISSION_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun releasePersistableUriPermission(uriString: String, promise: Promise) {
    try {
      val uri = Uri.parse(uriString)
      val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION
      reactContext.contentResolver.releasePersistableUriPermission(uri, flags)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun getPersistedUriPermissions(promise: Promise) {
    try {
      val uris = reactContext.contentResolver.persistedUriPermissions.map { it.uri.toString() }
      promise.resolve(com.facebook.react.bridge.Arguments.fromList(uris))
    } catch (error: Exception) {
      promise.reject("GET_PERSISTED_URI_PERMISSIONS_FAILED", error.message, error)
    }
  }
}

class UriPermissionPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(UriPermissionModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;

function withUriPermissionModule(config) {
  config = withDangerousMod(config, [
    'android',
    async cfg => {
      const projectRoot = cfg.modRequest.projectRoot;
      const packageName = cfg.android?.package || 'com.vega';
      const packagePath = packageName.replace(/\./g, '/');
      const targetFile = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        packagePath,
        'UriPermissionModule.kt',
      );

      fs.mkdirSync(path.dirname(targetFile), {recursive: true});
      fs.writeFileSync(targetFile, URI_PERMISSION_MODULE_SOURCE(packageName), 'utf8');
      return cfg;
    },
  ]);

  return withMainApplication(config, cfg => {
    const currentContents = cfg.modResults.contents;
    if (!currentContents.includes('add(UriPermissionPackage())')) {
      cfg.modResults.contents = currentContents.replace(
        /PackageList\(this\)\.packages\.apply \{\n/,
        match => `${match}              add(UriPermissionPackage())\n`,
      );
    }
    return cfg;
  });
}

module.exports = withUriPermissionModule;
