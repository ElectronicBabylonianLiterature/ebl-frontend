import React from 'react'
import DynamicSitemap from 'react-dynamic-sitemap'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import { Route } from 'react-router-dom'
import { Services, WebsiteRoutes } from 'router/router'
import withData from 'http/withData'
import Bluebird from 'bluebird'

type SlugsArray = readonly { [key: string]: string }[]
export type SignSlugs = SlugsArray
export type DictionarySlugs = SlugsArray
export type BibliographySlugs = SlugsArray
export type FragmentSlugs = SlugsArray
export type TextSlugs = {
  index: number
  category: number
  genre: string
}[]
export type ChapterSlugs = {
  chapter: string
  stage: string
  index: number
  category: number
  genre: string
}[]

export interface Slugs {
  readonly signSlugs?: SignSlugs
  readonly dictionarySlugs?: DictionarySlugs
  readonly bibliographySlugs?: BibliographySlugs
  readonly fragmentSlugs?: FragmentSlugs
  readonly textSlugs?: TextSlugs
  readonly chapterSlugs?: ChapterSlugs
}

export const sitemapDefaults = {
  sitemapIndex: true,
  priority: 0,
  changefreq: 'weekly',
}

function Sitemap(services: Services, slugs?: Slugs): JSX.Element {
  return (
    <DynamicSitemap
      routes={() => <Route exact>{WebsiteRoutes(services, true, slugs)}</Route>}
      prettify={true}
    />
  )
}

export function getSitemapAsFile(
  services: Services,
  slugs: Slugs
): JSX.Element {
  const sitemapString = $(renderToString(Sitemap(services, slugs)))
    .text()
    .replaceAll('localhost', 'www.ebl.lmu.de')
  return downloadBlob(new Blob([sitemapString]), 'sitemap.xml')
}

function downloadBlob(blob, name): JSX.Element {
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = name
  document.body.appendChild(link)
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  )
  document.body.removeChild(link)
  return <></>
}

function mapStringsToSlugs(array: string[], key: string): SlugsArray {
  return array.map((element) => {
    return { [key]: element }
  })
}

async function getSlugs(
  services: Services,
  service: string,
  getter: string,
  key: string
): Bluebird<SlugsArray> {
  return services[service][getter]().then((array) =>
    mapStringsToSlugs(array, key)
  )
}

async function getAllSlugs(services: Services): Bluebird<Slugs> {
  return {
    signSlugs: await getSlugs(services, 'signService', 'listAllSigns', 'id'),
    dictionarySlugs: await getSlugs(
      services,
      'wordService',
      'listAllWords',
      'id'
    ),
    bibliographySlugs: await getSlugs(
      services,
      'bibliographyService',
      'listAllBibliography',
      'id'
    ),
    fragmentSlugs: await getSlugs(
      services,
      'fragmentService',
      'listAllFragments',
      'id'
    ),
    textSlugs: await services.textService.listAllTexts(),
    chapterSlugs: await services.textService.listAllChapters(),
  }
}

export default withData<{ services: Services }, { services: Services }, Slugs>(
  ({ data, services }) => {
    return getSitemapAsFile(services, data)
  },
  ({ services }): Bluebird<Slugs> => getAllSlugs(services)
)
