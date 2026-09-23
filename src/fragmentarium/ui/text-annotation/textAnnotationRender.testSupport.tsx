import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { UpdateNamedEntityAnnotations } from 'fragmentarium/ui/text-annotation/annotationSave'
import {
  updateNamedEntityAnnotationsMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { withAnnotationSpans } from 'test-support/annotated-fragment'

export const testAnnotations: AnnotationSpans = {
  namedEntities: [
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
  ],
  realia: [],
}

export const getMarkableButtons = (): HTMLElement[] =>
  screen
    .getAllByRole('button')
    .filter((button) => button.hasAttribute('data-id')) as HTMLElement[]

export async function renderTextAnnotation(
  fragmentServiceMock: jest.Mocked<FragmentService>,
): Promise<{
  container: HTMLElement
  updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>
}> {
  const fragment = withAnnotationSpans(tokenIdFragment, testAnnotations)
  fragmentServiceMock.find.mockResolvedValue(fragment)
  const updateNamedEntityAnnotations =
    updateNamedEntityAnnotationsMock(fragment)

  const { container } = render(
    <ThemeProvider>
      <WithRealiaService>
        <TextAnnotation
          fragmentService={fragmentServiceMock}
          number={fragment.number}
          updateNamedEntityAnnotations={updateNamedEntityAnnotations}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')

  return { container, updateNamedEntityAnnotations }
}
