import type { PaddingOptions } from 'maplibre-gl'

export const NO_PANEL_PADDING: PaddingOptions = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

export type PanelPaddingSide = 'right' | 'bottom'
export function panelPadding(
  side: PanelPaddingSide,
  sizePx: number,
): PaddingOptions {
  if (sizePx <= 0) return NO_PANEL_PADDING

  return { ...NO_PANEL_PADDING, [side]: sizePx }
}

function paddingEquals(left: PaddingOptions, right: PaddingOptions): boolean {
  return (
    (left.top ?? 0) === (right.top ?? 0) &&
    (left.right ?? 0) === (right.right ?? 0) &&
    (left.bottom ?? 0) === (right.bottom ?? 0) &&
    (left.left ?? 0) === (right.left ?? 0)
  )
}

export { paddingEquals }
