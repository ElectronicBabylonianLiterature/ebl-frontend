import React from 'react'
import { parse } from 'query-string'
import _ from 'lodash'
import { RouteComponentProps } from 'react-router-dom'
import DossiersService from 'dossiers/application/DossiersService'
import DossiersSearchForm from './DossiersSearchForm'
import DossiersSearch from './DossiersSearch'
import { Markdown } from 'common/Markdown'

function getQueryFromLocation(
  location: RouteComponentProps['location']
): string {
  const rawQuery = parse(location.search).query || ''
  return _.isArray(rawQuery) ? rawQuery.join('') : rawQuery
}

function DossiersSearchIntroduction(): JSX.Element {
  return (
    <Markdown
      className="dossiers-search__introduction"
      text="Search through dossiers to find information about ancient Mesopotamian texts, 
        their provenance, associated kings, and historical periods. 
        This tool provides comprehensive access to curated dossier records from the 
        electronic Babylonian Library (eBL)."
    />
  )
}

export default function DossiersSearchPage({
  dossiersService,
  location,
}: {
  dossiersService: DossiersService
} & RouteComponentProps): JSX.Element {
  const query = getQueryFromLocation(location)
  return (
    <>
      <DossiersSearchIntroduction />
      <div className="dossiers-search__form">
        <DossiersSearchForm query={query} />
      </div>
      <DossiersSearch query={query} dossiersService={dossiersService} />
    </>
  )
}
