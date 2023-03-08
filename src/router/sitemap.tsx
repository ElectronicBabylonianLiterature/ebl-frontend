import React from 'react'
import DynamicSitemap from 'react-dynamic-sitemap'
import { renderToString } from 'react-dom/server'
import { Route } from 'react-router-dom'
import { Services, WebsiteRoutes } from 'router/router'

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

export default function Sitemap(services: Services): JSX.Element {
  return (
    <DynamicSitemap
      routes={() => <Route exact>{WebsiteRoutes(services, true)}</Route>}
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
