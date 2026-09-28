export const FRETBOARD_COLOR_IDS = [
  'rosewood',
  'maple',
  'oak',
  'mahogany',
  'walnut',
  'orange',
  'black',
  'blue',
  'green',
] as const

export type FretboardColorId = (typeof FRETBOARD_COLOR_IDS)[number]

export const DEFAULT_FRETBOARD_COLOR_ID: FretboardColorId = 'rosewood'

export const FRETBOARD_COLOR_OPTIONS: readonly {
  id: FretboardColorId
  label: string
  swatch: string
}[] = [
  { id: 'rosewood', label: 'Rosewood', swatch: '#1a1410' },
  { id: 'maple', label: 'Maple', swatch: '#f2e2c4' },
  { id: 'oak', label: 'Light oak', swatch: '#d4b07c' },
  { id: 'mahogany', label: 'Mahogany', swatch: '#6e382c' },
  { id: 'walnut', label: 'Walnut', swatch: '#5c4332' },
  { id: 'orange', label: 'Orange', swatch: '#d86a32' },
  { id: 'black', label: 'Black', swatch: '#0c0c0c' },
  { id: 'blue', label: 'Blue', swatch: '#3f7ea6' },
  { id: 'green', label: 'Green', swatch: '#3e8f78' },
]

const fretboardColorIdSet = new Set<string>(FRETBOARD_COLOR_IDS)

export function sanitizeFretboardColorId(value: unknown): FretboardColorId {
  if (typeof value === 'string' && fretboardColorIdSet.has(value)) {
    return value as FretboardColorId
  }
  return DEFAULT_FRETBOARD_COLOR_ID
}
