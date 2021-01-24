import React, { FunctionComponent } from 'react'
import AppContent from 'common/AppContent'
import NumberSearch from 'fragmentarium/ui/search/NumberSearch'
import TransliterationSearch from 'fragmentarium/ui/search/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchForm'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

import 'fragmentarium/ui/search/FragmentariumSearch.css'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import ReferenceSearch from 'fragmentarium/ui/search/ReferenceSearch'
import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

interface Props {
  number: string | null | undefined
  id: string | null | undefined
  title: string | null | undefined
  primaryAuthor: string | null | undefined
  year: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
}

const FragmentariumSearch: FunctionComponent<Props> = ({
  number,
  id,
  title,
  primaryAuthor,
  year,
  pages,
  transliteration,
  fragmentService,
  fragmentSearchService,
}: Props) => {
  const replacedTransliteration =
    transliteration && replaceTransliteration(transliteration)
  return (
    <AppContent
      crumbs={[new SectionCrumb('Fragmentarium'), new TextCrumb('Search')]}
    >
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadFragments() ? (
            <section className="Fragmentarium-search">
              <header className="Fragmentarium-search__header">
                <SearchGroup
                  number={number}
                  id={id}
                  primaryAuthor={primaryAuthor}
                  year={year}
                  title={title}
                  pages={pages}
                  fragmentService={fragmentService}
                  transliteration={replacedTransliteration}
                  fragmentSearchService={fragmentSearchService}
                />
              </header>
              <NumberSearch
                number={number}
                fragmentSearchService={fragmentSearchService}
              />
              <ReferenceSearch
                id={id}
                pages={pages}
                fragmentSearchService={fragmentSearchService}
              />
              <TransliterationSearch
                transliteration={replacedTransliteration}
                fragmentSearchService={fragmentSearchService}
              />
            </section>
          ) : (
            <p>Please log in to browse the Fragmentarium.</p>
          )
        }
      </SessionContext.Consumer>
    </AppContent>
  )
}

export default FragmentariumSearch
