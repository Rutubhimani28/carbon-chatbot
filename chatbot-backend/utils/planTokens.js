// utils/planTokens.js

export const PLAN_TOKENS = {
  Nova: {
    "Glow Up": 200_000,
    "Level Up": 500_000,
    "Rise Up": 1_000_000,
  },
  Supernova: {
    "Step Up": 500_000,
    "Speed Up": 1_000_000,
    "Scale Up": 2_000_000,
  },
  "Free Trial": {
    DEFAULT: 3_000,
  },
};

/**
 * ✅ Input token limits (prompt + files) per plan
 */
export const INPUT_TOKEN_LIMITS = {
  Nova: {
    "Glow Up": 5000,
    "Level Up": 5000,
    "Rise Up": 10000,
  },
  Supernova: {
    "Step Up": 10000,
    "Speed Up": Infinity,  // No limit
    "Scale Up": Infinity,  // No limit
  },
  "Free Trial": {
    DEFAULT: 5000,
  },
};

/**
 * ✅ Get token limit based on plan selection
 */
export function getTokenLimit({
  subscriptionPlan,
  childPlan,
}) {
  if (subscriptionPlan === "Free Trial") {
    return PLAN_TOKENS["Free Trial"].DEFAULT;
  }

  const plan = PLAN_TOKENS[subscriptionPlan];
  if (!plan) return 0;

  return plan[childPlan] || 0;
}

/**
 * ✅ Get input token limit (prompt + files) based on plan
 */
export function getInputTokenLimit({
  subscriptionPlan,
  childPlan,
}) {
  if (subscriptionPlan === "Free Trial") {
    return INPUT_TOKEN_LIMITS["Free Trial"].DEFAULT;
  }

  const plan = INPUT_TOKEN_LIMITS[subscriptionPlan];
  if (!plan) return 5000; // fallback to default

  return plan[childPlan] || 5000; // fallback to default
}
