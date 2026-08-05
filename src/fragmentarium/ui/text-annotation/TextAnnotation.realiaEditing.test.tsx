import React from 'react'
import { produce } from 'immer'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { withAnnotationSpans } from 'test-support/annotated-fragment'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import { SEARCH_DEBOUNCE_MS } from 'fragmentarium/ui/text-annotation/realiaOptionLoader'
import {
  mockRealiaSearch,
  updateNamedEntityAnnotationsMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')

const debouncedSearchTimeout = SEARCH_DEBOUNCE_MS + 3000

jest.mock('react-bootstrap', () => {
  const actual = jest.requireActual('react-bootstrap')
  return {
    ...actual,
    Overlay: ({
      children,
      show,
    }: {
      children: React.ReactNode
      show?: boolean
    }) => (show ? <>{children}</> : null),
  }
})

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

const otherEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Divine names'],
})

const annotations: AnnotationSpans = {
  namedEntities: [],
  realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-2'] }],
}

const annotatedFragment: Fragment = produce(
  withAnnotationSpans(tokenIdFragment, annotations),
  (draft) => {
    draft.realiaInfo = [
      { realiaId: 'realia_000846', lemma: 'Apkallu', type: ['Divine names'] },
    ]
  },
)

async function setup(): Promise<void> {
  jest.clearAllMocks()
  fragmentServiceMock.find.mockResolvedValue(annotatedFragment)
  mockRealiaSearch([otherEntry])

  render(
    <ThemeProvider>
      <WithRealiaService>
        <TextAnnotation
          fragmentService={fragmentServiceMock}
          number={tokenIdFragment.number}
          updateNamedEntityAnnotations={updateNamedEntityAnnotationsMock(
            annotatedFragment,
          )}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')
}

async function pickRealiaOption(query: string, label: string): Promise<void> {
  await userEvent.type(await screen.findByLabelText('edit-realia'), query)
  await userEvent.click(
    await screen.findByText(label, {}, { timeout: debouncedSearchTimeout }),
  )
}

describe('editing a realia annotation', () => {
  it('shows the resolved lemma on the indicator', async () => {
    await setup()

    expect(await screen.findByTestId('Word-2__Realia-1')).toHaveAttribute(
      'data-label',
      'Apkallu',
    )
  })

  it('keeps the newly picked realia displayed in the editor', async () => {
    await setup()

    await userEvent.click(await screen.findByTestId('Word-2__Realia-1'))

    await pickRealiaOption('Zig', 'Ziggurat')

    expect(screen.getByLabelText('edit-realia')).toBeInTheDocument()
    expect(screen.getByText('Ziggurat')).toBeInTheDocument()
  })

  it('applies the picked realia and relabels the indicator', async () => {
    await setup()

    await userEvent.click(await screen.findByTestId('Word-2__Realia-1'))
    await pickRealiaOption('Zig', 'Ziggurat')
    await userEvent.click(screen.getByLabelText('update-name-annotation'))

    expect(await screen.findByTestId('Word-2__Realia-1')).toHaveAttribute(
      'data-label',
      'Ziggurat',
    )
  })

  it('keeps the tag editor working on the same fragment', async () => {
    await setup()

    await userEvent.click(await screen.findByTestId('Word-2__Realia-1'))

    expect(screen.queryByLabelText('edit-named-entity')).not.toBeInTheDocument()
    expect(screen.getByLabelText('edit-realia')).toBeInTheDocument()
  })
})
