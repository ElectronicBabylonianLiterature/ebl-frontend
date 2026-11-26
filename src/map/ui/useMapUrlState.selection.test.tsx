import { act, screen } from '@testing-library/react'
import {
  HASH_TEST_ID,
  SEARCH_TEST_ID,
  SELECTION_TEST_ID,
  renderHarness,
} from 'map/ui/useMapUrlState.testSupport'

it('writes and clears area-only selections while preserving explicit visibility and unrelated state', () => {
  renderHarness('/tools/map?source=archive&areas=0#location')
  act(() => screen.getByText('select-area').click())
  expect(screen.getByTestId(SELECTION_TEST_ID)).toHaveTextContent(
    'assur-area-a',
  )
  expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
    'selected=area%3Aassur-area-a',
  )
  expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('areas=0')
  expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('source=archive')
  act(() => screen.getByText('clear-area').click())
  expect(screen.getByTestId(SELECTION_TEST_ID)).toBeEmptyDOMElement()
  expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent('selected=')
  expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent('areas=0')
  expect(screen.getByTestId(HASH_TEST_ID)).toHaveTextContent('#location')
})

it('cancels a pending area URL write when selection is cleared before navigation renders', () => {
  renderHarness('/tools/map?source=archive#location')

  act(() => screen.getByText('select-and-clear-area').click())

  expect(screen.getByTestId(SELECTION_TEST_ID)).toBeEmptyDOMElement()
  expect(screen.getByTestId(SEARCH_TEST_ID)).toHaveTextContent(
    '?source=archive',
  )
  expect(screen.getByTestId(SEARCH_TEST_ID)).not.toHaveTextContent('selected=')
  expect(screen.getByTestId(HASH_TEST_ID)).toHaveTextContent('#location')
})
