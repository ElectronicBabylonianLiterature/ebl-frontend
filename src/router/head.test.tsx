import React from 'react'
import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext, HeadTags, HeadTagsService } from 'router/head'

HelmetProvider.canUseDOM = false

it('should render all metadata', () => {
  render(
    <HelmetProvider context={helmetContext}>
      <HeadTags title={'title'} description={''} />
    </HelmetProvider>,
  )
  expect(helmetContext['helmet']['title']['toString']()).toEqual(
    '<title data-rh="true">title</title>',
  )
  expect(helmetContext['helmet']['meta']['toString']()).toEqual(
    '<meta data-rh="true" name="description" content=""/><meta data-rh="true" property="og:title" content="title"/><meta data-rh="true" property="og:description" content=""/><meta data-rh="true" name="twitter:title" content="title"/><meta data-rh="true" name="twitter:description" content=""/>',
  )
})

it('should render all metadata', () => {
  render(
    <HelmetProvider context={helmetContext}>
      <HeadTagsService title={'title'} description={''}></HeadTagsService>
    </HelmetProvider>,
  )
  expect(helmetContext['helmet']['title']['toString']()).toEqual(
    '<title data-rh="true">title</title>',
  )
  expect(helmetContext['helmet']['meta']['toString']()).toEqual(
    '<meta data-rh="true" name="description" content=""/><meta data-rh="true" property="og:title" content="title"/><meta data-rh="true" property="og:description" content=""/><meta data-rh="true" name="twitter:title" content="title"/><meta data-rh="true" name="twitter:description" content=""/>',
  )
})
