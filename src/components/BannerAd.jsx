import { useEffect, useRef, useState } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';
import * as S from '../styles';
import { initBannerAds, isBannerInitialized } from '../lib/ad';

// 개발 중에는 공식 테스트 광고 ID를 써야 한다. 실제 광고 ID로 테스트하면 정책 위반이다.
const BANNER_AD_GROUP_ID = 'ait-ad-test-banner-id';

export function BannerAd() {
  const containerRef = useRef(null);
  // 광고를 못 띄우는 환경(구버전 토스앱·일반 브라우저)이나 노출할 광고가 없을 때
  // 빈 슬롯이 남으면 안 되므로 컨테이너 자체를 렌더하지 않는다.
  const [visible, setVisible] = useState(() => TossAds.attachBanner?.isSupported?.() ?? false);

  useEffect(() => {
    if (!visible) return;

    let attached;

    initBannerAds().then(() => {
      if (!isBannerInitialized() || !containerRef.current) {
        setVisible(false);
        return;
      }

      attached = TossAds.attachBanner(BANNER_AD_GROUP_ID, containerRef.current, {
        theme: 'auto',
        tone: 'blackAndWhite',
        variant: 'expanded',
        callbacks: {
          onAdFailedToRender: (payload) => {
            console.error('[배너 광고] 렌더링 실패:', payload.error.message);
            setVisible(false);
          },
          onNoFill: () => {
            console.warn('[배너 광고] 표시할 광고 없음');
            setVisible(false);
          },
        },
      });
    });

    return () => {
      attached?.destroy();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <S.BannerAd>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </S.BannerAd>
  );
}
