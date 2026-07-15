import React from 'react'
import { render, screen } from '@testing-library/react'
import { NamedEntityPreviewProvider } from 'fragmentarium/ui/text-annotation/NamedEntityPreviewContext'
import NamedEntityPreviewToken from 'fragmentarium/ui/text-annotation/NamedEntityPreviewToken'
import { WithRealiaService } from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
import { annotatedFragment } from 'test-support/named-entity-fixtures'
import { languageShiftToken } from 'test-support/test-tokens'
import { Token } from 'transliteration/domain/token'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

jest.mock('realia/application/RealiaService')

const [firstWord, personalName, realiaWord] = annotatedFragment.text.lines[0]
  .content as readonly Token[]

function renderToken(
  token: Token,
  fragment: Fragment = annotatedFragment,
): void {
  render(
    <WithRealiaService>
      <NamedEntityPreviewProvider fragment={fragment}>
        <NamedEntityPreviewToken token={token}>
          <span>{token.value}</span>
        </NamedEntityPreviewToken>
      </NamedEntityPreviewProvider>
    </WithRealiaService>,
  )
}

describe('NamedEntityPreviewToken', () => {
  it('shows an indicator for every named entity span of the word', () => {
    renderToken(personalName)

    expect(screen.getByTestId('Word-2__Entity-1')).toHaveClass(
      'named-entity__PERSONAL_NAME',
      'tier-depth--2',
    )
    expect(screen.getByTestId('Word-2__Entity-2')).toHaveClass(
      'named-entity__BUILDING_NAME',
      'tier-depth--1',
    )
  })

  it('shows the realia indicators below the named entity indicators', () => {
    renderToken(realiaWord)

    const indicator = screen.getByTestId('Word-3__Realia-1')
    expect(indicator).toHaveClass('span-indicator--realia', 'tier-depth--3')
    expect(indicator).toHaveAttribute('data-label', 'realia_000846')
  })

  it('shows no indicator for a word without annotations', () => {
    renderToken(firstWord)

    expect(screen.queryAllByTestId(/__/)).toHaveLength(0)
    expect(screen.getByText('kur')).toBeVisible()
  })

  it('shows no indicator for a token without an id', () => {
    renderToken(languageShiftToken)

    expect(screen.queryAllByTestId(/__/)).toHaveLength(0)
  })

  it('shows no indicator for a fragment without annotations', () => {
    renderToken(personalName, fragmentFactory.build())

    expect(screen.queryAllByTestId(/__/)).toHaveLength(0)
    expect(screen.getByText('nu')).toBeVisible()
  })

  it('shows no indicator without a preview provider', () => {
    render(
      <NamedEntityPreviewToken token={personalName}>
        <span>{personalName.value}</span>
      </NamedEntityPreviewToken>,
    )

    expect(screen.queryAllByTestId(/__/)).toHaveLength(0)
    expect(screen.getByText('nu')).toBeVisible()
  })
})
