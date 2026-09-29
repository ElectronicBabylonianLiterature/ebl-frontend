import React from 'react'
import { Col } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import GenreSearchForm from 'fragmentarium/ui/search/SearchFormGenre'
import MuseumSearchForm from 'fragmentarium/ui/search/SearchFormMuseum'
import PeriodSearchForm from 'fragmentarium/ui/search/SearchFormPeriod'
import ProvenanceSearchForm from 'fragmentarium/ui/search/SearchFormProvenance'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'
import {
  SearchFormState,
  SearchFormValue,
} from 'fragmentarium/ui/SearchFormState'

const SearchField = <T extends React.ElementType>({
  component: Component,
  ...props
}: { component: T } & React.ComponentProps<T>) => {
  return <Component {...props} />
}

export default function SearchFormAdvancedFields({
  state,
  onChange,
  fragmentService,
  dossiersService,
}: {
  state: SearchFormState
  onChange: (name: string) => (value: SearchFormValue) => void
  fragmentService: FragmentService
  dossiersService: DossiersService
}): JSX.Element {
  const renderSearchField = (
    component: React.ElementType,
    stateValue: string | null,
    stateKey: string,
  ) => (
    <SearchField
      component={component}
      value={stateValue}
      onChange={onChange(stateKey)}
      fragmentService={fragmentService}
    />
  )

  return (
    <Col md={6}>
      {renderSearchField(GenreSearchForm, state.genre, 'genre')}
      <SearchField
        component={MuseumSearchForm}
        value={state.museum}
        onChange={onChange('museum')}
      />
      <PeriodSearchForm
        scriptPeriod={state.scriptPeriod}
        scriptPeriodModifier={state.scriptPeriodModifier}
        onChangeScriptPeriod={onChange('scriptPeriod')}
        onChangeScriptPeriodModifier={onChange('scriptPeriodModifier')}
        fragmentService={fragmentService}
      />
      {renderSearchField(ProvenanceSearchForm, state.site, 'site')}
      <SearchFormDossier
        ariaLabel="Dossier"
        value={state.dossier}
        searchSuggestions={(inputValue: string, filters) =>
          dossiersService.searchSuggestions(inputValue, filters)
        }
        onChange={onChange('dossier')}
        isClearable={true}
        filters={{
          provenance: state.site,
          scriptPeriod: state.scriptPeriod,
          genre: state.genre,
        }}
      />
    </Col>
  )
}
