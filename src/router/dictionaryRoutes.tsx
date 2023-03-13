import React, { ReactNode } from 'react'
import Dictionary from 'dictionary/ui/search/Dictionary'
import WordEditor from 'dictionary/ui/editor/WordEditor'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import FragmentService from 'fragmentarium/application/FragmentService'
import TextService from 'corpus/application/TextService'
import WordService from 'dictionary/application/WordService'
import { Route } from 'react-router-dom'
import SignService from 'signs/application/SignService'
import { DictionarySlugs, sitemapDefaults } from 'router/sitemap'

export default function DictionaryRoutes({
  sitemap,
  fragmentService,
  textService,
  wordService,
  signService,
  dictionarySlugs,
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
      key="WordEditor"
      path="/dictionary/:id/edit"
      render={(props): ReactNode => (
        <WordEditor wordService={wordService} {...props} />
      )}
    />,
    <Route
      key="WordDisplay"
      path="/dictionary/:id"
      render={(props): ReactNode => (
        <WordDisplay
          textService={textService}
          wordService={wordService}
          fragmentService={fragmentService}
          signService={signService}
          {...props}
        />
      )}
      {...(sitemap && {
        ...sitemapDefaults,
        slugs: dictionarySlugs,
      })}
    />,
    <Route
      key="Dictionary"
      path="/dictionary"
      render={(props): ReactNode => (
        <Dictionary wordService={wordService} {...props} />
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
