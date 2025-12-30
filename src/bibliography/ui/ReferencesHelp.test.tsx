import React from 'react'
import { render, screen } from '@testing-library/react'
import { ReferencesHelp } from './ReferencesHelp'

jest.mock('common/HelpTrigger', () => {
  const MockedHelpTrigger = (props: { overlay: React.ReactNode }) => (
    <div data-testid="help-trigger">{props.overlay}</div>
  )
  MockedHelpTrigger.displayName = 'HelpTrigger'
  return MockedHelpTrigger
})

describe('ReferencesHelp', () => {
  it('renders all abbreviations and definitions', () => {
    render(<ReferencesHelp className="extra-class" />)

    expect(screen.getByTestId('help-trigger')).toBeInTheDocument()

    const abbreviations = ['C', 'P', 'E', 'D', 'T', 'A', 'Ac']
    abbreviations.forEach((abbr) => {
      expect(screen.getByText(abbr)).toBeInTheDocument()
    })

    const definitions = [
      'Copy',
      'Photograph',
      'Edition',
      'Discussion',
      'Translation',
      'Archaeology',
      'Acquisition',
    ]
    definitions.forEach((def) => {
      expect(screen.getByText(def)).toBeInTheDocument()
    })
  })
})
