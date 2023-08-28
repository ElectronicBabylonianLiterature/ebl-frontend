import React, { useContext, useMemo } from 'react'
import Bluebird from 'bluebird'
import AppContent from 'common/AppContent'
import { LinkContainer } from 'react-router-bootstrap'
import { SectionCrumb } from 'common/Breadcrumbs'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import withData from 'http/withData'
import CorpusTextCrumb from './CorpusTextCrumb'
import GenreCrumb from './GenreCrumb'
import { ChapterTitle } from './chapter-title'
import InlineMarkdown from 'common/InlineMarkdown'
import { createColumns, maxColumns } from 'transliteration/domain/columns'
import { Button, ButtonGroup } from 'react-bootstrap'
import SessionContext from 'auth/SessionContext'
import ChapterCrumb from './ChapterCrumb'
import { Text } from 'corpus/domain/text'
import Download from 'corpus/ui/Download'
import GotoButton from './GotoButton'
import SubmitCorrectionsButton from 'common/SubmitCorrectionsButton'
import TextService from 'corpus/application/TextService'
import { ChapterViewLine, ChapterViewLineVariant } from './ChapterViewLine'
import RowsContext, { useRowsContext } from './RowsContext'
import { SideBar } from './ChapterViewSideBar'
import { HowToCite } from './HowToCite'
import TranslationContext, { useTranslationContext } from './TranslationContext'
import { stageToAbbreviation } from 'common/period'

import './ChapterView.sass'
import WordService from 'dictionary/application/WordService'
import { HeadTags } from 'router/head'
import MarkupService from 'markup/application/MarkupService'

interface Props {
  chapter: ChapterDisplay
  expandLineLinks?: boolean
}

interface ChapterViewProps extends Props {
  activeLine: string
  textService: TextService
}

function Title({ chapter }: Props): JSX.Element {
  return (
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
  )
}

function EditChapterButton({ chapter }: Props): JSX.Element {
  const session = useContext(SessionContext)
  return (
    <LinkContainer
      to={`/corpus/${encodeURIComponent(
        chapter.id.textId.genre
      )}/${encodeURIComponent(chapter.id.textId.category)}/${encodeURIComponent(
        chapter.id.textId.index
      )}/${encodeURIComponent(
        stageToAbbreviation(chapter.id.stage)
      )}/${encodeURIComponent(chapter.id.name)}/edit`}
    >
      <Button
        variant="outline-primary"
        disabled={!session.isAllowedToWriteTexts()}
      >
        <i className="fas fa-edit"></i> Edit
      </Button>
    </LinkContainer>
  )
}

export function ChapterViewTable({
  chapter,
  textService,
  activeLine,
  expandLineLinks,
}: ChapterViewProps): JSX.Element {
  const columns = useMemo(
    () =>
      chapter.lines.map((line) =>
        createColumns(line.variants[0].reconstruction)
      ),
    [chapter.lines]
  )
  const maxColumns_ = maxColumns(columns)

  return (
    <table className="chapter-display">
      <tbody>
        {chapter.lines.map((line, index) => (
          <ChapterViewLine
            key={index}
            activeLine={activeLine}
            line={line}
            columns={columns[index]}
            maxColumns={maxColumns_}
            chapter={chapter}
            lineIndex={index}
            textService={textService}
            expandLineLinks={expandLineLinks}
          />
        ))}
      </tbody>
    </table>
  )
}

export function ChapterViewPartialTable({
  chapter,
  textService,
  activeLine,
  lineNumbers,
  variantNumbers,
  expandLineLinks,
}: ChapterViewProps & {
  lineNumbers: readonly number[]
  variantNumbers: readonly number[]
}): JSX.Element {
  const columns = useMemo(
    () =>
      chapter.lines.map((line) =>
        createColumns(line.variants[0].reconstruction)
      ),
    [chapter.lines]
  )
  const maxColumns_ = maxColumns(columns)

  let pos = -1

  return (
    <table className="chapter-display">
      <tbody>
        {chapter.lines.map((line, index) =>
          line.variants.map((_variant, variantIndex) => {
            pos++

            return (
              <ChapterViewLineVariant
                key={pos}
                activeLine={activeLine}
                line={line}
                absoluteLineIndex={lineNumbers[pos]}
                variantNumber={variantNumbers[pos]}
                variantIndex={variantIndex}
                columns={columns[index]}
                maxColumns={maxColumns_}
                chapter={chapter}
                lineIndex={index}
                textService={textService}
                expandLineLinks={expandLineLinks}
              />
            )
          })
        )}
      </tbody>
    </table>
  )
}

function ChapterViewHeadTags({
  chapter,
  markupService,
}: {
  chapter: ChapterDisplay
  markupService: MarkupService
}): JSX.Element {
  return (
    <HeadTags
      title={`${chapter.fullName}: Text edition in the electronic Babylonian Library`}
      description={`Edition of ${
        chapter.fullName
      } in the electronic Babylonian Library (eBL) Corpus. ${markupService.toString(
        chapter.title
      )}.`}
    />
  )
}

function ChapterView({
  chapter,
  text,
  textService,
  wordService,
  markupService,
  activeLine,
}: Props & {
  activeLine: string
  text: Text
  textService: TextService
  wordService: WordService
  markupService: MarkupService
}): JSX.Element {
  const rowsContext = useRowsContext(chapter.lines.length)
  const translationContext = useTranslationContext()
  const chapterViewTable = (
    <ChapterViewTable
      chapter={chapter}
      textService={textService}
      activeLine={activeLine}
    ></ChapterViewTable>
  )

  return (
    <RowsContext.Provider value={rowsContext}>
      <TranslationContext.Provider value={translationContext}>
        <AppContent
          crumbs={[
            new SectionCrumb('Corpus'),
            new GenreCrumb(chapter.id.textId.genre),
            CorpusTextCrumb.ofChapterDisplay(chapter),
            new ChapterCrumb(chapter.id),
          ]}
          title={<Title chapter={chapter} />}
          actions={
            <ButtonGroup>
              <Download
                chapter={chapter}
                wordService={wordService}
                textService={textService}
              />
              <GotoButton
                text={text}
                as={ButtonGroup}
                title="Go to"
                variant="outline-primary"
              />
              <EditChapterButton chapter={chapter} />
              <SubmitCorrectionsButton
                id={`text ${chapter.id.textId.genre} / ${chapter.fullName}`}
              />
            </ButtonGroup>
          }
          sidebar={<SideBar chapter={chapter} />}
        >
          <ChapterViewHeadTags
            chapter={chapter}
            markupService={markupService}
          />
          {chapter.isPublished && <HowToCite chapter={chapter} />}
          <section>
            <h3>Edition</h3>
            {chapterViewTable}
          </section>
        </AppContent>
      </TranslationContext.Provider>
    </RowsContext.Provider>
  )
}

export default withData<
  {
    textService: TextService
    wordService: WordService
    markupService: MarkupService
    activeLine: string
  },
  { id: ChapterId },
  [ChapterDisplay, Text]
>(
  ({ data: [chapter, text], ...props }) => (
    <ChapterView chapter={chapter} text={text} {...props} />
  ),
  ({ id, textService }) =>
    Bluebird.all([
      textService.findChapterDisplay(id),
      textService.find(id.textId),
    ]),
  {
    watch: (props) => [props.id],
  }
)
