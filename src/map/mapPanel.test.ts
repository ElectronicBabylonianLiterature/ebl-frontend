import { isInteractivePanel, toggledPanel } from './mapPanel'

describe('toggledPanel', () => {
  it('opens a panel that was closed', () => {
    expect(toggledPanel(null, 'layers')).toBe('layers')
  })

  it('closes the panel when it is already active', () => {
    expect(toggledPanel('layers', 'layers')).toBeNull()
  })

  it('switches to a different panel, closing the previous one', () => {
    expect(toggledPanel('layers', 'terrain')).toBe('terrain')
  })
})

describe('isInteractivePanel', () => {
  it.each(['spatial-search', 'measurement'] as const)(
    'treats %s as an interactive drawing panel',
    (panel) => {
      expect(isInteractivePanel(panel)).toBe(true)
    },
  )

  it.each([
    'inspector',
    'layers',
    'visualization',
    'comparison',
    'timeline',
    'export',
    'terrain',
    null,
  ] as const)('does not treat %s as interactive', (panel) => {
    expect(isInteractivePanel(panel)).toBe(false)
  })
})
