import React from 'react'
import Promise from 'bluebird'
import ReactMarkdown from 'react-markdown'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import InlineMarkdown from 'common/InlineMarkdown'
import { Text } from 'corpus/domain/text'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'

function TextView({ text }: { text: Text }): JSX.Element {
  const title = <InlineMarkdown source={text.name} />

  return (
    <AppContent crumbs={[new SectionCrumb('Corpus'), new TextCrumb(title)]}>
      <section>
        <h3>Introduction</h3>
        <ReactMarkdown source={text.intro} />
      </section>
      <section>
        <h3>Chapters</h3>
        <ChapterNavigation text={text} />
      </section>
    </AppContent>
  )
}

export default withData<
  unknown,
  {
    genre: string
    category: string
    index: string
    textService: {
      find(genre: string, category: string, index: string): Promise<Text>
    }
  },
  Text
>(
  ({ data }) => <TextView text={data} />,
  ({ genre, category, index, textService }) =>
    textService.find(genre, category, index)
)
