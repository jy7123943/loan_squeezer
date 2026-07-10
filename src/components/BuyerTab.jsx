import { useState } from 'react';
import { Baby, BadgePercent, Calculator, Gem, PiggyBank, Sparkles, X } from 'lucide-react';
import { initialBuyer, STORAGE_KEYS } from '../constants';
import { buyerReport, isRecentBirth, normalizeBuyerForm, totalAssets } from '../domain/buyer';
import { eok, load, readableMoney, save, won } from '../utils';
import * as S from '../styles';
import { Field, Metric, MoneyInput, NumberInput, PayRow, Segment, ToggleRow } from './FormControls';

export function BuyerTab({ onAd }) {
  const [form, setForm] = useState(() =>
    normalizeBuyerForm(load(STORAGE_KEYS.buyer, initialBuyer)),
  );
  const [report, setReport] = useState(null);
  const [showBenefits, setShowBenefits] = useState(false);

  const update = (patch) => {
    const next = normalizeBuyerForm({ ...form, ...patch });
    setForm(next);
    save(STORAGE_KEYS.buyer, next);
  };

  const updateAsset = (id, patch) => {
    update({
      assets: form.assets.map((asset) =>
        asset.id === id ? { ...asset, ...patch } : asset,
      ),
    });
  };

  const addAsset = () => {
    update({
      assets: [
        ...form.assets,
        { id: `asset-${Date.now()}`, name: "", amount: 0 },
      ],
    });
  };

  const removeAsset = (id) => {
    if (form.assets.length <= 1) return;
    update({ assets: form.assets.filter((asset) => asset.id !== id) });
  };

  const calculate = () => {
    const next = buyerReport(form);
    setReport(next);
    setShowBenefits(true);
    onAd();
  };

  const areaPyeongType =
    Math.round((Number(form.areaM2 || 0) / 0.7 / 3.3058) * 10) / 10;

  return (
    <S.Stack>
      <S.Duo>
        <S.Panel>
          <S.PanelTitle>
            <Calculator size={20} /> 매수 가능 금액 계산기
          </S.PanelTitle>
          <Field label="연소득(세전)">
            <MoneyInput
              value={form.annualIncome}
              onChange={(value) => update({ annualIncome: value })}
            />
          </Field>
          <Segment
            label="결혼 유무"
            value={form.married}
            onChange={(married) => update({ married })}
            options={[
              ["single", "미혼"],
              ["married", "기혼"],
            ]}
          />
          {form.married === "married" && (
            <>
              <Field label="배우자 연소득(세전)">
                <MoneyInput
                  value={form.spouseAnnualIncome || 0}
                  onChange={(value) => update({ spouseAnnualIncome: value })}
                />
              </Field>
              <Field label="혼인 기간">
                <NumberInput
                  value={form.marriageYears}
                  min="0"
                  onChange={(value) => update({ marriageYears: value })}
                  suffix="년"
                />
              </Field>
            </>
          )}
          <S.ControlWrap>
            <S.AssetHeader>
              <S.Label>유용 가능한 자산</S.Label>
              <S.MiniButton onClick={addAsset}>+ 자산 추가</S.MiniButton>
            </S.AssetHeader>
            <S.AssetList>
              {form.assets.map((asset) => (
                <S.AssetRow key={asset.id}>
                  <S.TextInput
                    aria-label="자산 항목명"
                    placeholder="예: 국내주식"
                    value={asset.name}
                    onChange={(e) =>
                      updateAsset(asset.id, { name: e.target.value })
                    }
                  />
                  <MoneyInput
                    value={asset.amount}
                    onChange={(amount) => updateAsset(asset.id, { amount })}
                  />
                  <S.IconButton
                    title="자산 삭제"
                    onClick={() => removeAsset(asset.id)}
                    disabled={form.assets.length <= 1}
                  >
                    <X size={16} />
                  </S.IconButton>
                </S.AssetRow>
              ))}
            </S.AssetList>
            <S.AssetTotal>
              총 {readableMoney(totalAssets(form.assets))}
            </S.AssetTotal>
          </S.ControlWrap>
          <Field label="순자산">
            <MoneyInput
              value={form.netWorth}
              onChange={(value) => update({ netWorth: value })}
            />
          </Field>
          <Field label="기존 부채 월상환액">
            <MoneyInput
              value={form.existingDebtMonthly}
              onChange={(value) => update({ existingDebtMonthly: value })}
            />
          </Field>
          <Segment
            label="희망 주택가격"
            value={form.targetHomePriceMode}
            onChange={(targetHomePriceMode) => update({ targetHomePriceMode })}
            options={[
              ["auto", "입력 안 함"],
              ["specific", "직접 입력"],
            ]}
          />
          {form.targetHomePriceMode === "specific" && (
            <S.TargetHomeGrid>
              <Field label="희망 주택가격 입력">
                <MoneyInput
                  value={form.targetHomePrice}
                  onChange={(value) => update({ targetHomePrice: value })}
                />
              </Field>
              <Field label="전용면적">
                <S.InputWithAssist>
                  <NumberInput
                    value={form.areaM2}
                    min="0"
                    onChange={(value) => update({ areaM2: value })}
                    suffix="㎡"
                  />
                  <S.MoneyAssist>
                    약 {areaPyeongType.toLocaleString("ko-KR")}평형
                  </S.MoneyAssist>
                </S.InputWithAssist>
              </Field>
            </S.TargetHomeGrid>
          )}
          <Field label="자녀 수">
            <NumberInput
              value={form.childrenCount}
              min="0"
              onChange={(value) =>
                update({ childrenCount: value, multiChild: value >= 3 })
              }
              suffix="명"
            />
          </Field>
          <Segment
            label="무주택 여부"
            value={form.isHomeless}
            onChange={(isHomeless) => update({ isHomeless })}
            options={[
              ["yes", "무주택"],
              ["no", "유주택"],
            ]}
          />
          <Segment
            label="생애최초 주택구입"
            value={form.firstHome}
            onChange={(firstHome) => update({ firstHome })}
            options={[
              ["yes", "Y"],
              ["no", "N"],
            ]}
          />
          <Field label="최근 출산일">
            <S.TextInput
              type="date"
              value={form.birthDate || ""}
              onChange={(e) =>
                update({
                  birthDate: e.target.value,
                  newborn: isRecentBirth(e.target.value),
                })
              }
            />
          </Field>
          <ToggleRow
            icon={<Sparkles size={18} />}
            label="최근 2년 이내 출산"
            checked={form.newborn}
            onChange={(newborn) => update({ newborn })}
          />
          <Segment
            label="지역"
            value={form.region}
            onChange={(region) => update({ region })}
            options={[
              ["normal", "비규제지역"],
              ["regulated", "규제지역"],
            ]}
          />
          <S.PrimaryButton onClick={calculate}>
            <BadgePercent size={18} /> 얼만지 계산하기
          </S.PrimaryButton>
        </S.Panel>

        {report && (
          <S.Panel emphasis>
            <S.PanelTitle>
              <PiggyBank size={20} /> 결과 가이드 리포트
            </S.PanelTitle>
            <S.BigResult>최대 {eok(report.homePrice)} 원대</S.BigResult>
            <S.ResultCopy>
              {!report.hasTargetHomePrice
                ? `${report.bestPolicy.name} 기준으로 현재 조건에서 살 수 있는 최대 범위를 표시합니다.`
                : report.hasTargetPossiblePolicy
                  ? `희망 주택가격은 ${report.policyResults
                      .filter((policy) => policy.possible)
                      .map((policy) => policy.name)
                      .join(", ")} 기준으로 검토 가능합니다.`
                  : `희망 주택가격은 현재 조건으로 어렵고, ${report.bestPolicy.name} 기준 최대 매수 가능 범위를 표시합니다.`}
            </S.ResultCopy>
            <S.MetricGrid>
              <Metric
                label="부부합산 연소득(세전)"
                value={readableMoney(report.annualIncome)}
              />
              <Metric
                label="유용 가능 자산"
                value={readableMoney(report.availableAssets)}
              />
              <Metric label="예상 대출" value={eok(report.loan)} />
              <Metric
                label="적용 LTV"
                value={`${Math.round(report.ltv * 100)}%`}
              />
              <Metric label="예상 복비" value={won(report.brokerage)} />
              <Metric label="취득세" value={won(report.acquisitionTax)} />
            </S.MetricGrid>
            <S.SectionSub>정책별 가능 여부</S.SectionSub>
            <S.PolicyGrid>
              {report.policyResults.map((policy) => (
                <S.PolicyCard key={policy.id} possible={policy.possible}>
                  <S.PolicyTop>
                    <strong>{policy.name}</strong>
                    <S.PolicyBadge possible={policy.possible}>
                      {policy.possible ? "가능" : "불가"}
                    </S.PolicyBadge>
                  </S.PolicyTop>
                  <S.MetricGrid>
                    <Metric
                      label="최대 매수가"
                      value={readableMoney(policy.maxPurchase)}
                    />
                    <Metric
                      label="최대 대출"
                      value={readableMoney(policy.maxLoan)}
                    />
                    <Metric label="병목 한도" value={policy.limitingLabel} />
                    <Metric
                      label="한도 금액"
                      value={readableMoney(policy.limitingAmount)}
                    />
                  </S.MetricGrid>
                  {policy.reasons.length > 0 ? (
                    <S.ReasonList>
                      {policy.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </S.ReasonList>
                  ) : (
                    <S.PolicyNote>{policy.notes}</S.PolicyNote>
                  )}
                </S.PolicyCard>
              ))}
            </S.PolicyGrid>
            <S.SectionSub>30년 만기 상환 비교</S.SectionSub>
            <PayRow
              title="원리금 균등"
              desc="매월 균등하게 내는 돈"
              amount={won(report.equalPayment)}
            />
            <PayRow
              title="원금 균등"
              desc="첫 달 가장 많이 내는 돈"
              amount={won(report.equalPrincipalFirst)}
            />
            <PayRow
              title="만기 일시"
              desc="매월 이자만 내는 돈"
              amount={won(report.interestOnly)}
            />
            {showBenefits && (
              <S.BenefitBox>
                <Gem size={18} />
                <div>
                  <strong>맞춤형 정책 안내</strong>
                  <p>
                    {report.benefits.length
                      ? report.benefits.join(" · ")
                      : "현재 입력 조건으로는 기본 대출 기준을 우선 확인하세요."}
                  </p>
                </div>
              </S.BenefitBox>
            )}
            <S.DisclaimerBox>
              <strong>계산 결과 안내</strong>
              <p>
                본 결과는 입력값과 공개 정책 요건을 바탕으로 한 참고용
                시뮬레이션입니다. 실제 대출 가능 여부, 한도, 금리, 세금,
                중개보수는 은행 심사, 보증기관 심사, 차주 신용도, 기존 부채,
                스트레스 DSR, 지역·시점별 규제, 주택의 실제 평가액, 정책 변경 및
                예외 요건에 따라 달라질 수 있습니다.
              </p>
              <p>
                일반 주담대는 은행권 간편 기준으로 계산되며 금융회사별 내부 심사를
                대체하지 않습니다. 디딤돌·신생아 특례 등 정책상품도 최종 판단은
                주택도시기금, 수탁은행, 관계 기관의 최신 고시와 심사 결과를
                우선합니다. 본 앱의 계산 결과만을 근거로 계약, 대출 신청, 투자,
                세무 의사결정을 진행하지 마세요.
              </p>
            </S.DisclaimerBox>
          </S.Panel>
        )}
      </S.Duo>
    </S.Stack>
  );
}
