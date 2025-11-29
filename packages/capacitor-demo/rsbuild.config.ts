import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin'
import moduleFederationConfig from './module-federation.config'

export default defineConfig({
  html: {
    template: './src/index.html', // 这会再生成一份 dist/index.html
  },
  plugins: [pluginReact(), pluginModuleFederation(moduleFederationConfig)],
})
