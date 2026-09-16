import { act, renderHook } from '@testing-library/react'
import type { MapExperience } from './useMapExperience'
import type { MapPanelController } from './useMapPanel'
import type { HistoricalMapPanel } from './useHistoricalMapPanel'
import type { ActiveMapPanel } from './mapPanel'
import type { MapSelection } from './mapSelection'
import useMapSelectionActions from './useMapSelectionActions'

function experienceWith(selection: MapSelection | null): MapExperience {
  return {
    selection,
    setSelection: jest.fn(),
  } as unknown as MapExperience
}

function panelWith(active: ActiveMapPanel): MapPanelController {
  return {
    active,
    open: jest.fn(),
    toggle: jest.fn(),
    close: jest.fn(),
  }
}

function historicalPanel(): HistoricalMapPanel {
  return {
    groups: [],
    series: [],
    filter: '',
    expandedSiteIds: new Set(),
    setFilter: jest.fn(),
    setExpandedSiteIds: jest.fn(),
    findSeries: jest.fn(),
    browseSite: jest.fn(),
  }
}

describe('useMapSelectionActions', () => {
  it('opens the inspector when a feature is selected', () => {
    const experience = experienceWith(null)
    const mapPanel = panelWith(null)
    const { result } = renderHook(() =>
      useMapSelectionActions(
        experience,
        mapPanel,
        historicalPanel(),
        jest.fn(),
      ),
    )

    act(() => result.current.selectFeature({ type: 'site', provenanceId: 'a' }))

    expect(experience.setSelection).toHaveBeenCalledWith({
      type: 'site',
      provenanceId: 'a',
    })
    expect(mapPanel.open).toHaveBeenCalledWith('inspector')
  })

  it('dismissSelection closes the inspector when it is the open panel', () => {
    const experience = experienceWith({ type: 'site', provenanceId: 'a' })
    const mapPanel = panelWith('inspector')
    const setHoverPreview = jest.fn()
    const { result } = renderHook(() =>
      useMapSelectionActions(
        experience,
        mapPanel,
        historicalPanel(),
        setHoverPreview,
      ),
    )

    act(() => result.current.dismissSelection())

    expect(experience.setSelection).toHaveBeenCalledWith(null)
    expect(setHoverPreview).toHaveBeenCalledWith(null)
    expect(mapPanel.close).toHaveBeenCalledTimes(1)
  })

  it('dismissSelection leaves an unrelated open panel alone', () => {
    const experience = experienceWith({ type: 'site', provenanceId: 'a' })
    const mapPanel = panelWith('export')
    const { result } = renderHook(() =>
      useMapSelectionActions(
        experience,
        mapPanel,
        historicalPanel(),
        jest.fn(),
      ),
    )

    act(() => result.current.dismissSelection())

    expect(experience.setSelection).toHaveBeenCalledWith(null)
    expect(mapPanel.close).not.toHaveBeenCalled()
  })

  it('deselectFeature clears the selection without touching the panel', () => {
    const experience = experienceWith({ type: 'site', provenanceId: 'a' })
    const mapPanel = panelWith('inspector')
    const { result } = renderHook(() =>
      useMapSelectionActions(
        experience,
        mapPanel,
        historicalPanel(),
        jest.fn(),
      ),
    )

    act(() => result.current.deselectFeature())

    expect(experience.setSelection).toHaveBeenCalledWith(null)
    expect(mapPanel.close).not.toHaveBeenCalled()
  })

  it('browsing historical maps filters and opens the layers panel', () => {
    const experience = experienceWith(null)
    const mapPanel = panelWith(null)
    const panel = historicalPanel()
    const { result } = renderHook(() =>
      useMapSelectionActions(experience, mapPanel, panel, jest.fn()),
    )

    act(() => result.current.browseHistoricalMaps('Aššur'))

    expect(panel.browseSite).toHaveBeenCalledWith('Aššur')
    expect(mapPanel.open).toHaveBeenCalledWith('layers')
  })

  describe('Escape', () => {
    function pressEscape(): void {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      })
    }

    it('closes the open panel first', () => {
      const experience = experienceWith({ type: 'site', provenanceId: 'a' })
      const mapPanel = panelWith('inspector')
      renderHook(() =>
        useMapSelectionActions(
          experience,
          mapPanel,
          historicalPanel(),
          jest.fn(),
        ),
      )

      pressEscape()

      expect(mapPanel.close).toHaveBeenCalledTimes(1)
      expect(experience.setSelection).not.toHaveBeenCalled()
    })

    it('clears the selection on a second press once no panel is open', () => {
      const experience = experienceWith({ type: 'site', provenanceId: 'a' })
      const mapPanel = panelWith(null)
      const setHoverPreview = jest.fn()
      renderHook(() =>
        useMapSelectionActions(
          experience,
          mapPanel,
          historicalPanel(),
          setHoverPreview,
        ),
      )

      pressEscape()

      expect(experience.setSelection).toHaveBeenCalledWith(null)
      expect(setHoverPreview).toHaveBeenCalledWith(null)
    })

    it('does nothing when neither a panel nor a selection remain', () => {
      const experience = experienceWith(null)
      const mapPanel = panelWith(null)
      renderHook(() =>
        useMapSelectionActions(
          experience,
          mapPanel,
          historicalPanel(),
          jest.fn(),
        ),
      )

      pressEscape()

      expect(mapPanel.close).not.toHaveBeenCalled()
      expect(experience.setSelection).not.toHaveBeenCalled()
    })

    it('ignores other keys', () => {
      const experience = experienceWith({ type: 'site', provenanceId: 'a' })
      const mapPanel = panelWith('inspector')
      renderHook(() =>
        useMapSelectionActions(
          experience,
          mapPanel,
          historicalPanel(),
          jest.fn(),
        ),
      )

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
      })

      expect(mapPanel.close).not.toHaveBeenCalled()
    })

    it('removes its listener on unmount', () => {
      const experience = experienceWith(null)
      const mapPanel = panelWith(null)
      const { unmount } = renderHook(() =>
        useMapSelectionActions(
          experience,
          mapPanel,
          historicalPanel(),
          jest.fn(),
        ),
      )

      unmount()
      pressEscape()

      expect(mapPanel.close).not.toHaveBeenCalled()
    })
  })
})
