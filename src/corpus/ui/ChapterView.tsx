import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import { ChapterId } from 'corpus/application/TextService'
import { ChapterDisplay } from 'corpus/domain/chapter'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'
import GenreCrumb from './GenreCrumb'
import { ChapterTitle } from './chapter-title'
import InlineMarkdown from 'common/InlineMarkdown'
import { LineColumns } from 'transliteration/ui/line-tokens'
import Markup from 'transliteration/ui/markup'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  createColumns,
  maxColumns,
  numberOfColumns,
} from 'transliteration/domain/columns'

interface Props {
  chapter: ChapterDisplay
}

function ChapterView({ chapter }: Props): JSX.Element {
  const columns = chapter.lines.map((line) =>
    createColumns(line.reconstruction)
  )
  const maxColumns_ = maxColumns(columns)
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Corpus'),
        new GenreCrumb(chapter.id.textId.genre),
        CorpusTextCrumb.ofChapterDisplay(chapter),
        new TextCrumb(`Chapter ${chapter.id.stage} ${chapter.id.name}`),
      ]}
      title={
        <>
          <InlineMarkdown source={chapter.textName} />
          <br />
          <small>
            Chapter{' '}
            <ChapterTitle
              showStage={!chapter.isSingleStage}
              chapter={{
                ...chapter.id,
                title: chapter.title,
                uncertainFragments: [],
              }}
            />
          </small>
        </>
      }
    >
      <table>
        {chapter.lines.map((line, index) => {
          const emptyColumns = maxColumns_ - numberOfColumns(columns[index])
          return (
            <React.Fragment key={index}>
              {line.intertext.length > 0 && (
                <tr>
                  <td colSpan={maxColumns_ + 3}>
                    (<Markup container="span" parts={line.intertext} />)
                  </td>
                </tr>
              )}
              <tr>
                <td>{lineNumberToString(line.number)}</td>
                <LineColumns
                  columns={columns[index]}
                  maxColumns={maxColumns_}
                />
                {emptyColumns > 0 && <td colSpan={emptyColumns} />}
                <td>{lineNumberToString(line.number)}</td>
                <td>
                  <Markup parts={line.translation} />
                </td>
              </tr>
            </React.Fragment>
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
  ChapterDisplay
>(
  ({ data, ...props }) => <ChapterView chapter={data} {...props} />,
  ({ id, textService }) => textService.findChapterDisplay(id),
  {
    watch: (props) => [props.id],
  }
)
