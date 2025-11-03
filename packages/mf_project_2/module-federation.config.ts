import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin'
/**
 * provider
 */
export default createModuleFederationConfig({
  name: 'mf_project_2',
  exposes: {
    '.': './src/components/ProviderComponent.tsx',
    './Dashboard': './src/components/Dashboard.tsx',
    './CircularDemo': './src/components/CircularDemo.tsx',
  },
  remotes: {
    provider:
      process.env.NODE_ENV === 'development'
        ? 'rslib_provider@http://localhost:3002/mf-manifest.json'
        : 'rslib_provider@https://mf3-6sa.pages.dev/mf-manifest.json',
  },
  shareStrategy: 'loaded-first',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
