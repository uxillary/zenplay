export const supportOffers = {
  support_2_gbp: { amountMinor: 200, currency: 'gbp', priceSecret: 'STRIPE_PRICE_SUPPORT_2_GBP' },
  support_5_gbp: { amountMinor: 500, currency: 'gbp', priceSecret: 'STRIPE_PRICE_SUPPORT_5_GBP' },
  support_10_gbp: { amountMinor: 1000, currency: 'gbp', priceSecret: 'STRIPE_PRICE_SUPPORT_10_GBP' },
} as const

export type SupportOfferId = keyof typeof supportOffers

export const isSupportOfferId = (value: unknown): value is SupportOfferId =>
  typeof value === 'string' && Object.hasOwn(supportOffers, value)
