import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import {
  AnnotationSaveResult,
  refreshFailedMessage,
  UpdateNamedEntityAnnotations,
} from 'fragmentarium/ui/text-annotation/annotationSave'
import {
  annotatedFragment,
  deleteTag,
  openAnnotationEditor,
  saveButton,
  savedAnnotations as annotations,
} from 'fragmentarium/ui/text-annotation/annotationSave.testSupport'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('react-bootstrap', () =>
  jest
    .requireActual('fragmentarium/ui/text-annotation/overlayStub.testSupport')
    .reactBootstrapWithVisibleOverlay(),
)

function resultMock(
  refreshError: Error | null,
): jest.MockedFunction<UpdateNamedEntityAnnotations> {
  return jest.fn<Promise<AnnotationSaveResult>, [AnnotationSpans]>(() =>
    Promise.resolve({ fragment: annotatedFragment, refreshError }),
  )
}

describe('when persistence and refresh both succeed', () => {
  beforeEach(async () => {
    await openAnnotationEditor(resultMock(null))
    await deleteTag('Word-2__Entity-1')
    await userEvent.click(saveButton())
  })

  it('marks the annotations as saved', async () => {
    await waitFor(() => expect(saveButton()).toBeDisabled())
  })

  it('reports no refresh problem', () => {
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('when persistence succeeds but the refresh fails', () => {
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  beforeEach(async () => {
    updateNamedEntityAnnotations = resultMock(new Error('Refresh failed.'))
    await openAnnotationEditor(updateNamedEntityAnnotations)
    await deleteTag('Word-2__Entity-1')
    await userEvent.click(saveButton())
  })

  it('does not report the save as failed', async () => {
    expect(await screen.findByRole('alert')).toHaveTextContent(
      refreshFailedMessage,
    )
  })

  it('marks the annotations as saved rather than leaving them dirty', async () => {
    await waitFor(() => expect(saveButton()).toBeDisabled())
  })

  it('cannot be retried, so the save is not duplicated', async () => {
    await waitFor(() => expect(saveButton()).toBeDisabled())

    await userEvent.click(saveButton())

    expect(updateNamedEntityAnnotations).toHaveBeenCalledTimes(1)
  })
})

describe('when persistence fails', () => {
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  beforeEach(async () => {
    updateNamedEntityAnnotations = jest.fn<
      Promise<AnnotationSaveResult>,
      [AnnotationSpans]
    >(() => Promise.reject(new Error('Save failed.')))
    await openAnnotationEditor(updateNamedEntityAnnotations)
    await deleteTag('Word-2__Entity-1')
    await userEvent.click(saveButton())
  })

  it('reports the failure', async () => {
    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed.')
  })

  it('leaves the annotations dirty so the save can be retried', async () => {
    await waitFor(() => expect(saveButton()).toBeEnabled())

    await userEvent.click(saveButton())

    expect(updateNamedEntityAnnotations).toHaveBeenCalledTimes(2)
  })
})

describe('when the annotations change while the save is in flight', () => {
  it('keeps the newer edit dirty instead of marking it saved', async () => {
    let resolveSave: (result: AnnotationSaveResult) => void = () => {}
    const updateNamedEntityAnnotations = jest.fn<
      Promise<AnnotationSaveResult>,
      [AnnotationSpans]
    >(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve
        }),
    )
    await openAnnotationEditor(updateNamedEntityAnnotations)
    await deleteTag('Word-2__Entity-1')
    await userEvent.click(saveButton())

    await deleteTag('Word-2__Entity-2')
    resolveSave({ fragment: annotatedFragment, refreshError: null })

    await waitFor(() => expect(saveButton()).toBeEnabled())
    expect(updateNamedEntityAnnotations).toHaveBeenCalledWith({
      namedEntities: [annotations.namedEntities[1]],
      realia: annotations.realia,
    })
  })
})
