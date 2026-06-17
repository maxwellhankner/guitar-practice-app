export const ACCENT_COLOR_IDS = [
  'red',
  'orange',
  'gold',
  'green',
  'teal',
  'blue',
  'indigo',
  'violet',
  'pink',
] as const

export type AccentColorId = (typeof ACCENT_COLOR_IDS)[number]

export const DEFAULT_ACCENT_COLOR_ID: AccentColorId = 'gold'

export type AccentColorOption = {
  id: AccentColorId
  label: string
  /** Solid swatch shown in the picker grid. */
  swatch: string
}

export const ACCENT_COLOR_OPTIONS: readonly AccentColorOption[] = [
  { id: 'red', label: 'Red', swatch: '#dc2626' },
  { id: 'orange', label: 'Orange', swatch: '#ea580c' },
  { id: 'gold', label: 'Gold', swatch: '#ca8a04' },
  { id: 'green', label: 'Green', swatch: '#16a34a' },
  { id: 'teal', label: 'Teal', swatch: '#0d9488' },
  { id: 'blue', label: 'Blue', swatch: '#2563eb' },
  { id: 'indigo', label: 'Indigo', swatch: '#4f46e5' },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'pink', label: 'Pink', swatch: '#db2777' },
]

const accentColorIdSet = new Set<string>(ACCENT_COLOR_IDS)

export function sanitizeAccentColorId(value: unknown): AccentColorId {
  if (typeof value === 'string' && accentColorIdSet.has(value)) {
    return value as AccentColorId
  }
  return DEFAULT_ACCENT_COLOR_ID
}

export function accentColorLabel(id: AccentColorId): string {
  return ACCENT_COLOR_OPTIONS.find((option) => option.id === id)?.label ?? 'Gold'
}
