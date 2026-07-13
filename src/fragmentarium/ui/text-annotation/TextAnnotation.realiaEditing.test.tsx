import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'
import Bluebird from 'bluebird'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  mockRealiaSearch,
  realiaServiceMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')

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

const annotatedEntry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
  type: ['Divine names'],
})
const otherEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Divine names'],
})

const annotations: AnnotationSpans = {
  namedEntities: [],
  realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-2'] }],
}

async function setup(): Promise<void> {
  jest.clearAllMocks()
  fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
  fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(annotations)
  realiaServiceMock.find.mockReturnValue(Bluebird.resolve(annotatedEntry))
  mockRealiaSearch([otherEntry])

  render(
    <ThemeProvider>
      <WithRealiaService>
        <TextAnnotation
          fragmentService={fragmentServiceMock}
          number={tokenIdFragment.number}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')
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

    const input = await screen.findByLabelText('edit-realia')
    await userEvent.type(input, 'Zig')
    await userEvent.click(await screen.findByText('Ziggurat'))

    expect(screen.getByLabelText('edit-realia')).toBeInTheDocument()
    expect(screen.getByText('Ziggurat')).toBeInTheDocument()
  })

  it('applies the picked realia and relabels the indicator', async () => {
    await setup()

    await userEvent.click(await screen.findByTestId('Word-2__Realia-1'))
    await userEvent.type(await screen.findByLabelText('edit-realia'), 'Zig')
    await userEvent.click(await screen.findByText('Ziggurat'))
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
