import React from 'react'
import AppContent from 'common/AppContent'
import InlineMarkdown from 'common/InlineMarkdown'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'
import { Text } from 'corpus/domain/text'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'

function TextView({ text }: { text: Text }): JSX.Element {
  const title = <InlineMarkdown source={text.name} />

  return (
    <AppContent crumbs={[new SectionCrumb('Corpus'), new TextCrumb(title)]}>
      <ChapterNavigation text={text} />
    </AppContent>
  )
}

export default withData<
  unknown,
  {
    category: string
    index: string
    textService: { find(category: string, index: string): Promise<Text> }
  },
  Text
>(
  ({ data }) => <TextView text={data} />,
  ({ category, index, textService }) => textService.find(category, index)
)
