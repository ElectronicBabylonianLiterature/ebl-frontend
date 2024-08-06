import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import ScopeEditor from './ScopeEditor'
import { Fragment } from 'fragmentarium/domain/fragment'
import MemorySession from 'auth/Session'

describe('ScopeEditor', () => {
  const fragment: Fragment = {
    authorizedScopes: ['read:CAIC-fragments'],
  } as Fragment

  const session = new MemorySession([
    'read:CAIC-fragments',
    'read:ITALIANNINEVEH-fragments',
  ])

  const updateScopes = jest.fn().mockResolvedValue(undefined)

  test('renders the component correctly', () => {
    render(
      <ScopeEditor
        fragment={fragment}
        session={session}
        updateScopes={updateScopes}
      />
    )

    expect(screen.getByText('Permissions')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Records with added permissions are visible only to users who have those permissions.'
      )
    ).toBeInTheDocument()
  })

  test('toggles scopes', () => {
    render(
      <ScopeEditor
        fragment={fragment}
        session={session}
        updateScopes={updateScopes}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)

    expect(checkboxes[0]).toBeChecked()

    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).not.toBeChecked()

    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()
  })

  test('submits selected scopes', async () => {
    render(
      <ScopeEditor
        fragment={fragment}
        session={session}
        updateScopes={updateScopes}
      />
    )

    const button = screen.getByText('Update Permissions')

    fireEvent.click(button)

    expect(updateScopes).toHaveBeenCalledWith(['read:CAIC-fragments'])
  })
})
