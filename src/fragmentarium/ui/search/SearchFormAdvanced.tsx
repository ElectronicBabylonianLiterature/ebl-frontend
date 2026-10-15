import React from 'react'
import { Col } from 'react-bootstrap'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import {
  SearchFormState,
  SearchFormValue,
} from 'fragmentarium/ui/SearchForm.state'
import GenreSearchForm from 'fragmentarium/ui/search/SearchFormGenre'
import MuseumSearchForm from 'fragmentarium/ui/search/SearchFormMuseum'
import PeriodSearchForm from 'fragmentarium/ui/search/SearchFormPeriod'
import ProvenanceSearchForm from 'fragmentarium/ui/search/SearchFormProvenance'
import SearchFormDossier from 'fragmentarium/ui/search/SearchFormDossier'

type Props = Pick<
  SearchFormState,
  | 'genre'
  | 'museum'
  | 'scriptPeriod'
  | 'scriptPeriodModifier'
  | 'site'
  | 'dossier'
> & {
  onChange: (name: string) => (value: SearchFormValue) => void
  fragmentService: FragmentService
  dossiersService: DossiersService
}

export default function SearchFormAdvanced({
  genre,
  museum,
  scriptPeriod,
  scriptPeriodModifier,
  site,
  dossier,
  onChange,
  fragmentService,
  dossiersService,
}: Props): JSX.Element {
  return (
    <Col md={6}>
      <GenreSearchForm
        value={genre}
        onChange={onChange('genre')}
        fragmentService={fragmentService}
      />
      <MuseumSearchForm value={museum} onChange={onChange('museum')} />
      <PeriodSearchForm
        scriptPeriod={scriptPeriod}
        scriptPeriodModifier={scriptPeriodModifier}
        onChangeScriptPeriod={onChange('scriptPeriod')}
        onChangeScriptPeriodModifier={onChange('scriptPeriodModifier')}
        fragmentService={fragmentService}
      />
      <ProvenanceSearchForm
        value={site}
        onChange={onChange('site')}
        fragmentService={fragmentService}
      />
      <SearchFormDossier
        ariaLabel="Dossier"
        value={dossier}
        searchSuggestions={(inputValue: string, filters) =>
          dossiersService.searchSuggestions(inputValue, filters)
        }
        onChange={onChange('dossier')}
        isClearable={true}
        filters={{
          provenance: site,
          scriptPeriod: scriptPeriod,
          genre: genre,
        }}
      />
    </Col>
  )
}
