import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import styled from "@emotion/styled";
import { Global, css } from "@emotion/react";
import {
  Baby,
  BadgePercent,
  Banknote,
  BellRing,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Gem,
  HandCoins,
  Home,
  Landmark,
  PartyPopper,
  Pencil,
  PiggyBank,
  Plus,
  Sparkles,
  Trophy,
  WalletCards,
  X,
} from "lucide-react";

const STORAGE_KEYS = {
  onboarded: "estate-dday:onboarded",
  homeTab: "estate-dday:homeTab",
  buyer: "estate-dday:buyerForm",
  loan: "estate-dday:loanForm",
  loans: "estate-dday:loans",
  points: "estate-dday:points",
  prepayments: "estate-dday:prepayments",
};

const navy = "#101a2d";
const charcoal = "#263241";
const slate = "#667085";
const bg = "#f4f6f9";
const gold = "#d8aa3c";
const red = "#d94a42";
const mint = "#11a683";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const initialBuyer = {
  annualIncome: 45600000,
  spouseAnnualIncome: 0,
  assets: [{ id: "asset-cash", name: "예금/현금", amount: 80000000 }],
  netWorth: 80000000,
  existingDebtMonthly: 0,
  targetHomePrice: 500000000,
  areaM2: 84,
  married: "single",
  marriageYears: 3,
  firstHome: "yes",
  isHomeless: "yes",
  multiChild: false,
  newborn: false,
  childrenCount: 0,
  birthDate: "",
  region: "normal",
};

const initialLoans = [
  {
    id: "home-main",
    name: "주택담보대출",
    principal: 280000000,
    rate: 4.2,
    type: "mortgage",
    method: "equalPayment",
    payDay: 25,
    startYear: new Date().getFullYear() - 1,
    startMonth: 5,
    maturityYear: new Date().getFullYear() + 29,
    maturityMonth: 5,
    prepayments: [],
  },
  {
    id: "credit-bridge",
    name: "생활비 신용대출",
    principal: 30000000,
    rate: 5.8,
    type: "credit",
    method: "bullet",
    payDay: 10,
    startYear: new Date().getFullYear(),
    startMonth: 1,
    maturityYear: new Date().getFullYear() + 3,
    maturityMonth: 1,
    prepayments: [],
  },
];

