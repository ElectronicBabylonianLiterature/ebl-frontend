import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  NamedEntityAnnotationContents,
  TabsProps,
} from 'fragmentarium/ui/fragment/editorTabContents'
import { AnnotationSpans } from 'fragmentarium/ui/text-annotation/annotationSpan'
import { WithRealiaService } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { tokenIdFragment } from 'test-support/fragment-fixtures'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

const annotations: AnnotationSpans = {
  namedEntities: [{ id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-2'] }],
  realia: [],
}

let onSave: jest.Mock<Promise<Fragment>, [Promise<Fragment>]>

async function setup(saveFails = false): Promise<void> {
  fragmentServiceMock.find.mockResolvedValue(tokenIdFragment)
  fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue(annotations)
  if (saveFails) {
    fragmentServiceMock.updateNamedEntityAnnotations.mockRejectedValue(
      new Error('save failed'),
    )
  } else {
    fragmentServiceMock.updateNamedEntityAnnotations.mockResolvedValue(
      tokenIdFragment,
    )
  }
  onSave = jest.fn((updatedFragment: Promise<Fragment>) => updatedFragment)

  render(
    <ThemeProvider>
      <WithRealiaService>
        <NamedEntityAnnotationContents
          {...({
            fragment: tokenIdFragment,
            fragmentService: fragmentServiceMock,
            onSave,
          } as unknown as TabsProps)}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')
}

describe('NamedEntityAnnotationContents', () => {
  it('routes the save through onSave so the display tab sees new annotations', async () => {
    await setup()

    await userEvent.click(screen.getByTestId('Word-2__Entity-1'))
    await userEvent.click(
      await screen.findByLabelText('delete-name-annotation'),
    )
    await userEvent.click(screen.getByLabelText('save-annotations'))

    expect(
      fragmentServiceMock.updateNamedEntityAnnotations,
    ).toHaveBeenCalledWith(tokenIdFragment.number, {
      namedEntities: [],
      realia: [],
    })
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('leaves the save button usable when the save fails', async () => {
    await setup(true)

    await userEvent.click(screen.getByTestId('Word-2__Entity-1'))
    await userEvent.click(
      await screen.findByLabelText('delete-name-annotation'),
    )
    await userEvent.click(screen.getByLabelText('save-annotations'))

    await waitFor(() =>
      expect(screen.getByLabelText('save-annotations')).toBeEnabled(),
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
