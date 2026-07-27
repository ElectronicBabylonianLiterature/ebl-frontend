import React from 'react'
import { produce } from 'immer'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { UpdateNamedEntityAnnotations } from 'fragmentarium/ui/text-annotation/SpanAnnotationDisplay'
import {
  updateNamedEntityAnnotationsMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { tokenIdFragment } from 'test-support/fragment-fixtures'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('react-bootstrap', () =>
  jest
    .requireActual('fragmentarium/ui/text-annotation/overlayStub.testSupport')
    .reactBootstrapWithVisibleOverlay(),
)

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

const annotatedFragment: Fragment = produce(tokenIdFragment, (draft) => {
  draft.realiaInfo = [
    { realiaId: 'realia_000846', lemma: 'Apkallu', type: ['Divine names'] },
  ]
})

const annotations: AnnotationSpans = {
  namedEntities: [
    { id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-2'] },
    { id: 'Entity-2', type: 'BUILDING_NAME', span: ['Word-2', 'Word-3'] },
  ],
  realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-2'] }],
}

const derivedFields = ['tier', 'name', 'layer']

async function setup(
  updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>,
  loaded: AnnotationSpans = annotations,
): Promise<void> {
  jest.clearAllMocks()
  fragmentServiceMock.find.mockResolvedValue(annotatedFragment)
  fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(loaded)

  render(
    <ThemeProvider>
      <WithRealiaService>
        <TextAnnotation
          fragmentService={fragmentServiceMock}
          number={annotatedFragment.number}
          updateNamedEntityAnnotations={updateNamedEntityAnnotations}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')
}

async function deleteTagAndSave(): Promise<void> {
  await userEvent.click(screen.getByTestId('Word-2__Entity-1'))
  await userEvent.click(await screen.findByLabelText('delete-name-annotation'))
  await userEvent.click(screen.getByLabelText('save-annotations'))
}

describe('saving both annotation layers', () => {
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  beforeEach(async () => {
    updateNamedEntityAnnotations =
      updateNamedEntityAnnotationsMock(annotatedFragment)
    await setup(updateNamedEntityAnnotations)
  })

  it('submits both lists together', async () => {
    await deleteTagAndSave()

    expect(updateNamedEntityAnnotations).toHaveBeenCalledWith({
      namedEntities: [annotations.namedEntities[1]],
      realia: annotations.realia,
    })
  })

  it('strips the derived fields from every submitted span', async () => {
    await deleteTagAndSave()

    const [submitted] = updateNamedEntityAnnotations.mock.calls[0]
    const spans = [...submitted.namedEntities, ...submitted.realia]

    expect(spans).toHaveLength(2)
    spans.forEach((span) =>
      derivedFields.forEach((field) => expect(span).not.toHaveProperty(field)),
    )
  })

  it('disables saving until an annotation changes', async () => {
    expect(screen.getByLabelText('save-annotations')).toBeDisabled()
  })
})

describe('when the loaded annotations contain duplicates', () => {
  it('drops them without reporting unsaved changes', async () => {
    const duplicated: AnnotationSpans = {
      namedEntities: [
        ...annotations.namedEntities,
        { ...annotations.namedEntities[0], id: 'Entity-3' },
      ],
      realia: [...annotations.realia, { ...annotations.realia[0], id: 'R-2' }],
    }

    await setup(updateNamedEntityAnnotationsMock(annotatedFragment), duplicated)

    expect(screen.queryByTestId('Word-2__Entity-3')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Word-2__R-2')).not.toBeInTheDocument()
    expect(screen.getByLabelText('save-annotations')).toBeDisabled()
  })
})

describe('when saving fails', () => {
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  beforeEach(async () => {
    updateNamedEntityAnnotations = jest.fn<
      Promise<Fragment>,
      [AnnotationSpans]
    >(() => Promise.reject(new Error('Save failed.')))
    await setup(updateNamedEntityAnnotations)
    await deleteTagAndSave()
  })

  it('stops the saving spinner', async () => {
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    )
  })

  it('leaves the annotations dirty so the save can be retried', async () => {
    await waitFor(() =>
      expect(screen.getByLabelText('save-annotations')).toBeEnabled(),
    )
    expect(updateNamedEntityAnnotations).toHaveBeenCalledTimes(1)
  })
})
