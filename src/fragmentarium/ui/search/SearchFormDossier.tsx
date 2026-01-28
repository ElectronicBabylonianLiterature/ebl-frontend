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
  provenance?: string | null
  scriptPeriod?: string | null
  genre?: string | null
}

const DossierSearchFormGroup = withData<
  DossierSearchFormGroupProps,
  { dossiersService: DossiersService },
  readonly DossierRecord[]
>(
  ({ data, value, onChange }) => {
    const truncateDescription = (desc?: string): string => {
      if (!desc) return ''
      const words = desc.split(' ')
      if (words.length <= 7) return desc
      return words.slice(0, 7).join(' ') + '...'
    }

    const options = data.map((dossier) => ({
      value: dossier.id,
      label: `${dossier.id} — ${truncateDescription(dossier.description)}`,
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
    return props.dossiersService.fetchFilteredDossiers({
      provenance: props.provenance || undefined,
      scriptPeriod: props.scriptPeriod || undefined,
      genre: props.genre || undefined,
    })
  },
  {
    watch: (props) => [props.provenance, props.scriptPeriod, props.genre],
  }
)

export default DossierSearchFormGroup
