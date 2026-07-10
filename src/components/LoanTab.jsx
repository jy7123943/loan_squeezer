import { useMemo, useState } from 'react';
import { Banknote, BellRing, CircleDollarSign, HandCoins, Landmark, Pencil, Plus, Trophy, X } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';
import { createLoan, normalizeLoans, portfolioReport } from '../domain/loans';
import { clamp, eok, save, shortKoreanDate, won } from '../utils';
import * as S from '../styles';
import { Field, Metric, MoneyInput, PayRow, Segment } from './FormControls';

function ddayLabel(dday) {
  return `D-${Number.isFinite(dday) ? dday : 0}`;
}

export function LoanTab({ onAd }) {
  const [loans, setLoans] = useState(() => normalizeLoans());
  const [editingLoan, setEditingLoan] = useState(null);
  const [prepayValues, setPrepayValues] = useState({});
  const portfolio = useMemo(() => portfolioReport(loans), [loans]);
  const hasLoans = loans.length > 0;

  const persistLoans = (next) => {
    setLoans(next);
    save(STORAGE_KEYS.loans, next);
  };

  const addLoan = () => {
    setEditingLoan(createLoan());
  };

  const saveLoan = (loan) => {
    const exists = loans.some((item) => item.id === loan.id);
    const next = exists
      ? loans.map((item) => (item.id === loan.id ? loan : item))
      : [loan, ...loans];
    persistLoans(next);
    setEditingLoan(null);
    onAd?.();
  };

  const addPrepayment = (loanId) => {
    const amount = clamp(prepayValues[loanId] || 1000000, 0, 1000000000);
    if (!amount) return;
    const item = { id: Date.now(), amount };
    const next = loans.map((loan) =>
      loan.id === loanId
        ? { ...loan, prepayments: [item, ...(loan.prepayments || [])] }
        : loan,
    );
    persistLoans(next);
    setPrepayValues({ ...prepayValues, [loanId]: 1000000 });
  };

  return (
    <S.Stack>
      <S.Dday urgent={(portfolio.nearest?.report.dday || 99) <= 3}>
        <S.DdayHeader>
          <BellRing size={22} />
          <span>{hasLoans ? "가장 가까운 대출금 출금까지" : "등록된 대출이 없습니다"}</span>
        </S.DdayHeader>
        <S.DdayBody>
          <strong>{hasLoans ? ddayLabel(portfolio.nearest?.report.dday) : "D-Day"}</strong>
          <S.DdayMeta>
            {hasLoans
              ? `${portfolio.nearest?.loan.name} · ${shortKoreanDate(portfolio.nearest?.report.nextPay)}`
              : "대출을 추가하면 출금 D-Day를 보여드려요"}
          </S.DdayMeta>
        </S.DdayBody>
      </S.Dday>

      <S.Duo>
        <S.ActionPanel>
          <S.PanelTitle>
            <Landmark size={20} /> 내 대출 포트폴리오
          </S.PanelTitle>
          <S.BigAddButton onClick={addLoan}>
            <Plus size={24} />
            대출 추가하기
          </S.BigAddButton>
          <S.LoanCountLine>
            <Banknote size={17} /> 지금 {loans.length}개의 대출을 관리 중
          </S.LoanCountLine>
        </S.ActionPanel>

        <S.Panel emphasis>
          <S.PanelTitle>
            <CircleDollarSign size={20} /> 전체 상환 대시보드
          </S.PanelTitle>
          <S.Gauge>
            <S.GaugeTop>
              <span>전체 대출 중 남은 원금</span>
              <strong>{eok(portfolio.totalRemaining)}</strong>
            </S.GaugeTop>
            <S.GaugeTrack>
              <S.GaugeFill
                style={{
                  width: `${portfolio.totalPrincipal ? 100 - (portfolio.totalRemaining / portfolio.totalPrincipal) * 100 : 0}%`,
                }}
              />
            </S.GaugeTrack>
          </S.Gauge>
          <S.MetricGrid>
            <Metric label="등록 대출" value={`${loans.length}개`} />
            <Metric
              label="이번 달 총 출금"
              value={won(portfolio.totalMonthly)}
            />
            <Metric
              label="누적 중도상환"
              value={won(portfolio.totalPrepaid)}
              wide
            />
          </S.MetricGrid>
        </S.Panel>
      </S.Duo>

      {hasLoans ? (
        <S.LoanCardGrid>
          {portfolio.reports.map(({ loan, report }) => (
          <S.LoanCard key={loan.id}>
            <S.LoanCardTop>
              <div>
                <strong>{loan.name}</strong>
                <span>
                  {loan.type === "mortgage" ? "주택담보대출" : "신용대출"} ·{" "}
                  {loan.rate}%
                </span>
              </div>
              <S.CardActions>
                <S.IconButton
                  title="대출 수정"
                  onClick={() =>
                    setEditingLoan({
                      ...loan,
                      prepayments: loan.prepayments || [],
                    })
                  }
                >
                  <Pencil size={17} />
                </S.IconButton>
                <S.DueBadge urgent={report.dday <= 3}>
                  {ddayLabel(report.dday)}
                </S.DueBadge>
              </S.CardActions>
            </S.LoanCardTop>
            <PayRow
              title={`${loan.payDay}일 출금`}
              desc={`${report.nextPay.toLocaleDateString("ko-KR")} 예정`}
              amount={won(report.baseMonthly)}
            />
            <S.MetricGrid>
              <Metric
                label="남은 원금"
                value={won(report.remainingPrincipal)}
              />
              <Metric
                label="만기일"
                value={`${loan.maturityYear}.${String(loan.maturityMonth).padStart(2, "0")}`}
              />
              <Metric
                label="상환 회차"
                value={`${report.elapsed} / ${report.totalMonths}`}
              />
              <Metric
                label="진행률"
                value={`${Math.round(report.progress)}%`}
              />
            </S.MetricGrid>
            <S.GaugeTrack>
              <S.GaugeFill style={{ width: `${report.progress}%` }} />
            </S.GaugeTrack>
            <S.SectionSub>이 대출 중도상환</S.SectionSub>
            <S.InlineAction>
              <MoneyInput
                value={prepayValues[loan.id] || 1000000}
                onChange={(amount) =>
                  setPrepayValues({ ...prepayValues, [loan.id]: amount })
                }
              />
              <S.GoldButton onClick={() => addPrepayment(loan.id)}>
                <HandCoins size={18} /> 입력
              </S.GoldButton>
            </S.InlineAction>
            <S.BenefitBox>
              <Trophy size={18} />
              <div>
                <strong>원금 감소</strong>
                <p>
                  누적 중도상환 {won(report.prepaymentTotal)} · 예상 이자 절감{" "}
                  {won(report.savedByPrepay)}
                </p>
              </div>
            </S.BenefitBox>
          </S.LoanCard>
          ))}
        </S.LoanCardGrid>
      ) : (
        <S.EmptyState>
          <Landmark size={22} />
          <strong>아직 등록된 대출이 없어요</strong>
          <p>대출 추가하기를 눌러 첫 대출의 원금, 금리, 출금일을 입력해 주세요.</p>
        </S.EmptyState>
      )}

      {editingLoan && (
        <LoanEditorModal
          loan={editingLoan}
          onChange={setEditingLoan}
          onClose={() => setEditingLoan(null)}
          onSave={saveLoan}
        />
      )}
    </S.Stack>
  );
}

