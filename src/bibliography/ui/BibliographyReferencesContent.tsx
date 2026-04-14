import React from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'
import _ from 'lodash'
import BibliographySearchForm from './BibliographySearchForm'
import BibliographySearch from './BibliographySearch'
import SessionContext from 'auth/SessionContext'
import InfoBanner from 'common/InfoBanner'
import { Session } from 'auth/Session'
import BibliographyService from 'bibliography/application/BibliographyService'
import { Markdown } from 'common/Markdown'

function getReferencesQueryFromLocation(search: string): string {
  const rawQuery = parse(search).query || ''
  return _.isArray(rawQuery) ? rawQuery.join('') : rawQuery
}

function BibliographyReferencesIntroduction(): JSX.Element {
  return (
    <Markdown
      className="BibliographyReferences__introduction"
      text="The electronic Babylonian Library (eBL) features a comprehensive collection of 
        bibliography references related to Babylonian literature and cuneiform studies in general. 
        These references have been meticulously gathered and are readily accessible 
        through a dedicated search function on the eBL platform. 
        This robust bibliographic repository serves as a valuable resource for researchers, scholars, 
        and anyone interested in the study of ancient Mesopotamian texts."
    />
  )
}

export default function BibliographyReferencesContent({
  bibliographyService,
}: {
  bibliographyService: BibliographyService
}): JSX.Element {
  const location = useLocation()
  const query = getReferencesQueryFromLocation(location.search)
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element =>
        session.isAllowedToReadBibliography() ? (
          <>
            <InfoBanner
              title="Bibliography"
              description="A complete and constantly updated bibliography of cuneiform publications with over 11,497 entries."
              learnMorePath="/about/bibliography"
            />
            <BibliographyReferencesIntroduction />
            <div className="Bibliography__search">
              <BibliographySearchForm query={query} />
            </div>
            <BibliographySearch
              query={query}
              bibliographyService={bibliographyService}
            />
          </>
        ) : (
          <p>Please log in to browse the Bibliography.</p>
        )
      }
    </SessionContext.Consumer>
  )
}
