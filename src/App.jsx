import { useEffect, useState } from 'react';
import { CreditCard, Home, Landmark } from 'lucide-react';
import { STORAGE_KEYS } from './constants';
import { load, save } from './utils';
import * as S from './styles';
import { BuyerTab } from './components/BuyerTab';
import { BannerAd } from './components/BannerAd';
import { LoanTab } from './components/LoanTab';
import { Onboarding } from './components/Onboarding';
import { preloadInterstitialAd, showInterstitialAd } from './lib/ad';

function tabFromPath(pathname) {
  return pathname.startsWith('/loans') ? 'loan' : 'buy';
}

function pathForTab(tab) {
  return tab === 'loan' ? '/loans' : '/buy';
}

export function App() {
  const [homeTab, setHomeTab] = useState(() => load(STORAGE_KEYS.homeTab, 'buy'));
  const [onboarded, setOnboarded] = useState(() => load(STORAGE_KEYS.onboarded, false));
  const [activeTab, setActiveTab] = useState(() => (window.location.pathname === '/' ? load(STORAGE_KEYS.homeTab, 'buy') : tabFromPath(window.location.pathname)));

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    preloadInterstitialAd();
  }, []);

  useEffect(() => {
    const onPopState = () => setActiveTab(tabFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (onboarded && window.location.pathname === '/') {
      window.history.replaceState(null, '', pathForTab(activeTab));
    }
  }, [activeTab, onboarded]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  const replaceTab = (tab) => {
    window.history.replaceState(null, '', pathForTab(tab));
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeOnboarding = (tab) => {
    save(STORAGE_KEYS.onboarded, true);
    save(STORAGE_KEYS.homeTab, tab);
    setOnboarded(true);
    setHomeTab(tab);
    replaceTab(tab);
  };

  const switchTab = (tab) => {
    replaceTab(tab);
  };

  return (
    <>
      <S.GlobalStyles />
      <S.Shell>
        {!onboarded ? (
          <Onboarding onSelect={completeOnboarding} />
        ) : (
          <>
            <S.Header>
              <S.Brand>
                <S.Logo><Landmark size={22} /></S.Logo>
                <div>
                  <S.BrandName>부동산 영끌메이커</S.BrandName>
                  <S.BrandSub>내 소득 맞춤 계산부터 철저한 빚 관리까지</S.BrandSub>
                </div>
              </S.Brand>
            </S.Header>

            <S.Main>
              {activeTab === 'buy' ? (
                <BuyerTab onAd={() => showInterstitialAd()} />
              ) : (
                <LoanTab onAd={() => showInterstitialAd()} />
              )}
            </S.Main>

            <BannerAd />
            <S.TabBar>
              <S.TabButton active={activeTab === 'buy'} onClick={() => switchTab('buy')}>
                <Home size={20} /> 너도 살 수 있어
              </S.TabButton>
              <S.TabButton active={activeTab === 'loan'} onClick={() => switchTab('loan')}>
                <CreditCard size={20} /> 내 대출금 비서
              </S.TabButton>
            </S.TabBar>
          </>
        )}
      </S.Shell>
    </>
  );
}
