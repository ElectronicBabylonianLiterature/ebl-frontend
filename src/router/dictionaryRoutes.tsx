import React, { ReactNode } from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import { Route, Redirect } from 'router/compat'
import SignService from 'signs/application/SignService'
import { DictionarySlugs } from 'router/sitemap'
import NotFoundPage from 'NotFoundPage'

export default function DictionaryRoutes({
  sitemap: _sitemap,
  fragmentService: _fragmentService,
  textService: _textService,
  wordService: _wordService,
  signService: _signService,
  dictionarySlugs: _dictionarySlugs,
}: {
  sitemap: boolean
  fragmentService: FragmentService
  textService: TextService
  wordService: WordService
  signService: SignService
  dictionarySlugs?: DictionarySlugs
}): JSX.Element[] {
  return [
    <Route
      key="dictionary-editor-redirect"
      path="/dictionary/:id/edit"
      exact
      render={({ match }): ReactNode => (
        <Redirect to={`/tools/dictionary/${match.params.id}/edit`} />
      )}
    />,
    <Route
      key="dictionary-display-redirect"
      path="/dictionary/:id"
      exact
      render={({ match }): ReactNode => (
        <Redirect to={`/tools/dictionary/${match.params.id}`} />
      )}
    />,
    <Redirect
      exact
      from="/dictionary"
      to="/tools/dictionary"
      key="dictionary-redirect"
    />,
    <Route
      key="DictionaryNotFound"
      path="/dictionary/*"
      render={(): ReactNode => <NotFoundPage />}
    />,
  ]
}
