import React from 'react'
import { render, screen } from '@testing-library/react'
import ManuscriptJoins from 'corpus/ui/ManuscriptJoins'
import { joinFactory } from 'test-support/join-fixtures'
import { Join, Joins } from 'fragmentarium/domain/join'

function buildJoin(museumNumber: string, isChecked: boolean): Join {
  return joinFactory.build({
    museumNumber,
    isChecked,
    isInFragmentarium: false,
  })
}

function displayJoins(joins: Joins): HTMLElement {
  render(
    <div role="group" aria-label="Manuscript joins">
      <ManuscriptJoins
        manuscript={{
          joins,
          museumNumber: 'BM.1',
          isInFragmentarium: false,
          accession: 'A.1',
        }}
      />
    </div>,
  )
  return screen.getByRole('group', { name: 'Manuscript joins' })
}

describe('ManuscriptJoins', () => {
  it('shows the manuscript itself when it has no joins', () => {
    const joinsDisplay = displayJoins([])

    expect(joinsDisplay).toHaveTextContent(/^BM\.1$/)
  })

  it('joins checked and unchecked fragments within and across groups', () => {
    const joinsDisplay = displayJoins([
      [buildJoin('X.1', true), buildJoin('X.2', false), buildJoin('X.3', true)],
      [buildJoin('X.4', false)],
      [buildJoin('X.5', true)],
    ])

    expect(joinsDisplay).toHaveTextContent(
      /^X\.1 \+\? X\.2 \+ X\.3 \(\+\?\) X\.4 \(\+\) X\.5$/,
    )
    expect(screen.getAllByText('?')).toHaveLength(2)
  })
})
