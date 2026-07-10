import { ChevronRight, Home, WalletCards } from 'lucide-react';
import * as S from '../styles';

export function Onboarding({ onSelect }) {
  return (
    <S.OnboardingWrap>
      <S.HeroTitle>부동산, 너도 살 수 있어!</S.HeroTitle>
      <S.HeroCopy>
        사기 전에는 현실적인 한도를,
        <br />
        사고 난 후에는 연체 없는 상환 루틴을 잡아드려요.
      </S.HeroCopy>
      <S.ChoiceGrid>
        <S.ChoiceCard onClick={() => onSelect("buy")}>
          <S.IconOrb>
            <Home size={34} />
          </S.IconOrb>
          <h2>나에게 맞는 집 찾기</h2>
          <p>내 진짜 자산으로 가능한 매수 금액과 부대비용을 먼저 확인해요.</p>
          <ChevronRight />
        </S.ChoiceCard>
        <S.ChoiceCard onClick={() => onSelect("loan")}>
          <S.IconOrb>
            <WalletCards size={34} />
          </S.IconOrb>
          <h2>받은 대출 관리하기</h2>
          <p>D-Day 알림과 상환 게이지로 빚이 줄어드는 감각을 만들어요.</p>
          <ChevronRight />
        </S.ChoiceCard>
      </S.ChoiceGrid>
    </S.OnboardingWrap>
  );
}
