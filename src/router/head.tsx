import React, { PropsWithChildren } from 'react'
import { Helmet } from 'react-helmet-async'

interface RouteAndHeadProps {
  title: string
  description: string
}

export const helmetContext = {}

export function HeadTags({
  title = 'electronic Babylonian Library',
  description = 'The electronic Babylonian Library (eBL) Project brings together ancient Near Eastern specialists and data scientists to revolutionize the way in which the literature of Iraq in the first millennium BCE is reconstructed and analyzed.',
}: {
  title: string
  description: string
}): JSX.Element {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

export function HeadTagsService({
  title,
  description,
  children,
}: PropsWithChildren<RouteAndHeadProps>): JSX.Element {
  return (
    <>
      <HeadTags title={title} description={description} />
      {children}
    </>
  )
}
