// src/config.ts
export const BRAND_TERMS = {
  missionsLabel: 'Thinking Missions',
  challengesLabel: 'Chapter Challenges', // replaces "Thinking Sheets"
  brainMapGuestLabel: "Your Kid's Brain Map",
  getBrainMapTitle: (childName?: string | null) =>
    childName?.trim() ? `${childName.trim()}'s Brain Mapping` : "Your Kid's Brain Map",
};

export const FREE_LIMITS = {
  dailyMissions: 2,
  freeChallengesPerChapter: 4,
};

export const INDIA_PLANS = [
  {
    id: 'free',
    name: 'Free Forever',
    priceInr: 0,
    monthlyLabel: '₹0 / month',
    cta: 'Start Free Now',
    popular: false,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    priceInr: 999,
    siblingPriceInr: 799,
    monthlyLabel: '₹83/month • One-Time Payment',
    cta: 'Get Explorer — ₹999',
    popular: false,
  },
  {
    id: 'thinker_pro',
    name: 'Thinker Pro',
    priceInr: 1499,
    siblingPriceInr: 1199,
    monthlyLabel: '₹125/month • One-Time Payment',
    cta: 'Get Thinker Pro — ₹1,499',
    popular: true,
  },
  {
    id: 'scholar_elite',
    name: 'Scholar Elite',
    priceInr: 2499,
    siblingPriceInr: 1999,
    monthlyLabel: 'just ₹208/month—less than one week of tuition',
    cta: 'Get Scholar Elite — ₹2,499',
    popular: false,
  },
] as const;