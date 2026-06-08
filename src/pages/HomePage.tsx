import { useEffect, useId, useMemo, useState } from 'react'
import {
  CHORD_PRESETS,
  CHORD_MAJOR_IDS,
  CHORD_MINOR_IDS,
  Fretboard,
  chordsInKeyOrder,
  chordsForProgression,
  isChordInKey,
  chordRomanNumeral,
  KEY_DEFS,
  KEY_MAJOR_IDS,
  KEY_MINOR_IDS,
  PROGRESSIONS,
  PROGRESSION_IDS,
  PENTATONIC_KEYS,
  PENTATONIC_KEY_IDS,
  pentatonicPatternForWindow,
  type ChordPresetId,
  type KeyId,
  type ProgressionId,
  type PentatonicKeyId,
} from '../components/Fretboard'

const FRET_COUNT_OPTIONS = Array.from({ length: 16 }, (_, i) => i + 6)

type BoardSelection =
  | { kind: 'chord'; id: ChordPresetId }
  | { kind: 'pentatonic'; key: PentatonicKeyId }

export function HomePage() {
  const baseId = useId()
  const [fretCount, setFretCount] = useState(6)
  const [selection, setSelection] = useState<BoardSelection | null>({
    kind: 'chord',
    id: 'C',
  })
  const [displayNotes, setDisplayNotes] = useState(true)
  const [selectedKey, setSelectedKey] = useState<KeyId | null>(null)
  const [selectedProgression, setSelectedProgression] =
    useState<ProgressionId | null>(null)

  useEffect(() => {
    if (selectedKey == null) {
      setSelectedProgression(null)
    }
  }, [selectedKey])

  useEffect(() => {
    if (
      selectedKey == null ||
      selection?.kind !== 'chord' ||
      isChordInKey(selectedKey, selection.id)
    ) {
      return
    }
    setSelection(null)
  }, [selectedKey, selection])

  const visibleChordIds = useMemo(() => {
    if (selectedKey == null) {
      return [...CHORD_MAJOR_IDS, ...CHORD_MINOR_IDS]
    }
    if (selectedProgression != null) {
      return chordsForProgression(selectedKey, selectedProgression)
    }
    return chordsInKeyOrder(selectedKey)
  }, [selectedKey, selectedProgression])

  useEffect(() => {
    if (
      selectedKey == null ||
      selectedProgression == null ||
      selection?.kind !== 'chord' ||
      visibleChordIds.includes(selection.id)
    ) {
      return
    }
    setSelection(null)
  }, [selectedKey, selectedProgression, selection, visibleChordIds])

  const scalePattern = useMemo(() => {
    if (selection?.kind !== 'pentatonic') {
      return null
    }
    return pentatonicPatternForWindow(selection.key, fretCount)
  }, [selection, fretCount])

  return (
    <main className="app-page">
      <section
        className="app-page__options"
        aria-labelledby={`${baseId}-heading`}
      >
        <div className="app-page__inner">
          <h1 className="app-page__title" id={`${baseId}-heading`}>
            Guitar diagram
          </h1>
          <div className="diagram-controls">
            <div className="diagram-field diagram-field--notes-frets">
              <div className="diagram-notes-frets">
                <div className="diagram-notes-frets__notes">
                  <p className="diagram-label" id={`${baseId}-notes-label`}>
                    Notes
                  </p>
                  <div
                    className="diagram-notes-toggle"
                    role="group"
                    aria-labelledby={`${baseId}-notes-label`}
                  >
                    <button
                      type="button"
                      className={
                        displayNotes
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={displayNotes}
                      onClick={() => setDisplayNotes(true)}
                    >
                      On
                    </button>
                    <button
                      type="button"
                      className={
                        !displayNotes
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={!displayNotes}
                      onClick={() => setDisplayNotes(false)}
                    >
                      Off
                    </button>
                  </div>
                </div>
                <div
                  className="diagram-notes-frets__divider"
                  aria-hidden
                />
                <div className="diagram-notes-frets__frets">
                  <p className="diagram-label" id={`${baseId}-frets-label`}>
                    Frets
                  </p>
                  <div
                    className="diagram-chord-grid diagram-fret-grid"
                    role="group"
                    aria-labelledby={`${baseId}-frets-label`}
                  >
                    {FRET_COUNT_OPTIONS.map((n) => {
                      const selected = fretCount === n
                      return (
                        <button
                          key={n}
                          type="button"
                          className={
                            selected
                              ? 'diagram-chord-btn diagram-chord-btn--selected'
                              : 'diagram-chord-btn'
                          }
                          aria-pressed={selected}
                          onClick={() => setFretCount(n)}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-key-label`}>
                Key
              </p>
              <div
                className="diagram-chord-grid diagram-key-select-grid"
                role="group"
                aria-labelledby={`${baseId}-key-label`}
              >
                {[...KEY_MAJOR_IDS, ...KEY_MINOR_IDS].map((keyId) => {
                  const def = KEY_DEFS[keyId]
                  const selected = selectedKey === keyId
                  return (
                    <button
                      key={keyId}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      title={def.name}
                      onClick={() =>
                        setSelectedKey((cur) => (cur === keyId ? null : keyId))
                      }
                    >
                      {def.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-progression-label`}>
                Progression
              </p>
              <div
                className="diagram-chord-grid diagram-progression-grid"
                role="group"
                aria-labelledby={`${baseId}-progression-label`}
              >
                {PROGRESSION_IDS.map((progressionId) => {
                  const def = PROGRESSIONS[progressionId]
                  const selected = selectedProgression === progressionId
                  const disabled = selectedKey == null
                  return (
                    <button
                      key={progressionId}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      disabled={disabled}
                      title={
                        disabled
                          ? 'Select a key first'
                          : `${def.label} in ${KEY_DEFS[selectedKey!].name}`
                      }
                      onClick={() =>
                        setSelectedProgression((cur) =>
                          cur === progressionId ? null : progressionId,
                        )
                      }
                    >
                      {def.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-chord-label`}>
                Chord
              </p>
              {selectedKey != null ? (
                <div
                  className="diagram-chord-in-key"
                  style={{
                    gridTemplateColumns: `repeat(${visibleChordIds.length}, 1fr)`,
                  }}
                >
                  <div
                    className="diagram-chord-in-key__chords"
                    role="group"
                    aria-labelledby={`${baseId}-chord-label`}
                  >
                    {visibleChordIds.map((id) => {
                      const selected =
                        selection?.kind === 'chord' && selection.id === id
                      return (
                        <button
                          key={id}
                          type="button"
                          className={
                            selected
                              ? 'diagram-chord-btn diagram-chord-btn--selected'
                              : 'diagram-chord-btn'
                          }
                          aria-pressed={selected}
                          title={`${CHORD_PRESETS[id].name} · ${chordRomanNumeral(selectedKey, id) ?? ''} in ${KEY_DEFS[selectedKey].name}`}
                          onClick={() =>
                            setSelection((cur) =>
                              cur?.kind === 'chord' && cur.id === id
                                ? null
                                : { kind: 'chord', id },
                            )
                          }
                        >
                          {id}
                        </button>
                      )
                    })}
                  </div>
                  <div
                    className="diagram-chord-in-key__numerals"
                    aria-hidden
                  >
                    {visibleChordIds.map((id) => (
                      <span
                        key={`${id}-numeral`}
                        className="diagram-chord-roman"
                      >
                        {chordRomanNumeral(selectedKey, id)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="diagram-chord-grid diagram-chord-select-grid"
                  role="group"
                  aria-labelledby={`${baseId}-chord-label`}
                >
                  {visibleChordIds.map((id) => {
                    const selected =
                      selection?.kind === 'chord' && selection.id === id
                    return (
                      <button
                        key={id}
                        type="button"
                        className={
                          selected
                            ? 'diagram-chord-btn diagram-chord-btn--selected'
                            : 'diagram-chord-btn'
                        }
                        aria-pressed={selected}
                        title={CHORD_PRESETS[id].name}
                        onClick={() =>
                          setSelection((cur) =>
                            cur?.kind === 'chord' && cur.id === id
                              ? null
                              : { kind: 'chord', id },
                          )
                        }
                      >
                        {id}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="diagram-field">
              <p className="diagram-label" id={`${baseId}-pent-label`}>
                Pentatonic
              </p>
              <div
                className="diagram-chord-grid"
                role="group"
                aria-labelledby={`${baseId}-pent-label`}
              >
                {PENTATONIC_KEY_IDS.map((keyId) => {
                  const def = PENTATONIC_KEYS[keyId]
                  const selected =
                    selection?.kind === 'pentatonic' && selection.key === keyId
                  return (
                    <button
                      key={keyId}
                      type="button"
                      className={
                        selected
                          ? 'diagram-chord-btn diagram-chord-btn--selected'
                          : 'diagram-chord-btn'
                      }
                      aria-pressed={selected}
                      title={def.name}
                      onClick={() =>
                        setSelection((cur) =>
                          cur?.kind === 'pentatonic' && cur.key === keyId
                            ? null
                            : { kind: 'pentatonic', key: keyId },
                        )
                      }
                    >
                      {def.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-page__diagram" aria-label="Fretboard preview">
        <div className="app-page__diagram-stage">
          <Fretboard
            chord={selection?.kind === 'chord' ? selection.id : null}
            scalePattern={scalePattern}
            fretCount={fretCount}
            displayNotes={displayNotes}
          />
        </div>
      </section>
    </main>
  )
}
