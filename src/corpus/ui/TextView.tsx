import React, { useState } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
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
import { Col, Collapse, Container, Row } from 'react-bootstrap'

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

function Introduction({
  text: { intro, references },
}: {
  text: Text
}): JSX.Element {
  return (
    <section className="text-view__section">
      <h3 className="text-view__section-heading">Introduction</h3>
      <ReactMarkdown className="text-view__markdown" source={intro} />
      {!_.isEmpty(references) && <References references={references} />}
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
      <section className="text-view__colophon-chapter">
        <h4 className="text-view__colophon-chapter-heading">Chapter {name}</h4>
        <Container bsPrefix="text-view__chapter-colophons">
          {colophons.map(({ siglum, text }) => (
            <Row key={siglum}>
              <Col md={2}>
                <h5 className="text-view__colophon-siglum">{siglum}</h5>
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
    textService.findColophons(genre, category, index, stage, name),
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
  const [isOpen, setOpen] = useState(false)
  const id = _.uniqueId('colophons-')
  return (
    <section className="text-view__section">
      <h3
        className="text-view__section-heading text-view__section-heading--collapse"
        onClick={() => setOpen(!isOpen)}
        aria-controls={id}
      >
        Colophons{' '}
        <i
          className={classNames({
            'text-view__collapse-indicator': true,
            fas: true,
            'fa-caret-right': !isOpen,
            'fa-caret-down': isOpen,
          })}
          aria-expanded={isOpen}
        ></i>
      </h3>
      <Collapse in={isOpen} mountOnEnter={true}>
        <div id={id}>
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
        </div>
      </Collapse>
    </section>
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
      <Introduction text={text} />
      <section className="text-view__section">
        <h3 className="text-view__section-heading">Chapters</h3>
        <ChapterNavigation text={text} />
      </section>
      <Colophons text={text} textService={textService} />
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
