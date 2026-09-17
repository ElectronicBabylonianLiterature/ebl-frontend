import React from 'react'
import { produce } from 'immer'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { UpdateNamedEntityAnnotations } from 'fragmentarium/ui/text-annotation/annotationSave'
import { WithRealiaService } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { tokenIdFragment } from 'test-support/fragment-fixtures'
import { withAnnotationSpans } from 'test-support/annotated-fragment'

export const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

export const savedAnnotations: AnnotationSpans = {
  namedEntities: [
    { id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-2'] },
    { id: 'Entity-2', type: 'BUILDING_NAME', span: ['Word-2', 'Word-3'] },
  ],
  realia: [{ id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-2'] }],
}

export const annotatedFragment: Fragment = produce(
  withAnnotationSpans(tokenIdFragment, savedAnnotations),
  (draft) => {
    draft.realiaInfo = [
      { realiaId: 'realia_000846', lemma: 'Apkallu', type: ['Divine names'] },
    ]
  },
)

export const saveButton = (): HTMLElement =>
  screen.getByLabelText('save-annotations')

export async function openAnnotationEditor(
  updateNamedEntityAnnotations: jest.MockedFunction<UpdateNamedEntityAnnotations>,
  loaded: Fragment = annotatedFragment,
): Promise<void> {
  jest.clearAllMocks()
  fragmentServiceMock.find.mockResolvedValue(loaded)

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

export async function deleteTag(testId: string): Promise<void> {
  await userEvent.click(screen.getByTestId(testId))
  await userEvent.click(await screen.findByLabelText('delete-name-annotation'))
}

export async function deleteTagAndSave(
  testId = 'Word-2__Entity-1',
): Promise<void> {
  await deleteTag(testId)
  await userEvent.click(saveButton())
}
