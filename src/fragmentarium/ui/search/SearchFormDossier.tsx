import React from 'react'
import withData from 'http/withData'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { DossierSearchHelp } from 'fragmentarium/ui/SearchHelp'
import SelectFormGroup from './SelectFromGroup'

interface DossierSearchFormGroupProps {
  value: DossierRecord | null
  onChange: (value: DossierRecord | null) => void
  dossiersService: DossiersService
}

const DossierSearchFormGroup = withData<
  DossierSearchFormGroupProps,
  { dossiersService: DossiersService },
  readonly DossierRecord[]
>(
  ({ data, value, onChange }) => {
    const options = data.map((dossier) => ({
      value: dossier.id,
      label: `${dossier.id} — ${dossier.description}`,
    }))

    const valueAsString = value?.id || null

    const handleChange = (selectedId: string | null) => {
      if (selectedId) {
        const selected = data.find((d) => d.id === selectedId)
        onChange(selected || null)
      } else {
        onChange(null)
      }
    }

    return (
      <SelectFormGroup
        controlId="dossier"
        helpOverlay={DossierSearchHelp()}
        placeholder="ID — Description"
        options={options}
        value={valueAsString}
        onChange={handleChange}
        classNamePrefix="dossier-selector"
      />
    )
  },
  (props) => props.dossiersService.fetchAllDossiers()
)

export default DossierSearchFormGroup
