module.exports = {
  ci: {
    collect: {
      staticDistDir: './frontend/dist',
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'color-contrast': 'off',
        'errors-in-console': 'off',
        'network-dependency-tree-insight': 'off',
        'unused-javascript': 'off',
        'uses-rel-preconnect': 'off',
      },
    },
  },
};