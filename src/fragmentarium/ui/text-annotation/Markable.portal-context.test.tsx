import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Markable from 'fragmentarium/ui/text-annotation/Markable'
import { atfTokenKur } from 'test-support/test-tokens'
import DisplayToken from 'transliteration/ui/DisplayToken'
import AnnotationContext, {
  useAnnotationContext,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'

const testToken = { ...atfTokenKur, id: 'Word-1' }
const setSelection = jest.fn()
const setActiveSpanId = jest.fn()

function TestWrapper({ children }: { children: React.ReactNode }) {
  const contextValue = useAnnotationContext(['Word-1', 'Word-2'])
  return (
    <AnnotationContext.Provider value={contextValue}>
      {children}
    </AnnotationContext.Provider>
  )
}

function TestWrapperWithEntity({ children }: { children: React.ReactNode }) {
  const entity: ApiEntityAnnotationSpan = {
    id: 'Entity-1',
    type: 'PERSONAL_NAME',
    span: ['Word-1'],
  }
  const contextValue = useAnnotationContext(['Word-1', 'Word-2'], [entity])
  return (
    <AnnotationContext.Provider value={contextValue}>
      {children}
    </AnnotationContext.Provider>
  )
}

describe('Markable portal context - annotation popover', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders annotation popover when selection is made', async () => {
    render(
      <TestWrapper>
        <Markable
          token={testToken}
          selection={['Word-1']}
          setSelection={setSelection}
          activeSpanId={null}
          setActiveSpanId={setActiveSpanId}
        >
          <DisplayToken token={testToken} />
        </Markable>
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    expect(screen.getByText(/Annotate 1 Word/i)).toBeInTheDocument()
  })

  it('provides annotation context in portal popover', async () => {
    render(
      <TestWrapper>
        <Markable
          token={testToken}
          selection={['Word-1']}
          setSelection={setSelection}
          activeSpanId={null}
          setActiveSpanId={setActiveSpanId}
        >
          <DisplayToken token={testToken} />
        </Markable>
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(
        screen.getByLabelText('annotate-named-entities'),
      ).toBeInTheDocument()
    })
  })

  it('allows selecting entity type from dropdown', async () => {
    render(
      <TestWrapper>
        <Markable
          token={testToken}
          selection={['Word-1']}
          setSelection={setSelection}
          activeSpanId={null}
          setActiveSpanId={setActiveSpanId}
        >
          <DisplayToken token={testToken} />
        </Markable>
      </TestWrapper>,
    )

    await waitFor(() => {
      expect(
        screen.getByLabelText('annotate-named-entities'),
      ).toBeInTheDocument()
    })

    // Verify the dropdown is functional (context is working)
    const select = screen.getByLabelText('annotate-named-entities')
    expect(select).toBeEnabled()
  })
})

describe('Markable portal context - editor popover', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders editor popover when entity is active', async () => {
    render(
      <TestWrapperWithEntity>
        <Markable
          token={testToken}
          selection={[]}
          setSelection={setSelection}
          activeSpanId={'Entity-1'}
          setActiveSpanId={setActiveSpanId}
        >
          <DisplayToken token={testToken} />
        </Markable>
      </TestWrapperWithEntity>,
    )

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    expect(screen.getByText(/Edit/i)).toBeInTheDocument()
  })

  it('provides context for delete action in editor', async () => {
    render(
      <TestWrapperWithEntity>
        <Markable
          token={testToken}
          selection={[]}
          setSelection={setSelection}
          activeSpanId={'Entity-1'}
          setActiveSpanId={setActiveSpanId}
        >
          <DisplayToken token={testToken} />
        </Markable>
      </TestWrapperWithEntity>,
    )

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Verify delete button is present (context allows rendering SpanEditor)
    const deleteButton = screen.getByLabelText('delete-name-annotation')
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toBeEnabled()
  })

  it('renders editor content only once without duplication', async () => {
    render(
      <TestWrapperWithEntity>
        <Markable
          token={testToken}
          selection={[]}
          setSelection={setSelection}
          activeSpanId={'Entity-1'}
          setActiveSpanId={setActiveSpanId}
        >
          <DisplayToken token={testToken} />
        </Markable>
      </TestWrapperWithEntity>,
    )

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // Verify no duplication - should find exactly one delete button
    const deleteButtons = screen.getAllByLabelText('delete-name-annotation')
    expect(deleteButtons).toHaveLength(1)

    const updateButtons = screen.getAllByLabelText('update-name-annotation')
    expect(updateButtons).toHaveLength(1)
  })
})
