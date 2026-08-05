import { screen, waitFor } from '@testing-library/react'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  AnnotationSaveResult,
  UpdateNamedEntityAnnotations,
} from 'fragmentarium/ui/text-annotation/annotationSave'
import { updateNamedEntityAnnotationsMock } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import {
  annotatedFragment,
  deleteTagAndSave,
  openAnnotationEditor,
  saveButton,
  savedAnnotations as annotations,
} from 'fragmentarium/ui/text-annotation/annotationSave.testSupport'
import { withAnnotationSpans } from 'test-support/annotated-fragment'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('react-bootstrap', () =>
  jest
    .requireActual('fragmentarium/ui/text-annotation/overlayStub.testSupport')
    .reactBootstrapWithVisibleOverlay(),
)

const derivedFields = ['tier', 'name', 'layer']

describe('saving both annotation layers', () => {
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  beforeEach(async () => {
    updateNamedEntityAnnotations =
      updateNamedEntityAnnotationsMock(annotatedFragment)
    await openAnnotationEditor(updateNamedEntityAnnotations)
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
    expect(saveButton()).toBeDisabled()
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

    await openAnnotationEditor(
      updateNamedEntityAnnotationsMock(annotatedFragment),
      withAnnotationSpans(annotatedFragment, duplicated),
    )

    expect(screen.queryByTestId('Word-2__Entity-3')).not.toBeInTheDocument()
    expect(screen.queryByTestId('Word-2__R-2')).not.toBeInTheDocument()
    expect(saveButton()).toBeDisabled()
  })
})

describe('when saving fails', () => {
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  beforeEach(async () => {
    updateNamedEntityAnnotations = jest.fn<
      Promise<AnnotationSaveResult>,
      [AnnotationSpans]
    >(() => Promise.reject(new Error('Save failed.')))
    await openAnnotationEditor(updateNamedEntityAnnotations)
    await deleteTagAndSave()
  })

  it('stops the saving spinner', async () => {
    await waitFor(() =>
      expect(screen.queryByRole('status')).not.toBeInTheDocument(),
    )
  })

  it('leaves the annotations dirty so the save can be retried', async () => {
    await waitFor(() => expect(saveButton()).toBeEnabled())
    expect(updateNamedEntityAnnotations).toHaveBeenCalledTimes(1)
  })
})
