import React from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
import ReactMarkdown from 'react-markdown'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Chapter, Text } from 'corpus/domain/text'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import referencePopover from 'bibliography/ui/referencePopover'
import CorpusTextCrumb from './CorpusTextCrumb'
import InlineMarkdown from 'common/InlineMarkdown'
import Citation from 'bibliography/domain/Citation'

import './TextView.sass'

const TextCitation = referencePopover(({ reference }) => (
  <InlineMarkdown source={Citation.for(reference).getMarkdown()} />
))

function References({
  references,
}: {
  references: readonly Reference[]
}): JSX.Element {
  return (
    <section className="text-view__references">
      <h4>References</h4>
      {groupReferences(references).map(([type, group]) => (
        <p key={type} className="text-view__reference-group">
          <b className="text-view__reference-group-title">
            {_.startCase(type.toLowerCase())}
          </b>
          :{' '}
          {group.map((reference, index) => (
            <React.Fragment key={index}>
              {index > 0 && ', '}
              <TextCitation reference={reference} />
            </React.Fragment>
          ))}
        </p>
      ))}
    </section>
  )
}

const ChapterColophons = withData<
  unknown,
  {
    genre: string
    category: string
    index: string
    stage: string
    name: string
    textService
  },
  Chapter
>(
  ({ data: chapter }) => (
    <>
      {chapter.manuscripts.map((manuscript) => (
        <article key={manuscript.siglum}>
          <h5>{manuscript.siglum}</h5>
          <pre>{manuscript.colophon}</pre>
        </article>
      ))}
    </>
  ),
  ({ genre, category, index, stage, name, textService }) =>
    textService.findChapter(genre, category, index, stage, name),
  {
    watch: (props) => [
      props.genre,
      props.category,
      props.index,
      props.stage,
      props.name,
    ],
  }
)

function Colophons({
  text,
  textService,
}: {
  text: Text
  textService
}): JSX.Element {
  return (
    <>
      {text.chapters.map((chapter, index) => (
        <section key={index}>
          <h4>{chapter.name}</h4>
          <ChapterColophons
            genre={text.genre}
            category={text.category.toString()}
            index={text.index.toString()}
            stage={chapter.stage}
            name={chapter.name}
            textService={textService}
          />
        </section>
      ))}
    </>
  )
}

function TextView({
  text,
  textService,
}: {
  text: Text
  textService
}): JSX.Element {
  return (
    <AppContent
      crumbs={[new SectionCrumb('Corpus'), new CorpusTextCrumb(text)]}
    >
      <section className="text-view__introduction">
        <h3>Introduction</h3>
        <ReactMarkdown className="text-view__markdown" source={text.intro} />
        {!_.isEmpty(text.references) && (
          <References references={text.references} />
        )}
      </section>
      <section className="text-view__chapter-list">
        <h3>Chapters</h3>
        <ChapterNavigation text={text} />
      </section>
      <section className="text-view__chapter-list">
        <h3>Colophons</h3>
        <Colophons text={text} textService={textService} />
      </section>
    </AppContent>
  )
}

export default withData<
  {
    textService: {
      find(genre: string, category: string, index: string): Promise<Text>
    }
  },
  {
    genre: string
    category: string
    index: string
  },
  Text
>(
  ({ data, textService }) => <TextView text={data} textService={textService} />,
  ({ genre, category, index, textService }) =>
    textService.find(genre, category, index)
)
