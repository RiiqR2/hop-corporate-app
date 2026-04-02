module.exports = function (config) {
  return {
    ...config,
    plugins: ['sentry-expo'],
  };
};
