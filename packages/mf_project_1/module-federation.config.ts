import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin'

export default createModuleFederationConfig({
  name: 'mf_project_1',
  shareStrategy: 'loaded-first',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
})
