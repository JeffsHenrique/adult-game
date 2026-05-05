import { formatCurrency, brlToUsd } from '../currency'

describe('brlToUsd', () => {
  it('converts BRL to USD using fixed rate', () => {
    expect(brlToUsd(1000)).toBe(200)
  })

  it('handles zero', () => {
    expect(brlToUsd(0)).toBe(0)
  })
})

describe('formatCurrency', () => {
  it('formats BRL correctly', () => {
    expect(formatCurrency(2714.85, 'pt-BR')).toBe('R$ 2.714,85')
  })

  it('formats USD correctly', () => {
    expect(formatCurrency(542.97, 'en')).toBe('$108.59')
  })

  it('formats zero BRL', () => {
    expect(formatCurrency(0, 'pt-BR')).toBe('R$ 0,00')
  })
})
