import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Route } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import SignService from 'signs/application/SignService'
import MemorySession from 'auth/Session'
import Bluebird from 'bluebird'
import { DictionaryContext } from '../dictionary-context'
import { Chance } from 'chance'
import { dictionaryLineDisplayFactory } from 'test-support/dictionary-line-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { fragment, lines } from 'test-support/test-fragment'
import { QueryResult } from 'query/QueryResult'
import { produce, castDraft } from 'immer'
import { Text } from 'transliteration/domain/text'
import { TextLine } from 'transliteration/domain/text-line'
import { HelmetProvider } from 'react-helmet-async'
import { helmetContext } from 'router/head'

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

jest.mock('corpus/application/TextService')
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

jest.mock('fragmentarium/application/FragmentService')
const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

jest.mock('signs/application/SignService')
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

const session = new MemorySession(['read:words'])

const chance = new Chance('word-display-test')

const word = {
  lemma: ['uhetu', 'upubum'],
  derived: [
    [
      {
        lemma: ['pabemiiwu', 'pa'],
        notes: ['tin', 'mi'],
        homonym: 'II',
      },
      {
        lemma: ['tesbu', 'pi'],
        notes: ['cujuwibi', 'vu'],
        homonym: 'IV',
      },
    ],
    [
      {
        lemma: ['utgibhem', 'ra'],
        notes: ['sulhe', 'ulkil'],
        homonym: 'II',
      },
      {
        lemma: ['tuktupu', 'nuwu'],
        notes: ['ziwaini', 'reguwza'],
        homonym: 'I',
      },
    ],
  ],
  _id: 'c49ca1a96f9ce4d45bdc9962307a703eba53c0a8',
  attested: true,
  legacyLemma: 'ri',
  homonym: 'IV',
  meaning:
    'Bo hafe jed egeragpo viwidih zutu we ijcegwoj opuziw agse wad eksorep edzu tuum za.',
  pos: ['MOD', 'PRP'],
  source: '**source**',
  guideWord: 'fe',
  arabicGuideWord: 'fe',
  origin: 'CDA',
  cdaAddenda: 'fe',
  supplementsAkkadianDictionaries: 'word',
  oraccWords: [
    {
      lemma: 'serbig',
      guideWord: 'mut',
    },
    {
      lemma: 'sujemges',
      guideWord: 'ak',
    },
  ],
  forms: [
    {
      lemma: ['gajāramdaš', 'la'],
      notes: ['pe', 'usrew'],
      attested: false,
    },
    {
      lemma: ['rap', 'nēnu'],
      notes: ['gi', 'sobkuva'],
      attested: false,
    },
  ],
  logograms: [
    {
      notes: ['zuisi', 'lan'],
      logogram: ['echo', 'bravo'],
    },
    {
      notes: ['ofinijvef', 'lo'],
      logogram: ['bravo', 'charlie'],
    },
  ],
  derivedFrom: {
    lemma: ['jaruw', 'itiparu'],
    notes: ['muvi', 'panum'],
    homonym: 'III',
  },
  akkadischeGlossareUndIndices: [
    {
      mainWord: '<sup style="font-style: normal;">serbig</sup>',
      note: '<sup style="font-style: normal;">jaruw</sup>',
      reference: '<em>itiparu</em>',
      AfO: 'panum',
      agiID: '17865',
    },
    {
      mainWord: 'puul',
      note: 'aasad asas <em>itiparu</em>',
      reference: '<i>širkū</i>',
      AfO: 'juzz',
      agiID: '87161',
    },
  ],
  amplifiedMeanings: [
    {
      meaning:
        'La gumib not ukugub niruhi majiv aruha ro zar zi adiazku tiwom wezil.',
      key: 'Dtt',
      vowels: [
        {
          value: ['a', 'e'],
          notes: ['walzec', 'mawif'],
        },
        {
          value: ['u', 'a'],
          notes: ['novi', 'gi'],
        },
      ],
      entries: [
        {
          meaning:
            'Mu efobizro cafofiri mub kes dovlulle gow tojovdad kiogfuz mupasa viegsif rogo tep aku resbeju wop ubro luez.',
          vowels: [
            {
              value: ['a', 'e'],
              notes: ['jefizo', 'kosgunra'],
            },
            {
              value: ['a', 'u'],
              notes: ['tiji', 'fenuaf'],
            },
          ],
        },
        {
          meaning:
            'Lahwev memzubam nusoge ebcem nifta wojfobop mikgu nus fohom cifa safezot wuot va ebo widmoc.',
          vowels: [
            {
              value: ['a', 'u'],
              notes: ['avadin', 'ja'],
            },
            {
              value: ['i', 'e'],
              notes: ['bur', 'louwadeg'],
            },
          ],
        },
      ],
    },
    {
      meaning:
        'Cafheejo juud ulzi we udubu odejibviz uhciw ge citmi hi uphowge tiri tatwovef hi dowuile dih wacbus najab.',
      key: 'N',
      vowels: [
        {
          value: ['e', 'u'],
          notes: ['seppoz', 'josewe'],
        },
        {
          value: ['u', 'e'],
          notes: ['tejfesag', 'mo'],
        },
      ],
      entries: [
        {
          meaning:
            'Levnevse irizob tetah radjic nagcir biiv ragow tu wit wiahahi miw pa kobjawib hol ilobelhon of soh.',
          vowels: [
            {
              value: ['i', 'e'],
              notes: ['juwufan', 'de'],
            },
            {
              value: ['u', 'u'],
              notes: ['macaju', 'leudva'],
            },
          ],
        },
        {
          meaning:
            'Cuttegav alo oluusute era esudoj futasuj ugha ecosu bueciri was jahi mozoscu ditniv vorun.',
          vowels: [
            {
              value: ['u', 'e'],
              notes: ['furoli', 'tum'],
            },
            {
              value: ['i', 'u'],
              notes: ['fislagji', 'ju'],
            },
          ],
        },
      ],
    },
  ],
}

