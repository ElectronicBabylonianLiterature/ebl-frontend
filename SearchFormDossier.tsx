import React from 'react'
import withData from 'http/withData'
import DossierRecord from 'dossiers/domain/DossierRecord'
import DossiersService from 'dossiers/application/DossiersService'
import { DossierSearchHelp } from 'fragmentarium/ui/SearchHelp'
import SelectFormGroup from './SelectFromGroup'

interface DossierSearchFormGroupProps {
  value: string | null
  onChange: (value: string | null) => void
  dossiersService: DossiersService
}

const DossierSearchFormGroup = withData<
  DossierSearchFormGroupProps,
  { dossiersService: DossiersService },
  readonly DossierRecord[]
>(
  ({ data, value, onChange }) => {
    console.log('DossierSearchFormGroup rendering with', data.length, 'dossiers')
    const options = data.map((dossier) => ({
      value: dossier.id,
      label: `${dossier.id} — ${dossier.description}`,
    }))

    return (
      <SelectFormGroup
        controlId="dossier"
        helpOverlay={DossierSearchHelp()}
        placeholder="ID — Description"
        options={options}
        value={value}
        onChange={onChange}
        classNamePrefix="dossier-selector"
      />
    )
  },
  (props) => {
    console.log('Fetching dossiers...')
    return props.dossiersService.fetchAllDossiers()
  }
  (props) => {
    console.log('Fetching dossiers...')
    return props.dossiersService.fetchAllDossiers()
  },
  {
    watch: () => [],
  }
)

export default DossierSearchFormGroup
