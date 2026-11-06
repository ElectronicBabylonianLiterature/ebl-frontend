import React from 'react'
import { useLocation } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import SumerianDictionaryDevelopmentNotice from 'sumerian-dictionary/ui/SumerianDictionaryDevelopmentNotice'
import SumerianDictionarySearchForm from 'sumerian-dictionary/ui/SumerianDictionarySearchForm'
import SumerianDictionarySearch from 'sumerian-dictionary/ui/SumerianDictionarySearch'
import {
  SumerianDictionaryFeaturedEntries,
  SumerianDictionaryStatisticsBar,
} from 'sumerian-dictionary/ui/SumerianDictionaryOverview'
import { SumerianRestrictedNotice } from 'sumerian-dictionary/ui/SumerianDictionaryAccess'
import { parseSumerianSearch } from 'sumerian-dictionary/ui/sumerianDictionaryPage'
import 'sumerian-dictionary/ui/SumerianDictionary.sass'

function SumerianDictionaryIntroduction(): JSX.Element {
  return (
    <p className="SumerianDictionary__introduction">
      The Sumerian Dictionary unites the Sumerian lexicon of three reference
      works: Pascal Attinger&apos;s <i>Glossaire sumérien–français</i>, the
      electronic Pennsylvania Sumerian Dictionary (ePSD2), and Rykle
      Borger&apos;s <i>Bilinguen-Glossar</i> for Akkadian equivalents. Each of
      Attinger&apos;s articles is aligned with its ePSD2 counterpart, so a lemma
      brings together French and English meanings, its attested spellings with
      their frequencies, the signs it is written with, its compounds, and the
      literary passages that cite it.
    </p>
  )
}

function AuthorizedSearchPage({
  sumerianDictionaryService,
}: {
  sumerianDictionaryService: SumerianDictionaryService
}): JSX.Element {
  const location = useLocation()
  const state = parseSumerianSearch(location.search)
  return (
    <div className="SumerianDictionary">
      <SumerianDictionaryDevelopmentNotice />
      <SumerianDictionaryIntroduction />
      <SumerianDictionaryStatisticsBar
        sumerianDictionaryService={sumerianDictionaryService}
      />
      <SumerianDictionarySearchForm key={location.search} state={state} />
      {state.query ? (
        <SumerianDictionarySearch
          state={state}
          sumerianDictionaryService={sumerianDictionaryService}
        />
      ) : (
        <SumerianDictionaryFeaturedEntries
          sumerianDictionaryService={sumerianDictionaryService}
        />
      )}
    </div>
  )
}

export default function SumerianDictionarySearchPage({
  sumerianDictionaryService,
}: {
  sumerianDictionaryService: SumerianDictionaryService
}): JSX.Element {
  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element =>
        session.isAllowedToReadSumerianWords() ? (
          <AuthorizedSearchPage
            sumerianDictionaryService={sumerianDictionaryService}
          />
        ) : (
          <SumerianRestrictedNotice />
        )
      }
    </SessionContext.Consumer>
  )
}
