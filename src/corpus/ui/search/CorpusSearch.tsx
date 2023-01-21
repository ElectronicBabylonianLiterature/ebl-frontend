import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { QueryType } from 'query/FragmentQuery'
import WordService from 'dictionary/application/WordService'
import _ from 'lodash'
import CorpusSearchForm from './CorpusSearchForm'
import TextService from 'corpus/application/TextService'
import withData from 'http/withData'

export type CorpusQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
}>

const Result = withData<
  { textService: TextService; corpusQuery: CorpusQuery },
  unknown,
  any
>(
  ({ data, textService, corpusQuery }): JSX.Element => {
    return <>Found {data.matchCountTotal} matches</>
  },
  ({ textService, corpusQuery }) => textService.query(corpusQuery),
  {
    watch: ({ corpusQuery }) => [corpusQuery],
  }
)

function CorpusSearch({
  corpusQuery,
  wordService,
  textService,
}: {
  corpusQuery: CorpusQuery
  wordService: WordService
  textService: TextService
}): JSX.Element {
  return (
    <AppContent crumbs={[new SectionCrumb('Corpus')]}>
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadTexts() ? (
            <section className="Corpus-search">
              <header className="Corpus-search__header">
                <CorpusSearchForm
                  wordService={wordService}
                  textService={textService}
                  corpusQuery={corpusQuery}
                />
              </header>
              {!_.isEmpty(corpusQuery) && (
                <Result textService={textService} corpusQuery={corpusQuery} />
              )}
            </section>
          ) : (
            <p>Please log in to browse the Corpus.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default CorpusSearch
