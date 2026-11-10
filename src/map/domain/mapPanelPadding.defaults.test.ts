import { NO_PANEL_PADDING, paddingEquals } from 'map/domain/mapPanelPadding'
import type { PaddingOptions } from 'maplibre-gl'

it('treats partial renderer padding as zero on either side', (): void => {
  expect(paddingEquals({ top: 0 }, { left: 0 })).toBe(true)
  expect(paddingEquals(NO_PANEL_PADDING, { left: 0 })).toBe(true)
  expect(paddingEquals({ top: 0 }, NO_PANEL_PADDING)).toBe(true)
})

it.each(['top', 'right', 'bottom', 'left'] as const)(
  'detects a nonzero %s against an omitted renderer field',
  (side: 'top' | 'right' | 'bottom' | 'left'): void => {
    const offset = { [side]: 12 } as PaddingOptions
    expect(paddingEquals(offset, { top: 0 })).toBe(false)
    expect(paddingEquals({ top: 0 }, offset)).toBe(false)
  },
)
