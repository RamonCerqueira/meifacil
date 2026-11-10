import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.com.meifacil.app',
  appName: 'MEI Fácil',
  // O app nativo usa a versão publicada do Next.js, preservando APIs e SSR.
  // Defina a URL do ambiente de produção no CI antes de sincronizar as lojas.
  webDir: 'public',
  server: { url: process.env.CAPACITOR_SERVER_URL || 'https://app.meifacil.com.br', androidScheme: 'https' },
}

export default config
