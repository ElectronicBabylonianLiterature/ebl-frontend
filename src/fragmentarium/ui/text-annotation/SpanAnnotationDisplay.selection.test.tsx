import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextAnnotation from 'fragmentarium/ui/text-annotation/TextAnnotation'
import { getSelectedTokens } from 'fragmentarium/ui/text-annotation/selectionUtils'
import { WithRealiaService } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import {
  createAnnotatedFragment,
  createAnnotatedWord,
} from 'test-support/named-entity-fixtures'

jest.mock('realia/application/RealiaService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/ui/text-annotation/selectionUtils', () => ({
  ...jest.requireActual('fragmentarium/ui/text-annotation/selectionUtils'),
  getSelectedTokens: jest.fn(),
}))
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
      return <>{typeof children === 'function' ? children({}) : children}</>
    },
  }
})

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const getSelectedTokensMock = getSelectedTokens as jest.MockedFunction<
  typeof getSelectedTokens
>

const fragment = createAnnotatedFragment(
  [createAnnotatedWord('kur', 'Word-1'), createAnnotatedWord('nu', 'Word-2')],
  [],
  [],
  [],
)

async function setup(): Promise<void> {
  fragmentServiceMock.find.mockResolvedValue(fragment)
  fragmentServiceMock.fetchNamedEntityAnnotations.mockResolvedValue({
    namedEntities: [],
    realia: [],
  })
  render(
    <ThemeProvider>
      <WithRealiaService>
        <TextAnnotation
          fragmentService={fragmentServiceMock}
          number={fragment.number}
        />
      </WithRealiaService>
    </ThemeProvider>,
  )
  await screen.findByLabelText('save-annotations')
}

describe('SpanAnnotationDisplay selection retry', () => {
  afterEach(() => {
    jest.useRealTimers()
    getSelectedTokensMock.mockReset()
  })

  it('retries once when the selection collapses onto a different single token', async () => {
    await setup()
    const [startToken] = screen
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('data-id'))

    fireEvent.mouseDown(startToken)
    getSelectedTokensMock.mockReturnValue(['Word-2'])
    jest
      .spyOn(document, 'getSelection')
      .mockReturnValue({ isCollapsed: false } as Selection)

    jest.useFakeTimers()
    fireEvent.mouseUp(startToken)
    act(() => {
      jest.runAllTimers()
    })

    expect(getSelectedTokensMock.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByLabelText('annotate-named-entities')).toBeInTheDocument()
  })
})
