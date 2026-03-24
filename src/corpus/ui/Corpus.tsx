import React, { useContext, useMemo } from 'react'
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
import createGenreLink from './createGenreLink'
import { useHistory } from 'router/compat'
import './Corpus.sass'

type SelectCallback = (eventKey: string | null) => void

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

export function groupTextsByCategory(
  texts: readonly TextInfo[],
): Record<number, readonly TextInfo[]> {
  return _(texts)
    .groupBy((text) => text.category)
    .mapValues((groupedTexts) => _.sortBy(groupedTexts, (text) => text.index))
    .value()
}

export function groupTextsByGenre(
  texts: readonly TextInfo[],
): Record<string, readonly TextInfo[]> {
  return _.groupBy(texts, (text) => text.genre)
}

function Texts({
  texts,
  categories,
}: {
  texts: readonly TextInfo[]
  categories: readonly string[]
}): JSX.Element {
  const textsByCategory = useMemo(() => groupTextsByCategory(texts), [texts])

  return (
    <>
      {categories.map((title, category) => (
        <section key={category} className="Corpus__category">
          <h3>
            <InlineMarkdown source={title} />
          </h3>
          <Container fluid as="ol" className="Corpus__text-list">
            {(textsByCategory[category] ?? []).map((text) => (
              <TextLine
                key={`${text.genre}-${text.category}-${text.index}`}
                text={text}
              />
            ))}
          </Container>
        </section>
      ))}
    </>
  )
}

export function genreFromAbbr(
  abbr: string,
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
  history?: History
}): JSX.Element {
  const textsByGenre = useMemo(() => groupTextsByGenre(texts), [texts])
  const routerHistory = useHistory()
  const activeHistory = history ?? routerHistory

  const openTab: SelectCallback = (eventKey: string | null): void => {
    if (eventKey !== null) {
      const url = createGenreLink(eventKey)
      activeHistory.push(url)
    }
  }

  return (
    <AppContent crumbs={[new SectionCrumb('Corpus')]}>
      <InfoBanner
        title="About the Corpus"
        description="The eBL corpus presents the best text reconstructions available, incorporating all previous scholarship and new manuscripts identified by the eBL team. Editions are constantly updated with new discoveries and include comprehensive translations and manuscript references."
        learnMorePath="/about/corpus"
      />
      <Container fluid className="Corpus">
        <Row className="Corpus__layout">
          <Col md={7}>
            <div className="Corpus__tabs">
              <Tabs activeKey={genre} onSelect={openTab} id="CorpusTab">
                {genres.map(({ genre, name, categories }) => (
                  <Tab eventKey={genre} title={name} key={genre}>
                    <Texts
                      texts={textsByGenre[genre] ?? []}
                      categories={categories}
                    />
                  </Tab>
                ))}
              </Tabs>
            </div>
          </Col>
          <Col md={5} className="Corpus__image-col">
            <ApiImage fileName="LibraryCropped.svg" />
          </Col>
        </Row>
      </Container>
    </AppContent>
  )
}

export default withData<
  { genre?: string; history?: History },
  {
    textService: { list(): Promise<readonly TextInfo[]> }
  },
  readonly TextInfo[]
>(
  ({ data, ...props }) => <Corpus texts={data} {...props} />,
  ({ textService }) => textService.list(),
)
