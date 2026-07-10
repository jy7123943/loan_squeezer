import { initialBuyer } from '../constants';
import { clamp, monthlyPayment, readableMoney } from '../utils';

export function normalizeBuyerForm(form = initialBuyer) {
  const assets =
    Array.isArray(form.assets) && form.assets.length > 0
      ? form.assets
      : [
          {
            id: "asset-cash",
            name: "예금/현금",
            amount: form.cash || initialBuyer.assets[0].amount,
          },
        ];
  const normalizedAssets = assets.map((asset, index) => ({
    id: asset.id || `asset-${Date.now()}-${index}`,
    name: asset.name || "",
    amount: clamp(asset.amount, 0, 100000000000),
  }));

  return {
    ...initialBuyer,
    ...form,
    assets: normalizedAssets,
    netWorth: form.netWorth ?? totalAssets(normalizedAssets),
    annualIncome: form.annualIncome ?? (form.salary || 3800000) * 12,
    spouseAnnualIncome:
      form.spouseAnnualIncome ?? (form.spouseSalary || 0) * 12,
    childrenCount: Number(form.childrenCount ?? 0),
    areaM2: Number(form.areaM2 ?? initialBuyer.areaM2),
    marriageYears: Number(form.marriageYears ?? initialBuyer.marriageYears),
  };
}

export function totalAssets(assets = []) {
  return assets.reduce(
    (sum, asset) => sum + clamp(asset.amount, 0, 100000000000),
    0,
  );
}

function principalFromMonthlyPayment(monthlyPaymentLimit, annualRate, years) {
  const months = years * 12;
  const r = annualRate / 100 / 12;
  if (monthlyPaymentLimit <= 0) return 0;
  if (r === 0) return monthlyPaymentLimit * months;
  return (
    (monthlyPaymentLimit * ((1 + r) ** months - 1)) / (r * (1 + r) ** months)
  );
}

export function isRecentBirth(birthDate) {
  if (!birthDate) return false;
  const birth = new Date(birthDate);
  const min = new Date("2023-01-01");
  const now = new Date();
  const twoYearsAgo = new Date(
    now.getFullYear() - 2,
    now.getMonth(),
    now.getDate(),
  );
  return birth >= min && birth >= twoYearsAgo && birth <= now;
}

function capLabel(key) {
  return (
    {
      product: "상품별 대출한도",
      ltv: "LTV 한도",
      dti: "DTI/DSR 한도",
      price: "주택가격",
      purchasePower: "보유자산 필요액",
    }[key] || key
  );
}

function evaluatePolicy(ctx, policy) {
  const ltv = typeof policy.ltv === "function" ? policy.ltv(ctx) : policy.ltv;
  const incomeRatio = policy.debtRatio;
  const monthlyLimit = Math.max(
    0,
    (ctx.annualIncome * incomeRatio) / 12 - ctx.existingDebtMonthly,
  );
  const debtLimit = principalFromMonthlyPayment(monthlyLimit, policy.rate, 30);
  const productLimit =
    typeof policy.loanCap === "function" ? policy.loanCap(ctx) : policy.loanCap;
  const priceLimit = policy.homePriceCap || Infinity;
  const assetPriceLimit =
    ltv < 1 ? ctx.availableAssets / Math.max(0.01, 1 - ltv) : Infinity;
  const maxPurchase = Math.max(
    0,
    Math.min(
      priceLimit,
      ctx.availableAssets + Math.min(productLimit, debtLimit),
      assetPriceLimit,
    ),
  );
  const maxLoanAtMaxPurchase = Math.max(
    0,
    Math.min(
      productLimit,
      debtLimit,
      maxPurchase * ltv,
      maxPurchase - ctx.availableAssets,
    ),
  );
  const targetLoanNeed = Math.max(0, ctx.targetHomePrice - ctx.availableAssets);
  const targetCaps = [
    { key: "product", amount: productLimit },
    { key: "ltv", amount: ctx.targetHomePrice * ltv },
    { key: "dti", amount: debtLimit },
    { key: "price", amount: ctx.targetHomePrice <= priceLimit ? Infinity : 0 },
  ];
  const limiting = targetCaps.reduce(
    (min, item) => (item.amount < min.amount ? item : min),
    targetCaps[0],
  );
  const eligibilityReasons = policy.eligibility(ctx);
  const reasons = [...eligibilityReasons];

  if (ctx.targetHomePrice > priceLimit) {
    reasons.push(
      `희망 주택가격이 상품 대상 주택가격 ${readableMoney(priceLimit)}을 초과합니다.`,
    );
  }
  if (targetLoanNeed > productLimit) {
    reasons.push(
      `필요 대출액이 ${policy.name}의 상품별 대출한도 ${readableMoney(productLimit)}을 초과합니다.`,
    );
  }
  if (targetLoanNeed > ctx.targetHomePrice * ltv) {
    reasons.push(
      `필요 대출액이 LTV ${Math.round(ltv * 100)}% 한도를 초과합니다.`,
    );
  }
  if (targetLoanNeed > debtLimit) {
    reasons.push(`기존 부채를 반영한 ${policy.debtLabel} 한도를 초과합니다.`);
  }

  return {
    id: policy.id,
    name: policy.name,
    possible: reasons.length === 0,
    eligible: eligibilityReasons.length === 0,
    rate: policy.rate,
    ltv,
    debtLabel: policy.debtLabel,
    maxPurchase,
    maxLoan: maxLoanAtMaxPurchase,
    targetLoanNeed,
    targetPossibleLoan: Math.min(
      productLimit,
      ctx.targetHomePrice * ltv,
      debtLimit,
      ctx.targetHomePrice,
    ),
    limitingLabel: capLabel(limiting.key),
    limitingAmount:
      limiting.amount === Infinity ? maxLoanAtMaxPurchase : limiting.amount,
    reasons,
    notes: policy.notes,
  };
}

