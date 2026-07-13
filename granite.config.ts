import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'budongsanmaker',
  brand: {
    displayName: '부동산 영끌메이커',
    primaryColor: '#101a2d',
    // 앱로고 원본: public/logo-light.png (일반) / public/logo-dark.png (다크) — 600x600
    icon: 'https://static.toss.im/appsintoss/43219/7c6a50bb-d677-484d-9ac3-7baa2c0874de.png',
  },
  web: {
    host: '127.0.0.1',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  webViewProps: {
    bounces: false,
    pullToRefreshEnabled: false,
    allowsBackForwardNavigationGestures: false,
    overScrollMode: 'never',
    mediaPlaybackRequiresUserAction: false,
  },
});