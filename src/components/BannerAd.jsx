import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import * as S from '../styles';
import { initBannerAds, isBannerInitialized } from '../lib/ad';

// TODO: 콘솔에서 배너 광고 그룹 생성 후 실제 ID 입력
const BANNER_AD_GROUP_ID = 'ait-ad-test-banner-id';

export function BannerAd() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!TossAds.attachBanner?.isSupported?.()) return;

    let attached;

    initBannerAds().then(() => {
      if (!isBannerInitialized() || !containerRef.current) return;

      attached = TossAds.attachBanner(BANNER_AD_GROUP_ID, containerRef.current, {
        theme: 'auto',
        tone: 'blackAndWhite',
        variant: 'expanded',
        callbacks: {
          onAdFailedToRender: (payload) => {
            console.error('[배너 광고] 렌더링 실패:', payload.error.message);
          },
          onNoFill: () => {
            console.warn('[배너 광고] 표시할 광고 없음');
          },
        },
      });
    });

    return () => {
      attached?.destroy();
    };
  }, []);

  return (
    <S.BannerAd>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </S.BannerAd>
  );
}