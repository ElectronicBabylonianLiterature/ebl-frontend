import React from 'react'
import Promise from 'bluebird'
import ReactMarkdown from 'react-markdown'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import InlineMarkdown from 'common/InlineMarkdown'
import { Text } from 'corpus/domain/text'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'
import ReferenceList from 'bibliography/ui/ReferenceList'

import './TextView.sass'

function TextView({ text }: { text: Text }): JSX.Element {
  const title = <InlineMarkdown source={text.name} />

  return (
    <AppContent crumbs={[new SectionCrumb('Corpus'), new TextCrumb(title)]}>
      <section className="text-view__introduction">
        <h3>Introduction</h3>
        <ReactMarkdown className="text-view__markdown" source={text.intro} />
        <section className="text-view__references">
          <h4>References</h4>
          <ReferenceList references={text.references} />
        </section>
      </section>
      <section className="text-view__chapter-list">
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