function LoanEditorModal({ loan, onChange, onClose, onSave }) {
  const update = (patch) => onChange({ ...loan, ...patch });

  return (
    <S.Overlay onClick={onClose}>
      <S.EditorModal onClick={(e) => e.stopPropagation()}>
        <S.ModalHeader>
          <div>
            <S.Badge>대출 입력</S.Badge>
            <h2>{loan.name || "새 대출"}</h2>
          </div>
          <S.IconButton title="닫기" onClick={onClose}>
            <X size={18} />
          </S.IconButton>
        </S.ModalHeader>

        <Field label="대출 이름">
          <S.TextInput
            value={loan.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>
        <Field label="총 대출 원금">
          <MoneyInput
            value={loan.principal}
            onChange={(principal) => update({ principal })}
          />
        </Field>
        <S.TwoCols>
          <Field label="대출 금리">
            <S.TextInput
              type="number"
              value={loan.rate}
              step="0.1"
              onChange={(e) => update({ rate: Number(e.target.value) })}
            />
          </Field>
          <Field label="매달 출금일">
            <S.TextInput
              type="number"
              min="1"
              max="28"
              value={loan.payDay}
              onChange={(e) => update({ payDay: clamp(e.target.value, 1, 28) })}
            />
          </Field>
        </S.TwoCols>
        <Segment
          label="대출 유형"
          value={loan.type}
          onChange={(type) => update({ type })}
          options={[
            ["mortgage", "주담대"],
            ["credit", "신용대출"],
          ]}
        />
        <Segment
          label="상환 방식"
          value={loan.method}
          onChange={(method) => update({ method })}
          options={[
            ["equalPayment", "원리금"],
            ["equalPrincipal", "원금균등"],
            ["bullet", "만기일시"],
          ]}
        />
        <S.PickerLabel>대출 시작 연/월</S.PickerLabel>
        <S.PickerGrid>
          <YearSelect
            value={loan.startYear}
            onChange={(startYear) => update({ startYear })}
          />
          <MonthSelect
            value={loan.startMonth}
            onChange={(startMonth) => update({ startMonth })}
          />
        </S.PickerGrid>
        <S.PickerLabel>대출 만기 연/월</S.PickerLabel>
        <S.PickerGrid>
          <YearSelect
            value={loan.maturityYear}
            future
            onChange={(maturityYear) => update({ maturityYear })}
          />
          <MonthSelect
            value={loan.maturityMonth}
            onChange={(maturityMonth) => update({ maturityMonth })}
          />
        </S.PickerGrid>

        <S.ModalFooter>
          <S.GhostButton onClick={onClose}>취소</S.GhostButton>
          <S.PrimaryButton
            onClick={() =>
              onSave({ ...loan, name: loan.name.trim() || "이름 없는 대출" })
            }
          >
            저장하기
          </S.PrimaryButton>
        </S.ModalFooter>
      </S.EditorModal>
    </S.Overlay>
  );
}

function YearSelect({ value, onChange, future = false }) {
  const base = new Date().getFullYear();
  const years = Array.from({ length: future ? 35 : 12 }, (_, idx) =>
    future ? base + idx : base - idx,
  );
  return (
    <S.Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}년
        </option>
      ))}
    </S.Select>
  );
}

function MonthSelect({ value, onChange }) {
  return (
    <S.Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
        <option key={month} value={month}>
          {month}월
        </option>
      ))}
    </S.Select>
  );
}
