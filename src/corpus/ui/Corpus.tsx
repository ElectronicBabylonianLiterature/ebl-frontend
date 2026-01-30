import React, { useContext } from 'react'
import _ from 'lodash'
import { History } from 'history'
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import ApiImage from 'common/ApiImage'
import AppContent from 'common/AppContent'
import InfoBanner from 'common/InfoBanner'
import withData from 'http/withData'
import SessionContext from 'auth/SessionContext'
import InlineMarkdown from 'common/InlineMarkdown'
import { TextInfo } from 'corpus/domain/text'
import { SectionCrumb } from 'common/Breadcrumbs'
import Promise from 'bluebird'
import { SelectCallback } from 'react-bootstrap/esm/helpers'
import createGenreLink from './createGenreLink'

function TextLine({ text }: { text: TextInfo }): JSX.Element {
  const title = (
    <>
      {text.index}. <InlineMarkdown source={text.name} />
    </>
  )
  const session = useContext(SessionContext)
  return (
    <Row as="li">
      <Col>
        {session.isAllowedToReadTexts() ? (
          <Link to={`/corpus/${text.genre}/${text.category}/${text.index}`}>
            {title}
          </Link>
        ) : (
          title
        )}
        {text.numberOfVerses > 0 && (
          <>
            {' '}
            — {text.approximateVerses ? '±' : ''}
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

export function genreFromAbbr(
  abbr: string
): 'Literature' | 'Divination' | 'Medicine' | 'Magic' {
  const genre = genres.filter(({ genre }) => genre === abbr)[0]
  if (!genre) {
    throw new Error(`Genre Abbreviation '${abbr}' has to be one of L, D, Med.`)
  }
  return genre.name as 'Literature' | 'Divination' | 'Medicine' | 'Magic'
}

export const genres: readonly {
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
      'II. Terrestrial Divination (*Šumma ālu*)',
      'III. Extispicy (*Bārûtu*)',
    ],
  },
  {
    genre: 'Med',
    name: 'Medicine',
    categories: ['', 'I. Nineveh Medical Encyclopaedia'],
  },
  {
    genre: 'Mag',
    name: 'Magic',
    categories: [
      '',
      'I. Anti-witchcraft',
      'II. “Hand-lifting” Prayers (*šuʾilas*)',
    ],
  },
]

function Corpus({
  texts,
  genre = 'L',
  history,
}: {
  texts: readonly TextInfo[]
  genre?: string
  history: History
}): JSX.Element {
  const openTab: SelectCallback = (eventKey: string | null): void => {
    if (eventKey !== null) {
      const url = createGenreLink(eventKey)
      history.push(url)
    }
  }

  return (
    <AppContent crumbs={[new SectionCrumb('Corpus')]}>
      <InfoBanner
        title="About the Corpus"
        description="The eBL corpus presents the best text reconstructions available, incorporating all previous scholarship and new manuscripts identified by the eBL team. Editions are constantly updated with new discoveries and include comprehensive translations and manuscript references."
        learnMorePath="/about/corpus"
      />
      <Container fluid>
        <Row>
          <Col md={6}>
            <Tabs
              activeKey={genre}
              onSelect={openTab}
              id={_.uniqueId('CorpusTab-')}
            >
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
          <Col md={6}>
            <ApiImage fileName="LibraryCropped.svg" />
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}

export default withData<
  { genre?: string; history: History },
  {
    textService: { list(): Promise<readonly TextInfo[]> }
  },
  readonly TextInfo[]
>(
  ({ data, ...props }) => <Corpus texts={data} {...props} />,
  ({ textService }) => textService.list()
)
