const BRL_TO_USD_RATE = 5.00

export function brlToUsd(brl: number): number {
  return brl / BRL_TO_USD_RATE
}

export function formatCurrency(amount: number, language: string): string {
  if (language === 'pt-BR' || language.startsWith('pt')) {
    return amount
      .toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      .replace('\u00A0', ' ')
  }
  const usd = brlToUsd(amount)
  return usd
    .toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
    .replace('\u00A0', ' ')
}
