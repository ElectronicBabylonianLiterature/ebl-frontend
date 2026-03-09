import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { render, screen, waitFor } from '@testing-library/react'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'

jest.mock('react-bootstrap', () => {
  const actual = jest.requireActual('react-bootstrap')
  return {
    ...actual,
    Overlay: ({
      children,
      show,
    }: {
      children:
        | React.ReactNode
        | ((props: Record<string, unknown>) => React.ReactNode)
      show?: boolean
    }) => {
      if (!show) {
        return null
      }

      if (typeof children === 'function') {
        return <>{children({})}</>
      }

      return <>{children}</>
    },
  }
})

jest.mock('fragmentarium/application/FragmentService')
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
let container: HTMLElement
const number = tokenIdFragment.number

const testAnnotations: readonly ApiEntityAnnotationSpan[] = [
  {
    id: 'Entity-1',
    type: 'PERSONAL_NAME',
    span: ['Word-2'],
  },
  {
    id: 'Entity-2',
    type: 'BUILDING_NAME',
    span: ['Word-2', 'Word-3'],
  },
  {
    id: 'Entity-3',
    type: 'YEAR_NAME',
    span: ['Word-4', 'Word-5', 'Word-6', 'Word-10'],
  },
]

describe('Named Entity Annotation', () => {
  const setup = async (): Promise<void> => {
    fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
    fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(
      testAnnotations,
    )
    fragmentServiceMock.updateNamedEntityAnnotations.mockResolvedValue(
      tokenIdFragment,
    )
    container = render(
      <ThemeProvider>
        <TextAnnotation fragmentService={fragmentServiceMock} number={number} />
      </ThemeProvider>,
    ).container
    await screen.findByLabelText('save-annotations')
  }
  it('shows the annotation interface', async () => {
    await setup()
    expect(container).toMatchSnapshot()
  })
  it.each(
    testAnnotations.flatMap((annotation) =>
      annotation.span.map((wordId) => [`${wordId}__${annotation.id}`]),
    ),
  )('shows the named entity annotation for %s', async (testId) => {
    await setup()
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })
  it('calls updateNamedEntityAnnotations on save', async () => {
    await setup()
    const saveButton = screen.getByLabelText('save-annotations')
    await waitFor(async () => {
      await userEvent.click(screen.getByTestId('Word-2__Entity-1'))

      expect(
        screen.getByLabelText('delete-name-annotation'),
      ).toBeInTheDocument()
    })
    await userEvent.click(screen.getByLabelText('delete-name-annotation'))

    await userEvent.click(saveButton)
    expect(
      fragmentServiceMock.updateNamedEntityAnnotations,
    ).toHaveBeenCalledWith(
      number,
      testAnnotations.filter((entity) => entity.id !== 'Entity-1'),
    )
  })
})
