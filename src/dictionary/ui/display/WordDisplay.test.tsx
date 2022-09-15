import React, { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import WordDisplay from 'dictionary/ui/display/WordDisplay'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import MemorySession from 'auth/Session'
import Bluebird from 'bluebird'
import { dictionaryLineDisplayFactory } from 'test-support/chapter-fixtures'
import { DictionaryContext } from '../dictionary-context'
import { Chance } from 'chance'

jest.mock('dictionary/application/WordService')
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

jest.mock('corpus/application/TextService')
const textService = new (TextService as jest.Mock<jest.Mocked<TextService>>)()

const session = new MemorySession(['read:words'])

const chance = new Chance('word-display-test')

const word = {
  lemma: ['oheto', 'ofobuv'],
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
        lemma: ['utgibhev', 'ra'],
        notes: ['sulhe', 'ulkil'],
        homonym: 'II',
      },
      {
        lemma: ['tokteuf', 'nowu'],
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
  origin: 'cda',
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
      lemma: ['gajremdac', 'la'],
      notes: ['pe', 'usrew'],
      attested: false,
    },
    {
      lemma: ['rap', 'oneun'],
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

let container: HTMLElement

describe('Fetch word', () => {
  beforeEach(async () => {
    const genres = ['L', 'D', 'Lex', 'Med']
    wordService.find.mockReturnValue(Bluebird.resolve(word))
    textService.searchLemma.mockReturnValue(
      Bluebird.resolve([
        dictionaryLineDisplayFactory.build(
          {},
          { transient: { chance: chance } }
        ),
      ])
    )
    renderWordInformationDisplay()
    await screen.findByText(word.meaning)
    expect(wordService.find).toBeCalledWith('id')

    genres.forEach((genre) => {
      expect(textService.searchLemma).toBeCalledWith(word._id, genre)
    })
  })
  it('correctly displays word parts', async () => {
    await screen.findAllByText(new RegExp(word.guideWord))
    expect(container).toMatchSnapshot()
  })
})

function renderWordInformationDisplay() {
  container = render(
    <MemoryRouter initialEntries={['/dictionary/id']}>
      <SessionContext.Provider value={session}>
        <Route
          path="/dictionary/:id"
          render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
            <DictionaryContext.Provider value={wordService}>
              <WordDisplay
                textService={textService}
                wordService={wordService}
                {...props}
              />
            </DictionaryContext.Provider>
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  ).container
}