function won(value) {
  if (!Number.isFinite(value)) return "0원";
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function eok(value) {
  const amount = Math.max(0, Math.round(value / 10000000) / 10);
  return `${amount.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억`;
}

function shortKoreanDate(date) {
  if (!date) return "";
  const year = String(date.getFullYear()).slice(-2);
  return `${year}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

function readableMoney(value) {
  const amount = Math.max(0, Math.round(Number(value) || 0));
  if (amount === 0) return "0원";

  const eokUnit = Math.floor(amount / 100000000);
  const manUnit = Math.floor((amount % 100000000) / 10000);

  if (eokUnit > 0 && manUnit > 0) {
    return `${eokUnit.toLocaleString("ko-KR")}억 ${manUnit.toLocaleString("ko-KR")}만원`;
  }

  if (eokUnit > 0) {
    return `${eokUnit.toLocaleString("ko-KR")}억원`;
  }

  if (manUnit > 0) {
    return `${manUnit.toLocaleString("ko-KR")}만원`;
  }

  return `${amount.toLocaleString("ko-KR")}원`;
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, Number(num) || 0));
}

function normalizeBuyerForm(form = initialBuyer) {
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

function totalAssets(assets = []) {
  return assets.reduce(
    (sum, asset) => sum + clamp(asset.amount, 0, 100000000000),
    0,
  );
}

function monthlyPayment(principal, annualRate, years) {
  const months = years * 12;
  return monthlyPaymentByMonths(principal, annualRate, months);
}

function monthlyPaymentByMonths(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * (r * (1 + r) ** months)) / ((1 + r) ** months - 1);
}

function monthsBetween(start, end) {
  return Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 +
      end.getMonth() -
      start.getMonth(),
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

function isRecentBirth(birthDate) {
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

function buyerReport(form) {
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

function createLoan() {
  const now = new Date();
  return {
    id: `loan-${Date.now()}`,
    name: "새 대출",
    principal: 100000000,
    rate: 4.5,
    type: "mortgage",
    method: "equalPayment",
    payDay: 15,
    startYear: now.getFullYear(),
    startMonth: now.getMonth() + 1,
    maturityYear: now.getFullYear() + 20,
    maturityMonth: now.getMonth() + 1,
    prepayments: [],
  };
}

function normalizeLoans() {
  const savedLoans = load(STORAGE_KEYS.loans, null);
  if (Array.isArray(savedLoans) && savedLoans.length > 0) {
    return savedLoans.map((loan) => ({
      ...loan,
      prepayments: loan.prepayments || [],
    }));
  }

  const oldLoan = load(STORAGE_KEYS.loan, null);
  const oldPrepayments = load(STORAGE_KEYS.prepayments, []);
  if (oldLoan?.principal) {
    return [
      {
        ...initialLoans[0],
        ...oldLoan,
        id: "migrated-loan",
        name: "기존 대출",
        maturityYear: oldLoan.startYear + (oldLoan.years || 30),
        maturityMonth: oldLoan.startMonth || 1,
        prepayments: oldPrepayments,
      },
    ];
  }

  return initialLoans;
}

function scheduledPrincipalPaid(loan, elapsed, totalMonths) {
  const months = Math.min(Math.max(0, elapsed), totalMonths);
  if (months <= 0) return 0;
  if (loan.method === "bullet") return 0;
  if (loan.method === "equalPrincipal") {
    return (loan.principal * months) / totalMonths;
  }
  const r = loan.rate / 100 / 12;
  if (r === 0) return (loan.principal * months) / totalMonths;
  const pmt = monthlyPaymentByMonths(loan.principal, loan.rate, totalMonths);
  const growth = (1 + r) ** months;
  const remaining = loan.principal * growth - pmt * ((growth - 1) / r);
  return loan.principal - Math.max(0, remaining);
}

function loanReport(loan) {
  const today = new Date();
  const start = new Date(loan.startYear, loan.startMonth - 1, loan.payDay);
  const maturity = new Date(
    loan.maturityYear,
    loan.maturityMonth - 1,
    loan.payDay,
  );
  const elapsed = Math.max(
    0,
    monthsBetween(start, today) + (today.getDate() >= loan.payDay ? 1 : 0),
  );
  const totalMonths = monthsBetween(start, maturity);
  const remainingMonths = Math.max(1, totalMonths - elapsed);
  const prepaymentTotal = (loan.prepayments || []).reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const scheduledPrincipal = Math.min(
    loan.principal,
    scheduledPrincipalPaid(loan, elapsed, totalMonths),
  );
  const paidPrincipal = Math.min(
    loan.principal,
    scheduledPrincipal + prepaymentTotal,
  );
  const remainingPrincipal = Math.max(0, loan.principal - paidPrincipal);
  const monthlyInterest = remainingPrincipal * (loan.rate / 100 / 12);
  const baseMonthly =
    loan.method === "bullet"
      ? monthlyInterest
      : loan.method === "equalPrincipal"
        ? remainingPrincipal / remainingMonths + monthlyInterest
        : monthlyPaymentByMonths(
            remainingPrincipal,
            loan.rate,
            remainingMonths,
          );
  const progress =
    loan.principal > 0
      ? clamp((paidPrincipal / loan.principal) * 100, 0, 100)
      : 0;
  const nextPay = new Date(today.getFullYear(), today.getMonth(), loan.payDay);
  if (today.getDate() > loan.payDay) nextPay.setMonth(nextPay.getMonth() + 1);
  const dday = Math.ceil((nextPay - today) / (1000 * 60 * 60 * 24));
  const remainingInterest = Math.max(
    0,
    remainingMonths * baseMonthly - remainingPrincipal,
  );
  const savedByPrepay =
    prepaymentTotal *
    (loan.rate / 100) *
    Math.min(8, remainingMonths / 12) *
    0.55;

  return {
    elapsed,
    totalMonths,
    remainingMonths,
    baseMonthly,
    paidPrincipal,
    remainingPrincipal,
    progress,
    dday,
    nextPay,
    maturity,
    prepaymentTotal,
    remainingInterest,
    savedByPrepay,
  };
}

function portfolioReport(loans) {
  const reports = loans.map((loan) => ({ loan, report: loanReport(loan) }));
  const nearest = reports.reduce(
    (best, item) =>
      !best || item.report.dday < best.report.dday ? item : best,
    null,
  );
  return {
    reports,
    nearest,
    totalPrincipal: loans.reduce((sum, loan) => sum + loan.principal, 0),
    totalRemaining: reports.reduce(
      (sum, item) => sum + item.report.remainingPrincipal,
      0,
    ),
    totalMonthly: reports.reduce(
      (sum, item) => sum + item.report.baseMonthly,
      0,
    ),
    totalPrepaid: reports.reduce(
      (sum, item) => sum + item.report.prepaymentTotal,
      0,
    ),
  };
}

function App() {
  const [homeTab, setHomeTab] = useState(() =>
    load(STORAGE_KEYS.homeTab, "buy"),
  );
  const [onboarded, setOnboarded] = useState(() =>
    load(STORAGE_KEYS.onboarded, false),
  );
  const [activeTab, setActiveTab] = useState(homeTab);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  const completeOnboarding = (tab) => {
    save(STORAGE_KEYS.onboarded, true);
    save(STORAGE_KEYS.homeTab, tab);
    setOnboarded(true);
    setHomeTab(tab);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchTab = (tab) => {
    if (tab !== activeTab) setShowInterstitial(true);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <GlobalStyles />
      <Shell>
        {!onboarded ? (
          <Onboarding onSelect={completeOnboarding} />
        ) : (
          <>
            <Header>
              <Brand>
                <Logo>
                  <Landmark size={22} />
                </Logo>
                <div>
                  <BrandName>부동산 영끌메이커</BrandName>
                  <BrandSub>내 소득 맞춤 계산부터 철저한 빚 관리까지</BrandSub>
                </div>
              </Brand>
            </Header>

            <Main>
              {activeTab === "buy" ? (
                <BuyerTab onAd={() => setShowInterstitial(true)} />
              ) : (
                <LoanTab />
              )}
            </Main>

            <BannerAd>AD | 내 집 마련 금융 정보 배너</BannerAd>
            <TabBar>
              <TabButton
                active={activeTab === "buy"}
                onClick={() => switchTab("buy")}
              >
                <Home size={20} /> 너도 살 수 있어
              </TabButton>
              <TabButton
                active={activeTab === "loan"}
                onClick={() => switchTab("loan")}
              >
                <CreditCard size={20} /> 내 대출금 비서
              </TabButton>
            </TabBar>
          </>
        )}

        {showInterstitial && (
          <Interstitial onClose={() => setShowInterstitial(false)} />
        )}
      </Shell>
    </>
  );
}

function Onboarding({ onSelect }) {
  return (
    <OnboardingWrap>
      <HeroTitle>부동산, 너도 살 수 있어!</HeroTitle>
      <HeroCopy>
        사기 전에는 현실적인 한도를,
        <br />
        사고 난 후에는 연체 없는 상환 루틴을 잡아드려요.
      </HeroCopy>
      <ChoiceGrid>
        <ChoiceCard onClick={() => onSelect("buy")}>
          <IconOrb>
            <Home size={34} />
          </IconOrb>
          <h2>나에게 맞는 집 찾기</h2>
          <p>내 진짜 자산으로 가능한 매수 금액과 부대비용을 먼저 확인해요.</p>
          <ChevronRight />
        </ChoiceCard>
        <ChoiceCard onClick={() => onSelect("loan")}>
          <IconOrb>
            <WalletCards size={34} />
          </IconOrb>
          <h2>받은 대출 관리하기</h2>
          <p>D-Day 알림과 상환 게이지로 빚이 줄어드는 감각을 만들어요.</p>
          <ChevronRight />
        </ChoiceCard>
      </ChoiceGrid>
    </OnboardingWrap>
  );
}

function BuyerTab({ onAd }) {
  const [form, setForm] = useState(() =>
    normalizeBuyerForm(load(STORAGE_KEYS.buyer, initialBuyer)),
  );
  const [report, setReport] = useState(() =>
    buyerReport(normalizeBuyerForm(load(STORAGE_KEYS.buyer, initialBuyer))),
  );
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

  return (
    <Stack>
      <Duo>
        <Panel>
          <PanelTitle>
            <Calculator size={20} /> 매수 가능 금액 계산기
          </PanelTitle>
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
          <ControlWrap>
            <AssetHeader>
              <Label>유용 가능한 자산</Label>
              <MiniButton onClick={addAsset}>+ 자산 추가</MiniButton>
            </AssetHeader>
            <AssetList>
              {form.assets.map((asset) => (
                <AssetRow key={asset.id}>
                  <TextInput
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
                  <IconButton
                    title="자산 삭제"
                    onClick={() => removeAsset(asset.id)}
                    disabled={form.assets.length <= 1}
                  >
                    <X size={16} />
                  </IconButton>
                </AssetRow>
              ))}
            </AssetList>
            <AssetTotal>
              총 {readableMoney(totalAssets(form.assets))}
            </AssetTotal>
          </ControlWrap>
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
          <Field label="희망 주택가격">
            <MoneyInput
              value={form.targetHomePrice}
              onChange={(value) => update({ targetHomePrice: value })}
            />
          </Field>
          <TwoCols>
            <Field label="전용면적">
              <NumberInput
                value={form.areaM2}
                min="0"
                onChange={(value) => update({ areaM2: value })}
                suffix="㎡"
              />
            </Field>
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
          </TwoCols>
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
            <TextInput
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
          <PrimaryButton onClick={calculate}>
            <BadgePercent size={18} /> 얼만지 계산하기
          </PrimaryButton>
        </Panel>

        <Panel emphasis>
          <PanelTitle>
            <PiggyBank size={20} /> 결과 가이드 리포트
          </PanelTitle>
          <BigResult>최대 {eok(report.homePrice)} 원대</BigResult>
          <ResultCopy>
            {report.hasTargetPossiblePolicy
              ? `희망 주택가격은 ${report.policyResults
                  .filter((policy) => policy.possible)
                  .map((policy) => policy.name)
                  .join(", ")} 기준으로 검토 가능합니다.`
              : `희망 주택가격은 현재 조건으로 어렵고, ${report.bestPolicy.name} 기준 최대 매수 가능 범위를 표시합니다.`}
          </ResultCopy>
          <MetricGrid>
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
          </MetricGrid>
          <SectionSub>정책별 가능 여부</SectionSub>
          <PolicyGrid>
            {report.policyResults.map((policy) => (
              <PolicyCard key={policy.id} possible={policy.possible}>
                <PolicyTop>
                  <strong>{policy.name}</strong>
                  <PolicyBadge possible={policy.possible}>
                    {policy.possible ? "가능" : "불가"}
                  </PolicyBadge>
                </PolicyTop>
                <MetricGrid>
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
                </MetricGrid>
                {policy.reasons.length > 0 ? (
                  <ReasonList>
                    {policy.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ReasonList>
                ) : (
                  <PolicyNote>{policy.notes}</PolicyNote>
                )}
              </PolicyCard>
            ))}
          </PolicyGrid>
          <SectionSub>30년 만기 상환 비교</SectionSub>
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
            <BenefitBox>
              <Gem size={18} />
              <div>
                <strong>맞춤형 정책 안내</strong>
                <p>
                  {report.benefits.length
                    ? report.benefits.join(" · ")
                    : "현재 입력 조건으로는 기본 대출 기준을 우선 확인하세요."}
                </p>
              </div>
            </BenefitBox>
          )}
          <DisclaimerBox>
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
          </DisclaimerBox>
        </Panel>
      </Duo>
    </Stack>
  );
}

function LoanTab() {
  const [loans, setLoans] = useState(() => normalizeLoans());
  const [editingLoan, setEditingLoan] = useState(null);
  const [points, setPoints] = useState(() => load(STORAGE_KEYS.points, 120));
  const [prepayValues, setPrepayValues] = useState({});
  const [celebrate, setCelebrate] = useState(false);
  const portfolio = useMemo(() => portfolioReport(loans), [loans]);

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
    const nextPoints = points + Math.max(10, Math.round(item.amount / 100000));
    setPoints(nextPoints);
    save(STORAGE_KEYS.points, nextPoints);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1800);
  };

  const certify = () => {
    const nextPoints = points + 70;
    setPoints(nextPoints);
    save(STORAGE_KEYS.points, nextPoints);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1800);
  };

  return (
    <Stack>
      <Dday urgent={(portfolio.nearest?.report.dday || 99) <= 3}>
        <BellRing size={24} />
        <div>
          <span>가장 가까운 대출금 출금까지</span>
          <strong>
            {portfolio.nearest?.report.dday === 0
              ? "D-Day"
              : `D-${portfolio.nearest?.report.dday || 0}`}
          </strong>
        </div>
        <DdayMeta urgent={(portfolio.nearest?.report.dday || 99) <= 3}>
          <b>{portfolio.nearest?.loan.name}</b>
          <span>{shortKoreanDate(portfolio.nearest?.report.nextPay)}</span>
        </DdayMeta>
      </Dday>

      <Duo>
        <ActionPanel>
          <PanelTitle>
            <Landmark size={20} /> 내 대출 포트폴리오
          </PanelTitle>
          <BigAddButton onClick={addLoan}>
            <Plus size={24} />
            대출 추가하기
          </BigAddButton>
          <LoanCountLine>
            <Banknote size={17} /> 지금 {loans.length}개의 대출을 관리 중
          </LoanCountLine>
        </ActionPanel>

        <Panel emphasis>
          <PanelTitle>
            <CircleDollarSign size={20} /> 전체 상환 대시보드
          </PanelTitle>
          <Gauge>
            <GaugeTop>
              <span>전체 대출 중 남은 원금</span>
              <strong>{eok(portfolio.totalRemaining)}</strong>
            </GaugeTop>
            <GaugeTrack>
              <GaugeFill
                style={{
                  width: `${portfolio.totalPrincipal ? 100 - (portfolio.totalRemaining / portfolio.totalPrincipal) * 100 : 0}%`,
                }}
              />
            </GaugeTrack>
          </Gauge>
          <MetricGrid>
            <Metric label="등록 대출" value={`${loans.length}개`} />
            <Metric
              label="이번 달 총 출금"
              value={won(portfolio.totalMonthly)}
            />
            <Metric label="누적 중도상환" value={won(portfolio.totalPrepaid)} />
            <Metric label="해방 포인트" value={`${points}P`} />
          </MetricGrid>
          <PrimaryButton onClick={certify}>
            <CheckCircle2 size={18} /> 이번 달 정상 상환 인증
          </PrimaryButton>
        </Panel>
      </Duo>

      <LoanCardGrid>
        {portfolio.reports.map(({ loan, report }) => (
          <LoanCard key={loan.id}>
            <LoanCardTop>
              <div>
                <strong>{loan.name}</strong>
                <span>
                  {loan.type === "mortgage" ? "주택담보대출" : "신용대출"} ·{" "}
                  {loan.rate}%
                </span>
              </div>
              <CardActions>
                <IconButton
                  title="대출 수정"
                  onClick={() =>
                    setEditingLoan({
                      ...loan,
                      prepayments: loan.prepayments || [],
                    })
                  }
                >
                  <Pencil size={17} />
                </IconButton>
                <DueBadge urgent={report.dday <= 3}>
                  {report.dday === 0 ? "오늘" : `D-${report.dday}`}
                </DueBadge>
              </CardActions>
            </LoanCardTop>
            <PayRow
              title={`${loan.payDay}일 출금`}
              desc={`${report.nextPay.toLocaleDateString("ko-KR")} 예정`}
              amount={won(report.baseMonthly)}
            />
            <MetricGrid>
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
            </MetricGrid>
            <GaugeTrack>
              <GaugeFill style={{ width: `${report.progress}%` }} />
            </GaugeTrack>
            <SectionSub>이 대출 중도상환</SectionSub>
            <InlineAction>
              <MoneyInput
                value={prepayValues[loan.id] || 1000000}
                onChange={(amount) =>
                  setPrepayValues({ ...prepayValues, [loan.id]: amount })
                }
              />
              <GoldButton onClick={() => addPrepayment(loan.id)}>
                <HandCoins size={18} /> 입력
              </GoldButton>
            </InlineAction>
            <BenefitBox>
              <Trophy size={18} />
              <div>
                <strong>원금 감소</strong>
                <p>
                  누적 중도상환 {won(report.prepaymentTotal)} · 예상 이자 절감{" "}
                  {won(report.savedByPrepay)}
                </p>
              </div>
            </BenefitBox>
          </LoanCard>
        ))}
      </LoanCardGrid>

      {editingLoan && (
        <LoanEditorModal
          loan={editingLoan}
          onChange={setEditingLoan}
          onClose={() => setEditingLoan(null)}
          onSave={saveLoan}
        />
      )}
      {celebrate && (
        <Confetti>
          <PartyPopper size={40} />
          <span>해방 포인트 지급!</span>
        </Confetti>
      )}
    </Stack>
  );
}

function LoanEditorModal({ loan, onChange, onClose, onSave }) {
  const update = (patch) => onChange({ ...loan, ...patch });

  return (
    <Overlay onClick={onClose}>
      <EditorModal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>
            <Badge>대출 입력</Badge>
            <h2>{loan.name || "새 대출"}</h2>
          </div>
          <IconButton title="닫기" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </ModalHeader>

        <Field label="대출 이름">
          <TextInput
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
        <TwoCols>
          <Field label="대출 금리">
            <TextInput
              type="number"
              value={loan.rate}
              step="0.1"
              onChange={(e) => update({ rate: Number(e.target.value) })}
            />
          </Field>
          <Field label="매달 출금일">
            <TextInput
              type="number"
              min="1"
              max="28"
              value={loan.payDay}
              onChange={(e) => update({ payDay: clamp(e.target.value, 1, 28) })}
            />
          </Field>
        </TwoCols>
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
        <PickerLabel>대출 시작 연/월</PickerLabel>
        <PickerGrid>
          <YearSelect
            value={loan.startYear}
            onChange={(startYear) => update({ startYear })}
          />
          <MonthSelect
            value={loan.startMonth}
            onChange={(startMonth) => update({ startMonth })}
          />
        </PickerGrid>
        <PickerLabel>대출 만기 연/월</PickerLabel>
        <PickerGrid>
          <YearSelect
            value={loan.maturityYear}
            future
            onChange={(maturityYear) => update({ maturityYear })}
          />
          <MonthSelect
            value={loan.maturityMonth}
            onChange={(maturityMonth) => update({ maturityMonth })}
          />
        </PickerGrid>

        <ModalFooter>
          <GhostButton onClick={onClose}>취소</GhostButton>
          <PrimaryButton
            onClick={() =>
              onSave({ ...loan, name: loan.name.trim() || "이름 없는 대출" })
            }
          >
            저장하기
          </PrimaryButton>
        </ModalFooter>
      </EditorModal>
    </Overlay>
  );
}

function YearSelect({ value, onChange, future = false }) {
  const base = new Date().getFullYear();
  const years = Array.from({ length: future ? 35 : 12 }, (_, idx) =>
    future ? base + idx : base - idx,
  );
  return (
    <Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}년
        </option>
      ))}
    </Select>
  );
}

function MonthSelect({ value, onChange }) {
  return (
    <Select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
        <option key={month} value={month}>
          {month}월
        </option>
      ))}
    </Select>
  );
}

function Field({ label, children }) {
  return (
    <FieldWrap>
      <Label>{label}</Label>
      {children}
    </FieldWrap>
  );
}

function Segment({ label, value, onChange, options }) {
  return (
    <ControlWrap>
      <Label>{label}</Label>
      <SegmentWrap>
        {options.map(([key, text]) => (
          <SegmentItem
            key={key}
            active={value === key}
            onClick={() => onChange(key)}
          >
            {text}
          </SegmentItem>
        ))}
      </SegmentWrap>
    </ControlWrap>
  );
}

function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <ToggleLine onClick={() => onChange(!checked)}>
      <span>
        {icon}
        {label}
      </span>
      <Switch checked={checked}>
        <i />
      </Switch>
    </ToggleLine>
  );
}

function MoneyInput({ value, onChange, max = 100000000000 }) {
  return (
    <InputWithAssist>
      <TextInput
        inputMode="numeric"
        value={Number(value || 0).toLocaleString("ko-KR")}
        onChange={(e) =>
          onChange(clamp(e.target.value.replaceAll(",", ""), 0, max))
        }
      />
      <MoneyAssist>{readableMoney(value)}</MoneyAssist>
    </InputWithAssist>
  );
}

function NumberInput({ value, onChange, suffix, min = "0" }) {
  return (
    <InlineNumber>
      <TextInput
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{suffix}</span>
    </InlineNumber>
  );
}

function Metric({ label, value }) {
  return (
    <MetricCard>
      <span>{label}</span>
      <strong>{value}</strong>
    </MetricCard>
  );
}

function PayRow({ title, desc, amount }) {
  return (
    <PayItem>
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <b>{amount}</b>
    </PayItem>
  );
}

function Interstitial({ onClose }) {
  return (
    <Overlay onClick={onClose}>
      <AdModal onClick={(e) => e.stopPropagation()}>
        <Badge>전면 광고</Badge>
        <h2>내 돈 지키는 체크포인트</h2>
        <p>계산 결과와 모드 전환 시 노출되는 수익화 영역입니다.</p>
        <PrimaryButton onClick={onClose}>계속하기</PrimaryButton>
      </AdModal>
    </Overlay>
  );
}

const GlobalStyles = () => (
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

const Shell = styled.div`
  min-height: 100vh;
`;

const Header = styled.header`
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

const Brand = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Logo = styled.div`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: ${gold};
  background: ${navy};
  border-radius: 8px;
`;

const BrandName = styled.div`
  font-weight: 900;
  color: ${navy};
`;

const BrandSub = styled.div`
  color: ${slate};
  font-size: 13px;
`;

const Main = styled.main`
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 22px clamp(16px, 4vw, 28px);
  padding-bottom: 142px;
`;

const Stack = styled.div`
  display: grid;
  gap: 16px;
`;

const Duo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: white;
  border: 1px solid #dce3ee;
  border-radius: 8px;
  padding: 18px;
  box-shadow: ${({ emphasis }) =>
    emphasis ? "0 16px 36px rgba(16, 26, 45, 0.10)" : "none"};
`;

const ActionPanel = styled(Panel)`
  display: grid;
  align-content: start;
  gap: 14px;
`;

const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  color: ${navy};
  font-size: 18px;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  > h2 {
    margin-bottom: 0;
  }
`;

const MiniButton = styled.button`
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

const BigAddButton = styled.button`
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

const LoanCountLine = styled.div`
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

const LoanTabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 12px;
`;

const LoanPill = styled.button`
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

const FieldWrap = styled.label`
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
`;

const ControlWrap = styled.div`
  display: grid;
  gap: 7px;
  margin-bottom: 13px;
`;

const Label = styled.span`
  color: ${navy};
  font-size: 13px;
  font-weight: 800;
`;

const TextInput = styled.input`
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

const InputWithAssist = styled.div`
  display: grid;
  gap: 5px;
`;

const MoneyAssist = styled.small`
  color: ${slate};
  font-size: 12px;
  font-weight: 500;
`;

const InlineNumber = styled.div`
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

const AssetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const AssetList = styled.div`
  display: grid;
  gap: 9px;
`;

const AssetRow = styled.div`
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

const AssetTotal = styled.div`
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

const SegmentWrap = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const SegmentItem = styled.button`
  height: 44px;
  border: 1px solid ${({ active }) => (active ? gold : "#ccd6e4")};
  border-radius: 8px;
  background: ${({ active }) => (active ? "#fff7df" : "#fbfcfe")};
  color: ${({ active }) => (active ? navy : slate)};
  font-weight: 900;
  cursor: pointer;
`;

const ToggleLine = styled.button`
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

const Switch = styled.div`
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

const PrimaryButton = styled.button`
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

const GhostButton = styled.button`
  min-height: 50px;
  padding: 0 18px;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  background: #fbfcfe;
  color: ${navy};
  font-weight: 950;
  cursor: pointer;
`;

const GoldButton = styled(PrimaryButton)`
  min-width: 110px;
  width: auto;
  background: ${gold};
  color: ${navy};
`;

const BigResult = styled.div`
  color: ${navy};
  font-size: clamp(34px, 7vw, 58px);
  font-weight: 950;
  line-height: 1;
`;

const ResultCopy = styled.p`
  margin: 10px 0 16px;
  color: ${slate};
  font-weight: 700;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin: 14px 0;
`;

const MetricCard = styled.div`
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

const SectionSub = styled.h3`
  margin: 16px 0 9px;
  color: ${navy};
  font-size: 15px;
`;

const PayItem = styled.div`
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

const BenefitBox = styled.div`
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

const PolicyGrid = styled.div`
  display: grid;
  gap: 10px;
`;

const PolicyCard = styled.div`
  border: 1px solid
    ${({ possible }) =>
      possible ? "rgba(17, 166, 131, 0.36)" : "rgba(217, 74, 66, 0.34)"};
  border-radius: 8px;
  padding: 13px;
  background: ${({ possible }) => (possible ? "#f1fbf7" : "#fff5f3")};
`;

const PolicyTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  strong {
    color: ${navy};
    font-size: 15px;
  }
`;

const PolicyBadge = styled.span`
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

const ReasonList = styled.ul`
  margin: 8px 0 0;
  padding-left: 18px;
  color: ${charcoal};
  font-size: 13px;
  line-height: 1.45;
`;

const PolicyNote = styled.p`
  margin: 8px 0 0;
  color: ${slate};
  font-size: 13px;
  line-height: 1.45;
`;

const DisclaimerBox = styled.div`
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

const LoanCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const LoanCard = styled.article`
  background: white;
  border: 1px solid ${({ selected }) => (selected ? gold : "#dce3ee")};
  border-radius: 8px;
  padding: 16px;
  box-shadow: ${({ selected }) =>
    selected ? "0 12px 28px rgba(216, 170, 60, 0.16)" : "none"};
`;

const LoanCardTop = styled.div`
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

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
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

const DueBadge = styled.div`
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

const Dday = styled.div`
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

const DdayMeta = styled.div`
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

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const RangeWrap = styled.div`
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

const PickerLabel = styled.div`
  margin: 10px 0 7px;
  color: ${navy};
  font-size: 13px;
  font-weight: 800;
`;

const PickerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const Select = styled.select`
  height: 48px;
  border: 1px solid #ccd6e4;
  border-radius: 8px;
  padding: 0 12px;
  background: #fbfcfe;
  color: ${navy};
  font-weight: 900;
`;

const Gauge = styled.div`
  margin-bottom: 14px;
`;

const GaugeTop = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${navy};
  font-weight: 900;
  margin-bottom: 8px;
`;

const GaugeTrack = styled.div`
  height: 16px;
  border-radius: 999px;
  background: #e3e8f1;
  overflow: hidden;
`;

const GaugeFill = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${gold}, ${mint});
  transition: width 0.4s ease;
`;

const InlineAction = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 9px;
`;

const Confetti = styled.div`
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

const BannerAd = styled.div`
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

const TabBar = styled.nav`
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

const TabButton = styled.button`
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

const OnboardingWrap = styled.main`
  min-height: 100vh;
  display: grid;
  align-content: center;
  gap: 18px;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 28px clamp(16px, 5vw, 40px);
`;

const HeroTitle = styled.h1`
  margin: 0;
  color: ${navy};
  font-size: clamp(34px, 7vw, 68px);
  line-height: 1;
  word-break: keep-all;
`;

const HeroCopy = styled.p`
  margin: 0 0 8px;
  width: min(620px, 100%);
  color: ${slate};
  font-size: 17px;
  font-weight: 750;
  line-height: 1.55;
  word-break: keep-all;
`;

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ChoiceCard = styled.button`
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

const IconOrb = styled.div`
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: ${navy};
  color: ${gold};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(16, 26, 45, 0.62);
`;

const AdModal = styled.div`
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

const EditorModal = styled.div`
  width: min(560px, 100%);
  max-height: min(760px, calc(100vh - 36px));
  overflow-y: auto;
  padding: 22px;
  border-radius: 8px;
  background: white;
  color: ${navy};
`;

const ModalHeader = styled.div`
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

const ModalFooter = styled.div`
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

const Badge = styled.span`
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 8px;
  background: #fff4d4;
  color: ${navy};
  font-weight: 900;
`;

createRoot(document.getElementById("root")).render(<App />);
