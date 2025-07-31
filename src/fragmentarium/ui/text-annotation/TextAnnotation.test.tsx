import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { act, render, screen, waitFor } from '@testing-library/react'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import userEvent from '@testing-library/user-event'

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
  beforeEach(async () => {
    fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
    fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(
      testAnnotations
    )
    await act(async () => {
      container = render(
        <TextAnnotation fragmentService={fragmentServiceMock} number={number} />
      ).container
    })
  })
  it('shows the annotation interface', () => {
    expect(container).toMatchSnapshot()
  })
  it.each(
    testAnnotations.flatMap((annotation) =>
      annotation.span.map((wordId) => [`${wordId}__${annotation.id}`])
    )
  )('shows the named entity annotation for %s', (testId) => {
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })
  it('calls updateNamedEntityAnnotations on save', async () => {
    const saveButton = screen.getByLabelText('save-annotations')
    await waitFor(() => {
      userEvent.click(screen.getByTestId('Word-2__Entity-1'))

      expect(
        screen.getByLabelText('delete-name-annotation')
      ).toBeInTheDocument()
    })
    userEvent.click(screen.getByLabelText('delete-name-annotation'))

    await act(async () => {
      userEvent.click(saveButton)
    })
    expect(
      fragmentServiceMock.updateNamedEntityAnnotations
    ).toHaveBeenCalledWith(
      number,
      testAnnotations.filter((entity) => entity.id !== 'Entity-1')
    )
  })
})
