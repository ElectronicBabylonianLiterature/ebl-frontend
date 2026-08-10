import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  emptyNamedEntityPreview,
  NamedEntityPreviewProvider,
} from 'fragmentarium/ui/text-annotation/NamedEntityPreviewContext'
import NamedEntityPreviewToken from 'fragmentarium/ui/text-annotation/NamedEntityPreviewToken'
import {
  realiaServiceMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { annotatedFragment } from 'test-support/named-entity-fixtures'
import { Token } from 'transliteration/domain/token'

jest.mock('realia/application/RealiaService')

const realiaWord = annotatedFragment.text.lines[0].content[2] as Token

describe('emptyNamedEntityPreview', () => {
  it('holds no spans', () => {
    expect(emptyNamedEntityPreview.namedEntities).toEqual([])
    expect(emptyNamedEntityPreview.realia).toEqual([])
  })
})

describe('NamedEntityPreviewProvider', () => {
  function renderPreview(show?: boolean): void {
    render(
      <WithRealiaService>
        <NamedEntityPreviewProvider fragment={annotatedFragment} show={show}>
          <NamedEntityPreviewToken token={realiaWord}>
            <span>{realiaWord.value}</span>
          </NamedEntityPreviewToken>
        </NamedEntityPreviewProvider>
      </WithRealiaService>,
    )
  }

  it('labels and colours realia spans from the inline info without fetching', () => {
    renderPreview()

    const indicator = screen.getByTestId('Word-3__Realia-1')
    expect(indicator).toHaveAttribute('data-label', 'Apkallu')
    expect(indicator).toHaveClass('named-entity__DIVINE_NAME')
    expect(realiaServiceMock.find).not.toHaveBeenCalled()
  })

  it('shows the spans by default', () => {
    renderPreview(true)

    expect(screen.getByTestId('Word-3__Realia-1')).toBeInTheDocument()
  })

  it('keeps the token mounted but shows no span when hidden', () => {
    renderPreview(false)

    expect(screen.queryByTestId('Word-3__Realia-1')).not.toBeInTheDocument()
    expect(screen.getByText(realiaWord.value)).toBeInTheDocument()
  })
})
