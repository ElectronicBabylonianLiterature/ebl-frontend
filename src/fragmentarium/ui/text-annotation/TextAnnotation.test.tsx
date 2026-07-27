import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import { UpdateNamedEntityAnnotations } from 'fragmentarium/ui/text-annotation/SpanAnnotationDisplay'
import {
  renderTextAnnotation,
  testAnnotations,
} from 'fragmentarium/ui/text-annotation/textAnnotationRender.testSupport'

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

describe('Named Entity Annotation', () => {
  let container: HTMLElement
  let updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>

  const setup = async (): Promise<void> => {
    ;({ container, updateNamedEntityAnnotations } =
      await renderTextAnnotation(fragmentServiceMock))
  }

  it('shows the annotation interface', async () => {
    await setup()
    expect(container).toMatchSnapshot()
  })

  it.each(
    testAnnotations.namedEntities.flatMap((annotation) =>
      annotation.span.map((wordId) => [`${wordId}__${annotation.id}`]),
    ),
  )('shows the named entity annotation for %s', async (testId) => {
    await setup()
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('calls updateNamedEntityAnnotations on save', async () => {
    await setup()
    const saveButton = screen.getByLabelText('save-annotations')
    await userEvent.click(screen.getByTestId('Word-2__Entity-1'))
    await screen.findByLabelText('delete-name-annotation')
    await userEvent.click(screen.getByLabelText('delete-name-annotation'))

    await userEvent.click(saveButton)
    expect(updateNamedEntityAnnotations).toHaveBeenCalledWith({
      namedEntities: testAnnotations.namedEntities.filter(
        (entity) => entity.id !== 'Entity-1',
      ),
      realia: [],
    })
  })
})
