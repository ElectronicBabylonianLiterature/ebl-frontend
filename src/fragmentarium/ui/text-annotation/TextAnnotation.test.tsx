import React from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { render, screen } from '@testing-library/react'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'

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
  beforeEach(() => {
    fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
    fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(
      testAnnotations
    )

    container = render(
      <TextAnnotation fragmentService={fragmentServiceMock} number={number} />
    ).container
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
})
