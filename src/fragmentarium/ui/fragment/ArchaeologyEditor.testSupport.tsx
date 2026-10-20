import React from 'react'
import { render, screen } from '@testing-library/react'
import ArchaeologyEditor from 'fragmentarium/ui/fragment/ArchaeologyEditor'
import { Archaeology, Findspot } from 'fragmentarium/domain/archaeology'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

export type UpdateArchaeology = jest.Mock<Promise<Fragment>, [ArchaeologyDto]>

export const babylonProvenance: ProvenanceRecord = {
  id: 'babylon',
  longName: 'Babylon',
  abbreviation: 'Bab',
  parent: 'Babylonia',
  sortKey: 1,
}

export async function renderArchaeologyEditor(
  archaeology: Archaeology | null,
  updateArchaeology: UpdateArchaeology,
  findspots: readonly Findspot[],
): Promise<void> {
  render(
    <ArchaeologyEditor
      archaeology={archaeology}
      updateArchaeology={updateArchaeology}
      findspotService={{
        fetchFindspots: jest.fn().mockResolvedValue(findspots),
      }}
      fragmentService={{
        fetchProvenances: jest.fn().mockResolvedValue([babylonProvenance]),
      }}
    />,
  )
  await screen.findByLabelText('Excavation number')
}
