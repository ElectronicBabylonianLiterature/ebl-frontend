import React, { useState, ReactNode } from 'react'
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
import SiglumAndTransliteration from 'corpus/domain/SiglumAndTransliteration'
import { Col, Collapse, Container, Row } from 'react-bootstrap'
import { ChapterId } from 'corpus/application/TextService'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'

const TextCitation = referencePopover(({ reference }) => (
  <InlineMarkdown source={Citation.for(reference).getMarkdown()} />
))

function References({
  references,
}: {
  references: readonly Reference[]
}): JSX.Element {
  const separator = '; '
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
              {index > 0 && separator}
              <TextCitation reference={reference} />
            </React.Fragment>
          ))}
          .
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

function SiglumsAndTanslirationsSection({
  name,
  data,
}: {
  name: ReactNode
  data: readonly SiglumAndTransliteration[]
}): JSX.Element {
  return (
    <section className="text-view__colophon-chapter">
      <h4 className="text-view__colophon-chapter-heading">Chapter {name}</h4>
      <Container bsPrefix="text-view__chapter-colophons">
        {data.map(({ siglum, text }) => (
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
  )
}

const ChapterSiglumsAndTransliterations = withData<
  { id: ChapterId },
  {
    textService
    method: 'findColophons' | 'findUnplacedLines'
  },
  readonly SiglumAndTransliteration[]
>(
  ({ data, id }) =>
    _.isEmpty(data) ? null : (
      <SiglumsAndTanslirationsSection name={id.name} data={data} />
    ),
  ({ id, textService, method }) => textService[method](id),
  {
    watch: (props) => [props.id],
  }
)

function CollapsibleSection({
  heading,
  children,
}: {
  heading: ReactNode
  children: ReactNode
}): JSX.Element {
  const [isOpen, setOpen] = useState(false)
  const id = _.uniqueId('collapse-')
  return (
    <section className="text-view__section">
      <h3
        className="text-view__section-heading text-view__section-heading--collapse"
        onClick={() => setOpen(!isOpen)}
        aria-controls={id}
      >
        {heading}{' '}
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
        <div id={id}>{children}</div>
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
      <SessionContext.Consumer>
        {(session: Session): JSX.Element =>
          session.isAllowedToReadTexts() ? (
            <>
              <Introduction text={text} />
              <section className="text-view__section">
                <h3 className="text-view__section-heading">Chapters</h3>
                <ChapterNavigation text={text} />
              </section>
              <CollapsibleSection heading="Colophons">
                {text.chapters.map((chapter, index) => (
                  <ChapterSiglumsAndTransliterations
                    key={index}
                    id={ChapterId.fromText(text, chapter)}
                    textService={textService}
                    method="findColophons"
                  />
                ))}
              </CollapsibleSection>
              <CollapsibleSection heading="Unplaced Lines">
                {text.chapters.map((chapter, index) => (
                  <ChapterSiglumsAndTransliterations
                    key={index}
                    id={ChapterId.fromText(text, chapter)}
                    textService={textService}
                    method="findUnplacedLines"
                  />
                ))}
              </CollapsibleSection>
            </>
          ) : (
            <p>Please log in to view the text.</p>
          )
        }
      </SessionContext.Consumer>
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
