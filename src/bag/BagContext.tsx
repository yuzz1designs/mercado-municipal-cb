import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { groupBag, type BagGroup, type BagItems, type BagNotes } from './order'

/*
 * Shopping bag state, shared by the header button, the producer card and the bag panel.
 * Kept in localStorage so a reload doesn't empty it (a per-browser convenience only).
 */

const STORAGE_KEY = 'mercado-cb:bag'

type BagState = { items: BagItems; notes: BagNotes }

type BagContextValue = {
  groups: BagGroup[]
  /** Number of different products in the bag */
  count: number
  quantity: (producerId: string, product: string) => number
  setQuantity: (producerId: string, product: string, quantity: number) => void
  /** Number of different products from one producer */
  countFor: (producerId: string) => number
  note: (producerId: string) => string
  setNote: (producerId: string, note: string) => void
  removeProducer: (producerId: string) => void
  clear: () => void
  isOpen: boolean
  open: () => void
  close: () => void
}

const BagContext = createContext<BagContextValue | null>(null)

const empty: BagState = { items: {}, notes: {} }

function load(): BagState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? { ...empty, ...JSON.parse(saved) } : empty
  } catch {
    return empty
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BagState>(load)
  const [isOpen, setOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable (private mode, blocked): the bag still works for this visit
    }
  }, [state])

  const setQuantity = useCallback((producerId: string, product: string, quantity: number) => {
    setState((current) => {
      const lines = { ...current.items[producerId] }
      if (quantity > 0) lines[product] = quantity
      else delete lines[product]
      const items = { ...current.items }
      if (Object.keys(lines).length) items[producerId] = lines
      else delete items[producerId]
      return { ...current, items }
    })
  }, [])

  const setNote = useCallback((producerId: string, note: string) => {
    setState((current) => ({ ...current, notes: { ...current.notes, [producerId]: note } }))
  }, [])

  const removeProducer = useCallback((producerId: string) => {
    setState((current) => {
      const items = { ...current.items }
      const notes = { ...current.notes }
      delete items[producerId]
      delete notes[producerId]
      return { items, notes }
    })
  }, [])

  const value = useMemo<BagContextValue>(() => {
    const groups = groupBag(state.items, state.notes)
    return {
      groups,
      count: groups.reduce((total, group) => total + group.lines.length, 0),
      quantity: (producerId, product) => state.items[producerId]?.[product] ?? 0,
      setQuantity,
      countFor: (producerId) => Object.keys(state.items[producerId] ?? {}).length,
      note: (producerId) => state.notes[producerId] ?? '',
      setNote,
      removeProducer,
      clear: () => setState(empty),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }
  }, [state, isOpen, setQuantity, setNote, removeProducer])

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export function useBag() {
  const context = useContext(BagContext)
  if (!context) throw new Error('useBag must be used inside <BagProvider>')
  return context
}
