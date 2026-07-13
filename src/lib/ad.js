import { loadFullScreenAd, showFullScreenAd, TossAds } from '@apps-in-toss/web-framework';

// TODO: 콘솔에서 광고 그룹 생성 후 실제 ID 입력
const INTERSTITIAL_AD_GROUP_ID = 'ait-ad-test-interstitial-id';

let isInterstitialAdLoaded = false;
let interstitialCleanup = null;

// ── 전면형 광고 ──

export function preloadInterstitialAd() {
  if (isInterstitialAdLoaded) return;
  if (!loadFullScreenAd.isSupported()) return;

  interstitialCleanup = loadFullScreenAd({
    options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
    onEvent: (event) => {
      if (event.type === 'loaded') {
        isInterstitialAdLoaded = true;
      }
    },
    onError: (error) => {
      console.error('[전면 광고] 로드 실패:', error);
      isInterstitialAdLoaded = false;
    },
  });
}

export function showInterstitialAd() {
  if (!isInterstitialAdLoaded || !showFullScreenAd.isSupported()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    showFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'dismissed' || event.type === 'failedToShow') {
          isInterstitialAdLoaded = false;
          preloadInterstitialAd();
          resolve();
        }
      },
      onError: (error) => {
        console.error('[전면 광고] 표시 실패:', error);
        resolve();
      },
    });
  });
}

export function isInterstitialAdReady() {
  return isInterstitialAdLoaded;
}

// ── 배너 광고 SDK 초기화 ──

let bannerInitialized = false;
let bannerInitPromise = null;

export function initBannerAds() {
  if (bannerInitialized) return Promise.resolve();
  if (bannerInitPromise) return bannerInitPromise;
  if (!TossAds.initialize.isSupported()) return Promise.resolve();

  bannerInitPromise = new Promise((resolve) => {
    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          bannerInitialized = true;
          resolve();
        },
        onInitializationFailed: (error) => {
          console.error('[배너 광고] SDK 초기화 실패:', error);
          resolve();
        },
      },
    });
  });

  return bannerInitPromise;
}

export function isBannerInitialized() {
  return bannerInitialized;
}

// ── 정리 ──

export function cleanupAllAds() {
  interstitialCleanup?.();
  interstitialCleanup = null;
  isInterstitialAdLoaded = false;

  if (TossAds.destroyAll.isSupported()) {
    TossAds.destroyAll();
  }
}
