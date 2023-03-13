import React from 'react'
import DynamicSitemap from 'react-dynamic-sitemap'
import { renderToString } from 'react-dom/server'
import { Route } from 'react-router-dom'
import { Services, WebsiteRoutes } from 'router/router'
import withData from 'http/withData'
import Bluebird from 'bluebird'

type SlugsArray = readonly { [key: string]: string }[]
export type SignSlugs = SlugsArray
export type DictionarySlugs = SlugsArray
export type BibliographySlugs = SlugsArray
export type FragmentSlugs = SlugsArray
export type CorpusSlugs = SlugsArray

export interface Slugs {
  readonly signSlugs?: SignSlugs
  readonly dictionarySlugs?: DictionarySlugs
  readonly bibliographySlugs?: BibliographySlugs
  readonly fragmentSlugs?: FragmentSlugs
  readonly corpusSlugs?: CorpusSlugs
}

export const sitemapDefaults = {
  sitemapIndex: true,
  priority: 0,
  changefreq: 'weekly',
}

export function getSitemap(services: Services): JSX.Element {
  return downloadBlob(SitemapXmlBlob(services), 'sitemap.xml')
}

function SitemapXmlBlob(services: Services): Blob {
  return new Blob([renderToString(Sitemap(services))], { type: 'text/xml' })
}

function Sitemap(services: Services, slugs?: Slugs): JSX.Element {
  return (
    <DynamicSitemap
      routes={() => <Route exact>{WebsiteRoutes(services, true, slugs)}</Route>}
      prettify={true}
    />
  )
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

async function getSignSlugs(services: Services): Bluebird<SignSlugs> {
  return services.signService
    .listAllSigns()
    .then((signIds) => mapStringsToSlugs(signIds, 'id'))
}

async function getAllSlugs(services: Services): Bluebird<Slugs> {
  return { signSlugs: await getSignSlugs(services) }
}

export default withData<{ services: Services }, { services: Services }, Slugs>(
  ({ data, services }) => Sitemap(services, data),
  ({ services }): Bluebird<Slugs> => getAllSlugs(services)
)
