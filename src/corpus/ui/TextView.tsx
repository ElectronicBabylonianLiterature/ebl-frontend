import React from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
import ReactMarkdown from 'react-markdown'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import { Text } from 'corpus/domain/text'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'
import Reference, { groupReferences } from 'bibliography/domain/Reference'
import referencePopover from 'bibliography/ui/referencePopover'
import CorpusTextCrumb from './CorpusTextCrumb'
import InlineMarkdown from 'common/InlineMarkdown'
import Citation from 'bibliography/domain/Citation'

import './TextView.sass'
import { Transliteration } from 'transliteration/ui/Transliteration'
import Colophon from 'corpus/domain/Colophon'
import { Col, Container, Row } from 'react-bootstrap'

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
  { name: string },
  {
    genre: string
    category: string
    index: string
    stage: string
    textService
  },
  readonly Colophon[]
>(
  ({ data: colophons, name }) =>
    _.isEmpty(colophons) ? null : (
      <section>
        <h4>{name}</h4>
        <Container>
          {colophons.map(({ siglum, text }) => (
            <Row key={siglum}>
              <Col md={2}>
                <h5>{siglum}</h5>
              </Col>
              <Col md={10}>
                <Transliteration text={text} />
              </Col>
            </Row>
          ))}
        </Container>
      </section>
    ),
  ({ genre, category, index, stage, name, textService }) =>
    textService.findManuscripts(genre, category, index, stage, name),
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
        <ChapterColophons
          key={index}
          genre={text.genre}
          category={text.category.toString()}
          index={text.index.toString()}
          stage={chapter.stage}
          name={chapter.name}
          textService={textService}
        />
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
      <section>
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
