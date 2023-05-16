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
import { HeadTagsService } from 'router/head'

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
      render={({ match }): ReactNode => (
        <WordEditor
          wordService={wordService}
          id={decodeURIComponent(match.params.id)}
        />
      )}
    />,
    <Route
      key="WordDisplay"
      path="/dictionary/:id"
      render={({ match }): ReactNode => (
        <HeadTagsService
          title="eBL: Dictionary entry"
          description="electronic Babylonian Library (eBL) dictionary entry display"
        >
          <WordDisplay
            textService={textService}
            wordService={wordService}
            fragmentService={fragmentService}
            signService={signService}
            wordId={decodeURIComponent(match.params.id)}
          />
        </HeadTagsService>
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
        <HeadTagsService
          title="eBL: Search dictionary"
          description="Search the electronic Babylonian Library (eBL) dictionary"
        >
          <Dictionary wordService={wordService} {...props} />
        </HeadTagsService>
      )}
      {...(sitemap && sitemapDefaults)}
    />,
  ]
}
