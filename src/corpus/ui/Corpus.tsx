import React, { useContext } from 'react'
import _ from 'lodash'
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ApiImage from 'common/ApiImage'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import InlineMarkdown from 'common/InlineMarkdown'
import { TextInfo } from 'corpus/domain/text'
import { SectionCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'

function TextLine({ text }: { text: TextInfo }): JSX.Element {
  const title = (
    <>
      {text.index}. <InlineMarkdown source={text.name} />
    </>
  )
  const session = useContext(SessionContext)
  return (
    <Row as="li">
      <Col md={8}>
        {session.isAllowedToWriteTexts() ? (
          <Link to={`/corpus/${text.genre}/${text.category}/${text.index}`}>
            {title}
          </Link>
        ) : (
          title
        )}
      </Col>
      <Col md={4}>
        {text.numberOfVerses > 0 && (
          <>
            {text.approximateVerses ? '±' : ''}
            {text.numberOfVerses} vv.
          </>
        )}
      </Col>
    </Row>
  )
}

function Texts({
  texts,
  categories,
}: {
  texts: readonly TextInfo[]
  categories: readonly string[]
}): JSX.Element {
  return (
    <>
      {categories.map((title, category) => (
        <section key={category}>
          <h3>
            <InlineMarkdown source={title} />
          </h3>
          <Container fluid as="ol">
            {_(texts)
              .filter((text) => text.category === category)
              .sortBy((text) => text.index)
              .map((text, index) => <TextLine key={index} text={text} />)
              .value()}
          </Container>
        </section>
      ))}
    </>
  )
}

const genres: readonly {
  readonly genre: string
  readonly name: string
  readonly categories: readonly string[]
}[] = [
  {
    genre: 'L',
    name: 'Literature',
    categories: [
      '',
      'I. Narrative Poetry',
      'II. Monologue and dialogue literature',
      'III. Literary Hymns and Prayers',
    ],
  },
  {
    genre: 'D',
    name: 'Divination',
    categories: [
      '',
      'I. Celestial Divination (*Enūma Anu Enlil*)',
      'II. Terrestrial Divination (*Šumma Ālu*)',
      'III. Extispicy (*Bārûtu*)',
    ],
  },
  {
    genre: 'Lex',
    name: 'Lexicography',
    categories: ['', 'I.  Urra = *ḫubullu*'],
  },
]

function Corpus({ texts }: { texts: readonly TextInfo[] }): JSX.Element {
  return (
    <AppContent crumbs={[new SectionCrumb('Corpus')]}>
      <Container fluid>
        <Row>
          <Col md={5}>
            <Tabs defaultActiveKey="L" id={_.uniqueId('CorpusTab-')}>
              {genres.map(({ genre, name, categories }) => (
                <Tab eventKey={genre} title={name} key={genre}>
                  <Texts
                    texts={texts.filter((text) => text.genre === genre)}
                    categories={categories}
                  />
                </Tab>
              ))}
            </Tabs>
          </Col>
          <Col md={7}>
            <ApiImage fileName="LibraryCropped.svg" />
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}

export default withData<
  unknown,
  {
    textService: { list(): Promise<readonly TextInfo[]> }
  },
  readonly TextInfo[]
>(
  ({ data }) => <Corpus texts={data} />,
  ({ textService }) => textService.list()
)
