export const STORAGE_KEYS = {
  onboarded: "estate-dday:onboarded",
  homeTab: "estate-dday:homeTab",
  buyer: "estate-dday:buyerForm",
  loan: "estate-dday:loanForm",
  loans: "estate-dday:loans",
  prepayments: "estate-dday:prepayments",
  adShownOnce: "estate-dday:adShownOnce",
  adTriggerCount: "estate-dday:adTriggerCount",
};

export const initialBuyer = {
  annualIncome: 0,
  spouseAnnualIncome: 0,
  assets: [{ id: "asset-cash", name: "", amount: 0 }],
  netWorth: 0,
  existingDebtMonthly: 0,
  targetHomePriceMode: "auto",
  targetHomePrice: 0,
  areaM2: 0,
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

export const initialLoans = [];
