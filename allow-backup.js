const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Este plugin soluciona el conflicto de Manifest relacionado con `android:allowBackup`,
 * que ocurre al integrar el SDK de MetaMap en proyectos Expo Managed.
 *
 * Añade `tools:replace="android:allowBackup"` al <application> para evitar errores de merge.
 */
const withMetaMapAllowBackupFix = (config) => {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    if (!application['$']) application['$'] = {};

    application['$']['tools:replace'] = 'android:allowBackup';

    return config;
  });
};

module.exports = withMetaMapAllowBackupFix;
