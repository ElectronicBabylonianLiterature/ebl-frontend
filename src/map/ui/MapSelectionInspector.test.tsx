import React, { useEffect, useRef } from 'react'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ExcavationPolygonIndex } from 'map/domain/excavationPolygonIndex'
import MapSelectionInspector from 'map/ui/MapSelectionInspector'
import useMapResearchSelection from 'map/ui/useMapResearchSelection'
import { excavationPolygon } from 'test-support/map-fixtures'

const UNNAMED = excavationPolygon({ name: undefined })
const INDEX: ExcavationPolygonIndex = new Map([['assur', [UNNAMED]]])

function Harness({
  focusInspector,
}: {
  readonly focusInspector?: boolean
}): JSX.Element {
  const searchContainer = useRef<HTMLDivElement>(null)
  const research = useMapResearchSelection(searchContainer, '')
  const { selectArea } = research
  useEffect(() => {
    if (focusInspector === undefined) selectArea(UNNAMED.polygonId)
    else selectArea(UNNAMED.polygonId, document.body, focusInspector)
  }, [focusInspector, selectArea])
  return (
    <MemoryRouter>
      <MapSelectionInspector
        research={research}
        provenances={[]}
        polygonIndex={INDEX}
      />
    </MemoryRouter>
  )
}

it('announces an unnamed area generically when the inspector is not focused', async () => {
  render(<Harness focusInspector={false} />)
  expect(
    await screen.findByText(
      'Showing details for the selected excavation area.',
    ),
  ).toHaveAttribute('role', 'status')
  expect(screen.getByRole('region', { name: 'Location details' })).toBeVisible()
})

it('focuses the inspector instead of announcing when area selection uses defaults', async () => {
  render(<Harness />)
  const inspector = await screen.findByRole('region', {
    name: 'Location details',
  })
  expect(within(inspector).getByRole('heading')).toHaveFocus()
  expect(screen.queryByText(/^Showing details for /)).not.toBeInTheDocument()
})