const matchingLines = [0, 1]

const partialText = new Text({
  lines: lines.slice(2).map((lineDto) => new TextLine(lineDto)),
})

const partialLinesFragment = produce(fragment, (draft) => {
  draft.text = castDraft(partialText)
})

let container: HTMLElement

describe('Fetch word', () => {
  const setup = async () => {
    const queryResult: QueryResult = {
      items: [
        {
          museumNumber: 'Test.Fragment',
          matchingLines: matchingLines,
          matchCount: matchingLines.length,
        },
      ],
      matchCountTotal: matchingLines.length,
    }
    wordService.find.mockReturnValue(Bluebird.resolve(word))
    fragmentService.find.mockReturnValue(Bluebird.resolve(partialLinesFragment))
    fragmentService.query.mockReturnValue(Bluebird.resolve(queryResult))
    textService.searchLemma.mockReturnValue(
      Bluebird.resolve(
        dictionaryLineDisplayFactory.buildList(
          10,
          {},
          { transient: { chance: chance } },
        ),
      ),
    )
    textService.query.mockReturnValue(
      Bluebird.resolve({ items: [], matchCountTotal: 42 }),
    )

    renderWordInformationDisplay()
    await screen.findByText(word.meaning)

    await waitFor(() => expect(wordService.find).toBeCalledWith('id'))
    await waitFor(() =>
      expect(fragmentService.find).toBeCalledWith(
        fragment.number,
        matchingLines,
      ),
    )

    await waitFor(() =>
      expect(textService.query).toBeCalledWith({ lemmas: word._id }),
    )
    await waitFor(() =>
      expect(textService.searchLemma).toBeCalledWith(word._id, undefined),
    )
  }
  it('correctly displays word parts', async () => {
    await setup()
    await screen.findAllByText(new RegExp(word.guideWord))
    expect(container).toMatchSnapshot()
  })
  it('displays the matching lines', async () => {
    await setup()
    expect(screen.getAllByText('10')).toHaveLength(2)
  })
})

function renderWordInformationDisplay() {
  container = render(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={['/dictionary/id']}>
        <SessionContext.Provider value={session}>
          <Route
            path="/dictionary/:id"
            render={({ match }) => (
              <DictionaryContext.Provider value={wordService}>
                <WordDisplay
                  textService={textService}
                  wordService={wordService}
                  fragmentService={fragmentService}
                  signService={signService}
                  wordId={match.params.id ?? ''}
                />
              </DictionaryContext.Provider>
            )}
          />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  ).container
}
