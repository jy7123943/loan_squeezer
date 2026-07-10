import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';

const navy = '#101a2d';
const charcoal = '#263241';
const slate = '#667085';
const bg = '#f4f6f9';
const gold = '#d8aa3c';
const red = '#d94a42';
const mint = '#11a683';

export const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-width: 320px;
        background: ${bg};
        color: ${charcoal};
        font-family:
          Inter,
          Pretendard,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }
      button,
      input,
      select {
        font: inherit;
      }
    `}
  />
);

export const Shell = styled.div`
  min-height: 100vh;
`;

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px clamp(16px, 4vw, 44px);
  background: rgba(244, 246, 249, 0.92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid #dde3ec;
`;

export const Brand = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const Logo = styled.div`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: ${gold};
  background: ${navy};
  border-radius: 8px;
`;

export const BrandName = styled.div`
  font-weight: 900;
  color: ${navy};
`;

export const BrandSub = styled.div`
  color: ${slate};
  font-size: 13px;
`;

export const Main = styled.main`
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 22px clamp(16px, 4vw, 28px);
  padding-bottom: 142px;
`;

export const Stack = styled.div`
  display: grid;
  gap: 16px;
`;

export const Duo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled.section`
  background: white;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  padding: 18px;
  box-shadow: ${({ emphasis }) =>
    emphasis ? "0 16px 36px rgba(16, 26, 45, 0.10)" : "none"};
`;

export const ActionPanel = styled(Panel)`
  display: grid;
  align-content: start;
  gap: 14px;
`;

export const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  color: ${navy};
  font-size: 18px;
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  > h2 {
    margin-bottom: 0;
  }
`;

export const MiniButton = styled.button`
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid ${gold};
  border-radius: 8px;
  background: #fff7df;
  color: ${navy};
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  white-space: nowrap;
`;

export const BigAddButton = styled.button`
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px solid ${gold};
  border-radius: 8px;
  background: ${navy};
  color: white;
  font-size: clamp(20px, 4vw, 28px);
  font-weight: 950;
  cursor: pointer;
  white-space: nowrap;

  svg {
    color: ${gold};
  }
`;

export const LoanCountLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  background: #f6f8fb;
  color: ${slate};
  font-size: 13px;
  font-weight: 850;
`;

export const LoanTabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 12px;
`;

export const LoanPill = styled.button`
  flex: 0 0 auto;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid ${({ active }) => (active ? gold : "#dce3ee")};
  border-radius: 8px;
  background: ${({ active }) => (active ? navy : "#f7f9fc")};
  color: ${({ active }) => (active ? "white" : charcoal)};
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
`;

export const FieldWrap = styled.label`
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
`;

export const ControlWrap = styled.div`
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
`;

export const Label = styled.span`
  color: ${navy};
  font-size: 13px;
  font-weight: 800;
`;

export const TextInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 13px;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  color: ${navy};
  background: #fbfcfe;
  font-weight: 800;
  outline: none;

  &:focus {
    border-color: ${gold};
    box-shadow: 0 0 0 3px rgba(216, 170, 60, 0.18);
  }
`;

export const InputWithAssist = styled.div`
  display: grid;
  gap: 5px;
`;

export const MoneyAssist = styled.small`
  color: ${slate};
  font-size: 12px;
  font-weight: 500;
`;

export const InlineNumber = styled.div`
  display: grid;
  grid-template-columns: 1fr 44px;
  gap: 8px;
  align-items: center;

  span {
    color: ${navy};
    font-size: 13px;
    font-weight: 900;
  }
`;

export const AssetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

export const AssetList = styled.div`
  display: grid;
  gap: 9px;
`;

export const AssetRow = styled.div`
  display: grid;
  grid-template-columns: minmax(112px, 0.8fr) minmax(150px, 1fr) 36px;
  gap: 8px;
  align-items: start;

  @media (max-width: 520px) {
    grid-template-columns: 1fr 36px;

    > input {
      grid-column: 1 / -1;
    }
  }
`;

export const AssetTotal = styled.div`
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  border-radius: 8px;
  background: #f6f8fb;
  color: ${navy};
  font-size: 13px;
  font-weight: 950;
`;

export const SegmentWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

export const SegmentItem = styled.button`
  height: 44px;
  border: 1px solid ${({ active }) => (active ? gold : "#ccd6e4")};
  border-radius: 8px;
  background: ${({ active }) => (active ? "#fff7df" : "#fbfcfe")};
  color: ${({ active }) => (active ? navy : slate)};
  font-weight: 900;
  cursor: pointer;
`;

export const ToggleLine = styled.button`
  width: 100%;
  min-height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  background: #fbfcfe;
  color: ${navy};
  padding: 0 12px;
  margin-bottom: 10px;
  cursor: pointer;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 850;
  }
`;

export const Switch = styled.div`
  width: 48px;
  height: 26px;
  padding: 3px;
  border-radius: 999px;
  background: ${({ checked }) => (checked ? gold : "#cbd5e1")};

  i {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transform: translateX(${({ checked }) => (checked ? "22px" : "0")});
    transition: 0.18s ease;
  }
`;

