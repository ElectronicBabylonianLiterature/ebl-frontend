import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { QueryType } from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import { LemmaSearchForm } from 'fragmentarium/ui/LemmaSearchForm'
import _ from 'lodash'

type CorpusQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
}>

function CorpusSearch({
  corpusQuery,
  wordService,
}: {
  corpusQuery?: CorpusQuery
  wordService: WordService
}): JSX.Element {
  return (
    <AppContent crumbs={[new SectionCrumb('Corpus')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Corpus-search">
              <header className="Corpus-search__header">
                <LemmaSearchForm
                  wordService={wordService}
                  onChange={() => () => console.log('change')}
                  lemmas={''}
                />
              </header>
              {!_.isEmpty(corpusQuery) && <>(Results here...)</>}
            </section>
          ) : (
            <p>Please log in to browse the Fragmentarium.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default CorpusSearch
