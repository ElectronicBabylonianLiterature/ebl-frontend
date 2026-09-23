import React from 'react'
import Bluebird from 'bluebird'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import { produce } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  updateNamedEntityAnnotationsMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { withAnnotationSpans } from 'test-support/annotated-fragment'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

const firstAnnotations: AnnotationSpans = {
  namedEntities: [{ id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-2'] }],
  realia: [],
}
const secondAnnotations: AnnotationSpans = {
  namedEntities: [{ id: 'Entity-9', type: 'ROYAL_NAME', span: ['Word-3'] }],
  realia: [],
}

const firstFragment: Fragment = withAnnotationSpans(
  tokenIdFragment,
  firstAnnotations,
)
const otherFragment: Fragment = produce(
  withAnnotationSpans(tokenIdFragment, secondAnnotations),
  (draft) => {
    draft.number = 'K.2'
  },
)

function renderAt(number: string): { rerender: (number: string) => void } {
  const view = render(
    <ThemeProvider>
      <WithRealiaService>
        <TextAnnotation
          fragmentService={fragmentServiceMock}
          number={number}
          updateNamedEntityAnnotations={updateNamedEntityAnnotationsMock(
            tokenIdFragment,
          )}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  return {
    rerender: (next: string) =>
      view.rerender(
        <ThemeProvider>
          <WithRealiaService>
            <TextAnnotation
              fragmentService={fragmentServiceMock}
              number={next}
              updateNamedEntityAnnotations={updateNamedEntityAnnotationsMock(
                tokenIdFragment,
              )}
            />
          </WithRealiaService>
        </ThemeProvider>,
      ),
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  fragmentServiceMock.find.mockImplementation((number: string) =>
    Bluebird.resolve(
      number === tokenIdFragment.number ? firstFragment : otherFragment,
    ),
  )
})

describe('when the editor loads', () => {
  it('reads the annotations from the fragment in a single request', async () => {
    renderAt(tokenIdFragment.number)

    expect(await screen.findByTestId('Word-2__Entity-1')).toBeInTheDocument()
    expect(fragmentServiceMock.find).toHaveBeenCalledTimes(1)
  })
})

describe('when the fragment changes without a remount', () => {
  it('refetches the fragment for the new number', async () => {
    const { rerender } = renderAt(tokenIdFragment.number)
    expect(await screen.findByTestId('Word-2__Entity-1')).toBeInTheDocument()

    rerender('K.2')

    await waitFor(() =>
      expect(fragmentServiceMock.find).toHaveBeenCalledWith('K.2'),
    )
  })

  it('reseeds the annotation state instead of keeping the previous fragment', async () => {
    const { rerender } = renderAt(tokenIdFragment.number)
    expect(await screen.findByTestId('Word-2__Entity-1')).toBeInTheDocument()

    rerender('K.2')

    expect(await screen.findByTestId('Word-3__Entity-9')).toBeInTheDocument()
    expect(screen.queryByTestId('Word-2__Entity-1')).not.toBeInTheDocument()
  })
})