export const PrimaryButton = styled.button`
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 8px;
  background: ${navy};
  color: white;
  font-weight: 950;
  cursor: pointer;
`;

export const GhostButton = styled.button`
  min-height: 50px;
  padding: 0 18px;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  background: #fbfcfe;
  color: ${navy};
  font-weight: 950;
  cursor: pointer;
`;

export const GoldButton = styled(PrimaryButton)`
  min-width: 110px;
  width: auto;
  background: ${gold};
  color: ${navy};
`;

export const BigResult = styled.div`
  color: ${navy};
  font-size: clamp(34px, 7vw, 58px);
  font-weight: 950;
  line-height: 1;
`;

export const ResultCopy = styled.p`
  margin: 10px 0 16px;
  color: ${slate};
  font-weight: 700;
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin: 14px 0;
`;

export const MetricCard = styled.div`
  min-height: 74px;
  padding: 12px;
  border-radius: 8px;
  background: #f6f8fb;
  border: 1px solid #e3e8f1;

  span {
    display: block;
    color: ${slate};
    font-size: 12px;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: ${navy};
    font-size: 17px;
    word-break: keep-all;
  }
`;

export const SectionSub = styled.h3`
  margin: 16px 0 9px;
  color: ${navy};
  font-size: 15px;
`;

export const PayItem = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e5eaf2;

  strong,
  b {
    color: ${navy};
  }
  span {
    display: block;
    margin-top: 4px;
    color: ${slate};
    font-size: 12px;
  }
`;

export const BenefitBox = styled.div`
  display: flex;
  gap: 10px;
  margin: 14px 0;
  padding: 13px;
  border: 1px solid rgba(216, 170, 60, 0.42);
  border-radius: 8px;
  background: #fff9e8;
  color: ${navy};

  svg {
    color: ${gold};
    flex: 0 0 auto;
  }
  p {
    margin: 4px 0 0;
    color: ${slate};
    font-size: 13px;
    line-height: 1.45;
  }
`;

export const PolicyGrid = styled.div`
  display: grid;
  gap: 10px;
`;

export const PolicyCard = styled.div`
  border: 1px solid
    ${({ possible }) =>
      possible ? "rgba(17, 166, 131, 0.36)" : "rgba(217, 74, 66, 0.34)"};
  border-radius: 8px;
  padding: 13px;
  background: ${({ possible }) => (possible ? "#f1fbf7" : "#fff5f3")};
`;

export const PolicyTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  strong {
    color: ${navy};
    font-size: 15px;
  }
`;

export const PolicyBadge = styled.span`
  min-width: 46px;
  min-height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${({ possible }) => (possible ? mint : red)};
  color: white;
  font-size: 12px;
  font-weight: 950;
`;

export const ReasonList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  color: ${charcoal};
  font-size: 13px;
  line-height: 1.45;
`;

export const PolicyNote = styled.p`
  margin: 8px 0 0;
  color: ${slate};
  font-size: 13px;
  line-height: 1.45;
`;

export const DisclaimerBox = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e3e8f1;
  background: #f8fafc;
  color: #6b7280;

  strong {
    display: block;
    margin-bottom: 6px;
    color: ${charcoal};
    font-size: 12px;
  }

  p {
    margin: 0;
    font-size: 11px;
    line-height: 1.55;
  }

  p + p {
    margin-top: 6px;
  }
`;

export const LoanCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const LoanCard = styled.article`
  background: white;
  border: 1px solid ${({ selected }) => (selected ? gold : "#dce3ee")};
  border-radius: 8px;
  padding: 16px;
  box-shadow: ${({ selected }) =>
    selected ? "0 12px 28px rgba(216, 170, 60, 0.16)" : "none"};
`;

export const LoanCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;

  strong {
    display: block;
    color: ${navy};
    font-size: 18px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: ${slate};
    font-size: 13px;
    font-weight: 800;
  }
`;

export const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  background: white;
  color: ${navy};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    color: #b5bfcc;
    background: #f6f8fb;
  }
`;

export const DueBadge = styled.div`
  min-width: 58px;
  min-height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${({ urgent }) => (urgent ? "#fff0ec" : "#fff7df")};
  color: ${({ urgent }) => (urgent ? red : navy)};
  border: 1px solid ${({ urgent }) => (urgent ? red : gold)};
  font-weight: 950;
`;

export const Dday = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 92px;
  padding: 18px;
  border-radius: 8px;
  background: ${({ urgent }) => (urgent ? "#fff0ec" : navy)};
  color: ${({ urgent }) => (urgent ? red : "white")};
  border: 2px solid ${({ urgent }) => (urgent ? red : gold)};
  animation: ${({ urgent }) =>
    urgent ? "pulse 1s infinite alternate" : "none"};

  @keyframes pulse {
    from {
      filter: saturate(1);
    }
    to {
      filter: saturate(1.45);
    }
  }

  div {
    display: grid;
    gap: 2px;
  }

  span {
    font-size: 13px;
    font-weight: 900;
  }

  strong {
    font-size: clamp(32px, 8vw, 56px);
    line-height: 1;
  }
