import React from 'react'
import DynamicSitemap from 'react-dynamic-sitemap'
import { Route } from 'router/compat'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import type Services from 'router/Services'
import withData from 'http/withData'
import Bluebird from 'bluebird'
import convert from 'xml-js'
import _ from 'lodash'
import pako from 'pako'
import { saveAs } from 'file-saver'
import AboutRoutes from 'router/aboutRoutes'
import ToolsRoutes from 'router/toolsRoutes'
import SignRoutes from 'router/signRoutes'
import BibliographyRoutes from 'router/bibliographyRoutes'
import DictionaryRoutes from 'router/dictionaryRoutes'
import CorpusRoutes from 'router/corpusRoutes'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import ResearchProjectRoutes from 'router/researchProjectRoutes'
import FooterRoutes from 'router/footerRoutes'
import { type Slugs, type SlugsArray } from 'router/sitemapConfig'
import {
  composeWebsiteRoutes,
  type LazyWebsiteRouteGroup,
  type RouteModule,
  type RouteModuleProps,
} from 'router/websiteRouteGroups'
import IntroductionRoute from 'router/introductionRoute'

const DOMAIN = 'www.ebl.lmu.de'

const lazyWebsiteRouteModules: Record<LazyWebsiteRouteGroup, RouteModule> = {
  tools: ToolsRoutes,
  signs: SignRoutes,
  bibliography: BibliographyRoutes,
  dictionary: DictionaryRoutes,
  corpus: CorpusRoutes,
  fragmentarium: FragmentariumRoutes,
  researchProjects: ResearchProjectRoutes,
  footer: FooterRoutes,
}

function WebsiteRoutes(
  services: Services,
  sitemap: boolean,
  slugs?: Slugs,
): JSX.Element[] {
  const routeModuleProps: RouteModuleProps = {
    sitemap,
    ...services,
    ...slugs,
  }

  return composeWebsiteRoutes({
    introductionRoute: IntroductionRoute(services, sitemap),
    aboutRoutes: AboutRoutes(routeModuleProps),
    getRoutesForLazyGroup: (routeGroup) =>
      lazyWebsiteRouteModules[routeGroup](routeModuleProps),
  })
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
  slugs: Slugs,
): JSX.Element {
  const sitemapString = $(renderToString(Sitemap(services, slugs))).text()
  mapArchiveDownloadSitemap(chunkSitemap(sitemapString))
  return <></>
}

function chunkSitemap(sitemapString: string, chunkLength = 45000): string[] {
  const sitemapObject = convert.xml2js(sitemapString)
  const elements = sitemapObject.elements[0].elements
  return _.chunk(elements, chunkLength).map((chunk) => {
    const sitemapChunkObject = { ...sitemapObject }
    const chunkContent = { ...sitemapObject.elements[0] }
    chunkContent.elements = chunk
    sitemapChunkObject.elements = [chunkContent]
    return convert.js2xml(sitemapChunkObject)
  })
}

function mapArchiveDownloadSitemap(xmlStrings: string[]): void {
  const fileNames = xmlStrings.map((_string, i) => `sitemap${i + 1}.xml.gz`)
  const sitemapIndex = getSitemapIndex(fileNames)
  saveAs(
    new Blob([pako.gzip(sitemapIndex)], { type: 'application/gzip' }),
    'sitemap.xml.gz',
  )
  xmlStrings.forEach((xmlString, index) => {
    const archive = pako.gzip(xmlString.replaceAll('localhost', DOMAIN))
    const archiveBlob = new Blob([archive], {
      type: 'application/gzip',
    })
    saveAs(archiveBlob, fileNames[index])
  })
}

function getSitemapIndex(filenames: string[]): string {
  const sitemapString = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${filenames
        .map(
          (filename) => `<sitemap>
          <loc>https://${DOMAIN}/sitemap/${filename}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </sitemap>`,
        )
        .join('\n')}
    </sitemapindex>`
  return convert.js2xml(convert.xml2js(sitemapString))
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
  key: string,
): Bluebird<SlugsArray> {
  return services[service][getter]().then((array) =>
    mapStringsToSlugs(array, key),
  )
}

export async function getAllSlugs(services: Services): Bluebird<Slugs> {
  return {
    signSlugs: await getSlugs(services, 'signService', 'listAllSigns', 'id'),
    dictionarySlugs: await getSlugs(
      services,
      'wordService',
      'listAllWords',
      'id',
    ),
    bibliographySlugs: await getSlugs(
      services,
      'bibliographyService',
      'listAllBibliography',
      'id',
    ),
    realiaSlugs: await getSlugs(
      services,
      'realiaService',
      'listAllRealia',
      'id',
    ),
    fragmentSlugs: await getSlugs(
      services,
      'fragmentService',
      'listAllFragments',
      'id',
    ),
    textSlugs: await services.textService.listAllTexts(),
    chapterSlugs: await services.textService.listAllChapters(),
  }
}

export default withData<{ services: Services }, { services: Services }, Slugs>(
  ({ data, services }) => {
    return getSitemapAsFile(services, data)
  },
  ({ services }): Bluebird<Slugs> => getAllSlugs(services),
)
