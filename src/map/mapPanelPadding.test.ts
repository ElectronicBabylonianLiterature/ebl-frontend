import {
  NO_PANEL_PADDING,
  paddingEquals,
  panelPadding,
} from './mapPanelPadding'

describe('panelPadding', () => {
  it('reserves the requested side', () => {
    expect(panelPadding('right', 360)).toEqual({
      top: 0,
      right: 360,
      bottom: 0,
      left: 0,
    })
    expect(panelPadding('bottom', 240)).toEqual({
      top: 0,
      right: 0,
      bottom: 240,
      left: 0,
    })
  })

  it('is zero padding for a non-positive size', () => {
    expect(panelPadding('right', 0)).toEqual(NO_PANEL_PADDING)
    expect(panelPadding('right', -10)).toEqual(NO_PANEL_PADDING)
  })
})

describe('paddingEquals', () => {
  it('is true for identical padding', () => {
    expect(
      paddingEquals(panelPadding('right', 360), panelPadding('right', 360)),
    ).toBe(true)
  })

  it('is false when a side differs', () => {
    expect(
      paddingEquals(panelPadding('right', 360), panelPadding('right', 200)),
    ).toBe(false)
  })

  it('treats an omitted field as zero', () => {
    expect(paddingEquals({ top: 0 }, NO_PANEL_PADDING)).toBe(true)
  })

  it('compares every field, not only right', () => {
    expect(paddingEquals({ top: 5 }, NO_PANEL_PADDING)).toBe(false)
    expect(paddingEquals({ bottom: 5 }, NO_PANEL_PADDING)).toBe(false)
    expect(paddingEquals({ left: 5 }, NO_PANEL_PADDING)).toBe(false)
  })
})
