import React from 'react'
import { render, screen } from '@testing-library/react'
import ColophonEditor from 'fragmentarium/ui/fragment/ColophonEditor'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Colophon } from 'fragmentarium/domain/Colophon'
import { provenanceRecords } from 'test-support/provenance-records'

export const colophonNames = ['Humbaba', 'Zababa', 'Enkidu']

export function mockColophonLookups(
  fragmentService: jest.Mocked<FragmentService>,
): void {
  fragmentService.fetchProvenances.mockResolvedValue(provenanceRecords)
  fragmentService.fetchColophonNames.mockResolvedValue(colophonNames)
}

export async function renderColophonEditor(
  initialFragment: Fragment,
  updateColophon: (colophon: Colophon) => Promise<void>,
  fragmentService: jest.Mocked<FragmentService>,
): Promise<void> {
  render(
    <ColophonEditor
      fragment={initialFragment}
      updateColophon={updateColophon}
      fragmentService={fragmentService}
    />,
  )
  await screen.findByLabelText('save-colophon')
}
