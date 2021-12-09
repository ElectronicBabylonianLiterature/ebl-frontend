import React from 'react'
import Promise from 'bluebird'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { ChapterId } from 'corpus/application/TextService'
import { ChapterListing, Text } from 'corpus/domain/text'
import { Chapter } from 'corpus/domain/chapter'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'
import GenreCrumb from './GenreCrumb'
import { ChapterTitle } from './chapter-title'
import InlineMarkdown from 'common/InlineMarkdown'
import { LineColumns } from 'transliteration/ui/line-tokens'
import _ from 'lodash'

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
      <table>
        {chapter.lines.map((line, index) => {
          const defaultVariant = line.variants[0]
          return (
            <tr key={index}>
              <td>{line.number}</td>
              <LineColumns
                columns={[
                  {
                    span: null,
                    content: defaultVariant.reconstructionTokens,
                  },
                ]}
                maxColumns={1}
              />
              <td>{line.number}</td>
              <td>{_.head(line.translation.split('\n'))}</td>
            </tr>
          )
        })}
      </table>
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
