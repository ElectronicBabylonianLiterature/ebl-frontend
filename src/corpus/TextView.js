import React from 'react'
import AppContent from 'common/AppContent'
import InlineMarkdown from 'common/InlineMarkdown'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'

function TextView({ text }) {
  const title = <InlineMarkdown source={text.name} />

  return (
    <AppContent crumbs={['Corpus', title]}>
      <ChapterNavigation text={text} />
    </AppContent>
  )
}

export default withData(
  ({ data }) => <TextView text={data} />,
  ({ category, index, textService }) => textService.find(category, index)
)
