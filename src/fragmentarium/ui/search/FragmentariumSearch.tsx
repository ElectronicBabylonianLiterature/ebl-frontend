import React, { FunctionComponent } from 'react'
import AppContent from 'common/AppContent'
import NumberSearch from 'fragmentarium/ui/search/NumberSearch'
import TransliterationSearch from 'fragmentarium/ui/search/TransliterationSearch'
import SessionContext from 'auth/SessionContext'
import SearchGroup from 'fragmentarium/ui/SearchGroup'
import replaceTransliteration from 'fragmentarium/domain/replaceTransliteration'

import './FragmentariumSearch.css'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { Session } from 'auth/Session'
import FragmentsSearch from './ReferenceSearch'

type Props = {
  number: string | null | undefined
  id: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
  bibliographyService
  fragmentService
  fragmentSearchService
}
const FragmentariumSearch: FunctionComponent<Props> = ({
  number,
  id,
  pages,
  transliteration,
  fragmentService,
  bibliographyService,
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
                  pages={pages}
                  bibliographyService={bibliographyService}
                  fragmentService={fragmentService}
                  transliteration={replacedTransliteration}
                  fragmentSearchService={fragmentSearchService}
                />
              </header>
              <NumberSearch
                number={number}
                fragmentSearchService={fragmentSearchService}
              />
              <FragmentsSearch
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
