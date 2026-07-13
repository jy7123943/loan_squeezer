import { loadFullScreenAd, showFullScreenAd, TossAds } from '@apps-in-toss/web-framework';
import { STORAGE_KEYS } from '../constants';
import { load, save } from '../utils';

// 개발 중에는 공식 테스트 광고 ID를 써야 한다. 실제 광고 ID로 테스트하면 정책 위반이다.
// 출시 직전에만 콘솔에서 발급받은 실제 광고 그룹 ID로 교체한다.
const INTERSTITIAL_AD_GROUP_ID = 'ait-ad-test-interstitial-id';

// 최초 1회는 무조건 노출하고, 이후에는 이 횟수마다 한 번씩만 노출한다.
// 매 계산마다 전면 광고를 띄우면 토스 광고 정책(Value First)에 걸린다.
const INTERSTITIAL_INTERVAL = 3;

let isInterstitialAdLoaded = false;
let interstitialCleanup = null;

// ── 전면형 광고 ──

export function preloadInterstitialAd() {
  if (isInterstitialAdLoaded) return;
  if (!loadFullScreenAd.isSupported()) return;

  // 이전 로드의 콜백 등록을 먼저 해제해야 등록이 쌓이지 않는다.
  interstitialCleanup?.();

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

// ── 전면형 광고 노출 빈도 제어 ──

function shouldShowInterstitial() {
  if (!load(STORAGE_KEYS.adShownOnce, false)) {
    save(STORAGE_KEYS.adShownOnce, true);
    save(STORAGE_KEYS.adTriggerCount, 0);
    return true;
  }

  const count = load(STORAGE_KEYS.adTriggerCount, 0) + 1;
  if (count >= INTERSTITIAL_INTERVAL) {
    save(STORAGE_KEYS.adTriggerCount, 0);
    return true;
  }

  save(STORAGE_KEYS.adTriggerCount, count);
  return false;
}

/**
 * 광고가 준비된 경우에만 빈도를 소모한다.
 * 광고를 띄울 수 없는 환경에서 "최초 1회"를 헛되이 써버리지 않도록 하기 위함이다.
 */
export function maybeShowInterstitialAd() {
  if (!isInterstitialAdReady()) return Promise.resolve();
  if (!shouldShowInterstitial()) return Promise.resolve();
  return showInterstitialAd();
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
