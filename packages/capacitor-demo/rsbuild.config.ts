import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin'
import moduleFederationConfig from './module-federation.config'

const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

export default defineConfig({
  source: {
    define: publicVars,
  },
  html: {
    template: './src/index.html', // 这会再生成一份 dist/index.html
  },
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
})
