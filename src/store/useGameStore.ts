import { create } from 'zustand'
import { BillWithPrice } from '../utils/billGenerator'
import { supabase } from '../lib/supabase'
import { generateFingerprint } from '../utils/fingerprint'
import { getUTC3Date } from '../utils/dailySeed'

interface GameState {
  salary: number
  bills: BillWithPrice[]
  correctAnswer: string[]
  selectedBills: string[]
  hasPlayedToday: boolean
  playChecked: boolean
  gameResult: 'win' | 'lose' | null
  serverError: boolean

  setDailyGame: (data: { salary: number; bills: BillWithPrice[]; correctAnswer: string[] }) => void
  toggleBill: (billId: string) => void
  setPlayStatus: (hasPlayed: boolean) => void
  setPlayChecked: (checked: boolean) => void
  submitSelection: () => void
  setServerError: (error: boolean) => void
  reset: () => void
}

export const useGameStore = create<GameState>()((set, get) => ({
  salary: 0,
  bills: [],
  correctAnswer: [],
  selectedBills: [],
  hasPlayedToday: false,
  playChecked: false,
  gameResult: null,
  serverError: false,

  setDailyGame: (data) => set(data),
  toggleBill: (billId) =>
    set((state) => {
      const selected = state.selectedBills.includes(billId)
        ? state.selectedBills.filter((id) => id !== billId)
        : [...state.selectedBills, billId]
      return { selectedBills: selected }
    }),
  setPlayStatus: (hasPlayed) => set({ hasPlayedToday: hasPlayed }),
  setPlayChecked: (checked) => set({ playChecked: checked }),
  setServerError: (error) => set({ serverError: error }),

  submitSelection: async () => {
    const { selectedBills, correctAnswer } = get()
    const isWin =
      selectedBills.length === correctAnswer.length &&
      selectedBills.every((id) => correctAnswer.includes(id))

    set({ gameResult: isWin ? 'win' : 'lose' })

    const dateKey = getUTC3Date()
    const fingerprint = await generateFingerprint()

    try {
      await supabase.from('daily_plays').insert({
        fingerprint,
        date_key: dateKey,
      })
    } catch {
      localStorage.setItem(`daily_play_${dateKey}`, 'true')
    }
  },

  reset: () =>
    set({
      salary: 0,
      bills: [],
      correctAnswer: [],
      selectedBills: [],
      hasPlayedToday: false,
      playChecked: false,
      gameResult: null,
      serverError: false,
    }),
}))
