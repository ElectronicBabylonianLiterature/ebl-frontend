import React from 'react'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { ChapterId } from 'corpus/application/TextService'
import { Chapter, ChapterListing, Text } from 'corpus/domain/text'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'
import GenreCrumb from './GenreCrumb'
import { ChapterTitle } from './chapter-title'
import InlineMarkdown from 'common/InlineMarkdown'

interface Props {
  text: Text
  chapter: Chapter
}

function ChapterView({ text, chapter }: Props): JSX.Element {
  const listing: ChapterListing | undefined = text.chapters.find(
    (listing) =>
      listing.name === chapter.name && listing.stage === chapter.stage
  )
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(text.genre),
        new CorpusTextCrumb(text),
        new TextCrumb(`Chapter ${chapter.stage} ${chapter.name}`),
      ]}
      title={
        <>
          <InlineMarkdown source={text.title} />
          {listing && (
            <>
              <br />
              <small>
                Chapter <ChapterTitle text={text} chapter={listing} />
              </small>
            </>
          )}
        </>
      }
    >
      ...
    </AppContent>
  )
}

export default withData<
  {
    textService
  },
  { id: ChapterId },
  [Text, Chapter]
>(
  ({ data: [text, chapter], ...props }) => (
    <ChapterView text={text} chapter={chapter} {...props} />
  ),
  ({ id, textService }) =>
    Promise.all([
      textService.find(id.genre, id.category, id.index),
      textService.findChapter(id),
    ]),
  {
    watch: (props) => [props.id],
  }
)