`;

export const DdayMeta = styled.div`
  display: grid;
  gap: 4px;
  margin-left: auto;
  color: inherit;
  text-align: left;
  min-width: 118px;

  b,
  span {
    color: inherit;
    font-size: clamp(16px, 3.5vw, 24px);
    line-height: 1.2;
    font-weight: 900;
  }

  span {
    color: ${({ urgent }) => (urgent ? red : "#f4d582")};
  }
`;

export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export const RangeWrap = styled.div`
  display: grid;
  grid-template-columns: 1fr 52px;
  align-items: center;
  gap: 12px;

  input {
    accent-color: ${gold};
  }
  strong {
    color: ${navy};
  }
`;

export const PickerLabel = styled.div`
  margin: 10px 0 7px;
  color: ${navy};
  font-size: 13px;
  font-weight: 800;
`;

export const PickerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export const Select = styled.select`
  height: 48px;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  padding: 0 12px;
  background: #fbfcfe;
  color: ${navy};
  font-weight: 900;
`;

export const Gauge = styled.div`
  margin-bottom: 14px;
`;

export const GaugeTop = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${navy};
  font-weight: 900;
  margin-bottom: 8px;
`;

export const GaugeTrack = styled.div`
  height: 16px;
  border-radius: 999px;
  background: #e3e8f1;
  overflow: hidden;
`;

export const GaugeFill = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${gold}, ${mint});
  transition: width 0.4s ease;
`;

export const InlineAction = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 9px;
`;

export const Confetti = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(16, 26, 45, 0.72);
  color: white;
  font-size: clamp(28px, 7vw, 54px);
  font-weight: 950;
  text-align: center;

  svg {
    flex: 0 0 auto;
  }
`;

export const BannerAd = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 70px;
  z-index: 6;
  height: 48px;
  display: grid;
  place-items: center;
  background: #202b3a;
  color: #f4d582;
  font-weight: 900;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

export const TabBar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px max(12px, env(safe-area-inset-left))
    calc(10px + env(safe-area-inset-bottom))
    max(12px, env(safe-area-inset-right));
  background: white;
  border-top: 1px solid #dce3ee;
`;

export const TabButton = styled.button`
  min-height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  border: 1px solid ${({ active }) => (active ? gold : "#dce3ee")};
  border-radius: 8px;
  background: ${({ active }) => (active ? navy : "#f7f9fc")};
  color: ${({ active }) => (active ? "white" : charcoal)};
  font-weight: 950;
  cursor: pointer;
`;

export const OnboardingWrap = styled.main`
  min-height: 100vh;
  display: grid;
  align-content: center;
  gap: 18px;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 28px clamp(16px, 5vw, 40px);
`;

export const HeroTitle = styled.h1`
  margin: 0;
  color: ${navy};
  font-size: clamp(34px, 7vw, 68px);
  line-height: 1;
  word-break: keep-all;
`;

export const HeroCopy = styled.p`
  margin: 0 0 8px;
  width: min(620px, 100%);
  color: ${slate};
  font-size: 17px;
  font-weight: 750;
  line-height: 1.55;
  word-break: keep-all;
`;

export const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const ChoiceCard = styled.button`
  position: relative;
  display: grid;
  justify-items: start;
  gap: 12px;
  min-height: 238px;
  padding: 24px;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  background: white;
  color: ${navy};
  text-align: left;
  cursor: pointer;
  word-break: keep-all;

  h2 {
    margin: 0;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: ${slate};
    font-weight: 750;
    line-height: 1.5;
  }

  > svg {
    position: absolute;
    right: 20px;
    bottom: 20px;
    color: ${gold};
  }
`;

export const IconOrb = styled.div`
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${navy};
  color: ${gold};
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(16, 26, 45, 0.62);
`;

export const AdModal = styled.div`
  width: min(380px, 100%);
  padding: 22px;
  border-radius: 8px;
  background: white;
  color: ${navy};

  h2 {
    margin: 12px 0 8px;
  }
  p {
    color: ${slate};
    line-height: 1.5;
  }
`;

export const EditorModal = styled.div`
  width: min(560px, 100%);
  max-height: min(760px, calc(100vh - 36px));
  overflow-y: auto;
  padding: 22px;
  border-radius: 8px;
  background: white;
  color: ${navy};
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;

  h2 {
    margin: 10px 0 0;
    color: ${navy};
    font-size: 24px;
  }
`;

export const ModalFooter = styled.div`
  position: sticky;
  bottom: -22px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  margin: 18px -22px -22px;
  padding: 14px 22px 22px;
  background: white;
  border-top: 1px solid #e3e8f1;
`;

export const Badge = styled.span`
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 8px;
  background: #fff4d4;
  color: ${navy};
  font-weight: 900;
`;
