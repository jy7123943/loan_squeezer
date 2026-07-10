import * as S from '../styles';

export function Interstitial({ onClose }) {
  return (
    <S.Overlay onClick={onClose}>
      <S.AdModal onClick={(e) => e.stopPropagation()}>
        <S.Badge>전면 광고</S.Badge>
        <h2>내 돈 지키는 체크포인트</h2>
        <p>계산 결과와 모드 전환 시 노출되는 수익화 영역입니다.</p>
        <S.PrimaryButton onClick={onClose}>계속하기</S.PrimaryButton>
      </S.AdModal>
    </S.Overlay>
  );
}
