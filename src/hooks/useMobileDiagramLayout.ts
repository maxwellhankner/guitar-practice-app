import type { DiagramLayout } from '../db/userSettingsRepository'

/**
 * Returns the saved diagram layout.
 * Viewport size / orientation must not override the user's panel orientation.
 */
export function useMobileDiagramLayout(
  savedLayout: DiagramLayout,
): DiagramLayout {
  return savedLayout
}
