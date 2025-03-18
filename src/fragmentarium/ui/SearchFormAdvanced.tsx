import React from 'react'
import { FragmentService } from 'fragmentarium/application/FragmentService'
import GenreSearchForm from './GenreSearchForm'
import MuseumSearchForm from './MuseumSearchForm'
import PeriodSearchForm from './PeriodSearchForm'
import ProvenanceSearchForm from './ProvenanceSearchForm'
import { State } from './SearchForm'

type Props = {
  formState: State
  onChange: (name: keyof State) => (value: any) => void
  fragmentService: FragmentService
}

export default function AdvancedSearchFields({
  formState,
  onChange,
  fragmentService,
}: Props): JSX.Element {
  return (
    <div className="advanced-search-fields">
      <GenreSearchForm
        value={formState.genre}
        onChange={onChange('genre')}
        fragmentService={fragmentService}
      />
      <MuseumSearchForm
        value={formState.museum}
        onChange={onChange('museum')}
      />
      <PeriodSearchForm
        scriptPeriod={formState.scriptPeriod}
        scriptPeriodModifier={formState.scriptPeriodModifier}
        onChangeScriptPeriod={onChange('scriptPeriod')}
        onChangeScriptPeriodModifier={onChange('scriptPeriodModifier')}
        fragmentService={fragmentService}
      />
      <ProvenanceSearchForm
        value={formState.site}
        onChange={onChange('site')}
        fragmentService={fragmentService}
      />
    </div>
  )
}