function policyEngines() {
  const firstHomeLtv = (ctx) =>
    ctx.firstHome && ctx.region !== "regulated" ? 0.8 : 0.7;
  const fundCommonEligibility = (ctx, incomeLimit, homePriceLimit) => {
    const reasons = [];
    if (!ctx.isHomeless) reasons.push("무주택 세대주 요건을 충족해야 합니다.");
    if (ctx.annualIncome > incomeLimit)
      reasons.push(
        `부부합산 연소득이 ${readableMoney(incomeLimit)} 기준을 초과합니다.`,
      );
    if (ctx.netWorth > 511000000)
      reasons.push("순자산가액이 2026년 기준 5.11억원을 초과합니다.");
    if (ctx.areaM2 > 85)
      reasons.push("전용면적 85㎡ 이하 주택 요건을 초과합니다.");
    if (ctx.targetHomePrice > homePriceLimit)
      reasons.push(
        `대상 주택가격 ${readableMoney(homePriceLimit)} 기준을 초과합니다.`,
      );
    return reasons;
  };

  return [
    {
      id: "bank",
      name: "일반 주담대",
      loanCap: (ctx) => (ctx.firstHome ? 600000000 : 10000000000),
      homePriceCap: Infinity,
      ltv: (ctx) =>
        ctx.firstHome ? 0.8 : ctx.region === "regulated" ? 0.5 : 0.7,
      debtRatio: 0.4,
      debtLabel: "DSR 40%",
      rate: 4.5,
      eligibility: () => [],
      notes:
        "은행권 일반 주담대는 간편 기준입니다. 생애최초는 LTV 80%와 대출한도 6억원 상한을 반영했고, 실제 한도는 은행·차주별 심사와 스트레스 DSR에 따라 달라질 수 있습니다.",
    },
    {
      id: "didimdol",
      name: "디딤돌 일반",
      loanCap: 200000000,
      homePriceCap: 500000000,
      ltv: 0.7,
      debtRatio: 0.6,
      debtLabel: "DTI 60%",
      rate: 4.15,
      eligibility: (ctx) => fundCommonEligibility(ctx, 60000000, 500000000),
      notes: "주택도시기금 디딤돌 일반 기준입니다.",
    },
    {
      id: "firstHome",
      name: "생애최초 디딤돌",
      loanCap: 240000000,
      homePriceCap: 500000000,
      ltv: firstHomeLtv,
      debtRatio: 0.6,
      debtLabel: "DTI 60%",
      rate: 4.15,
      eligibility: (ctx) => [
        ...fundCommonEligibility(ctx, 70000000, 500000000),
        ...(!ctx.firstHome ? ["생애최초 주택구입 조건이 필요합니다."] : []),
      ],
      notes: "생애최초는 비수도권·비규제 조건에서 LTV 80%를 반영했습니다.",
    },
    {
      id: "newlywedMulti",
      name: "신혼/2자녀 이상 디딤돌",
      loanCap: 320000000,
      homePriceCap: 600000000,
      ltv: 0.7,
      debtRatio: 0.6,
      debtLabel: "DTI 60%",
      rate: 4.15,
      eligibility: (ctx) => [
        ...fundCommonEligibility(
          ctx,
          ctx.isNewlywed ? 85000000 : 70000000,
          600000000,
        ),
        ...(!ctx.isNewlywed && ctx.childrenCount < 2
          ? ["신혼가구 또는 2자녀 이상 조건이 필요합니다."]
          : []),
      ],
      notes: "신혼가구 또는 2자녀 이상 가구 한도 기준입니다.",
    },
    {
      id: "newborn",
      name: "신생아 특례 디딤돌",
      loanCap: 400000000,
      homePriceCap: 900000000,
      ltv: firstHomeLtv,
      debtRatio: 0.6,
      debtLabel: "DTI 60%",
      rate: 4.5,
      eligibility: (ctx) => {
        const incomeLimit =
          ctx.married === "married" &&
          ctx.ownAnnualIncome > 0 &&
          ctx.spouseAnnualIncome > 0
            ? 200000000
            : 130000000;
        return [
          ...fundCommonEligibility(ctx, incomeLimit, 900000000),
          ...(!ctx.hasNewborn
            ? ["대출접수일 기준 2년 내 출산 또는 입양 조건이 필요합니다."]
            : []),
        ];
      },
      notes:
        "신생아 특례는 2023년 1월 1일 이후 출생아 및 2년 내 출산 조건을 반영했습니다.",
    },
  ];
}

export function buyerReport(form) {
  const availableAssets = totalAssets(form.assets);
  const ownAnnualIncome = clamp(form.annualIncome, 0, 10000000000);
  const spouseAnnualIncome =
    form.married === "married"
      ? clamp(form.spouseAnnualIncome, 0, 10000000000)
      : 0;
  const annualIncome = ownAnnualIncome + spouseAnnualIncome;
  const childrenCount = Math.max(
    Number(form.childrenCount) || 0,
    form.multiChild ? 3 : 0,
  );
  const ctx = {
    ...form,
    availableAssets,
    ownAnnualIncome,
    spouseAnnualIncome,
    annualIncome,
    netWorth: clamp(form.netWorth, 0, 100000000000),
    existingDebtMonthly: clamp(form.existingDebtMonthly, 0, 1000000000),
    targetHomePrice: clamp(form.targetHomePrice, 0, 100000000000),
    areaM2: Number(form.areaM2) || 0,
    firstHome: form.firstHome === "yes",
    isHomeless: form.isHomeless === "yes",
    isNewlywed:
      form.married === "married" && (Number(form.marriageYears) || 99) <= 7,
    childrenCount,
    hasNewborn: form.newborn || isRecentBirth(form.birthDate),
  };
  const policyResults = policyEngines().map((policy) =>
    evaluatePolicy(ctx, policy),
  );
  const eligibleResults = policyResults.filter((result) => result.eligible);
  const targetPossibleResults = policyResults.filter(
    (result) => result.possible,
  );
  const best = (
    eligibleResults.length ? eligibleResults : policyResults
  ).reduce(
    (current, result) =>
      result.maxPurchase > current.maxPurchase ? result : current,
    policyResults[0],
  );
  const homePrice = best.maxPurchase;
  const loan = best.maxLoan;
  const brokerage = Math.min(
    homePrice * 0.004,
    homePrice >= 900000000 ? homePrice * 0.005 : homePrice * 0.004,
  );
  const acquisitionBase =
    homePrice * (form.firstHome === "yes" ? 0.009 : 0.012);
  const discount = childrenCount >= 3 ? 1400000 : 0;
  const acquisitionTax = Math.max(0, acquisitionBase - discount);
  const displayRate = best.rate;
  const equalPayment = monthlyPayment(loan, displayRate, 30);
  const equalPrincipalFirst = loan / 360 + loan * (displayRate / 100 / 12);
  const interestOnly = loan * (displayRate / 100 / 12);

  return {
    ltv: best.ltv,
    homePrice,
    loan,
    annualIncome,
    availableAssets,
    bestPolicy: best,
    hasTargetPossiblePolicy: targetPossibleResults.length > 0,
    policyResults,
    brokerage,
    acquisitionTax,
    equalPayment,
    equalPrincipalFirst,
    interestOnly,
    benefits: [
      ctx.hasNewborn && "신생아 특례 검토 대상",
      childrenCount >= 3 && "다자녀 취득세 감면 가능성 있음",
      form.firstHome === "yes" && "생애최초 주택구입 우대 조건 확인",
      best.possible
        ? `${best.name} 기준 최대 가능액이 가장 큼`
        : "입력 조건상 가능 상품이 없어 불가 사유를 확인해야 함",
    ].filter(Boolean),
  };
}
