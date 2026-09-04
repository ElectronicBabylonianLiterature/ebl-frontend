import React from 'react'
import Bluebird from 'bluebird'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { QueryItem } from 'query/QueryResult'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import WordService from 'dictionary/application/WordService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { fragment } from 'test-support/test-fragment'
import {
  createFragmentCardSummary,
  productionSummaryReferences,
  summaryBibliographyDocuments,
  SUMMARY_LEMMA_ID,
} from 'test-support/fragment-query-summary'
import {
  tokenWithClass,
  withPreviewLines,
} from 'test-support/fragment-query-preview'
import createReference from 'bibliography/application/createReference'
import { createResearchProject } from 'research-projects/researchProject'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentLines } from './FragmentariumSearchResultComponents'
import mockObjectUrl from 'test-support/mockObjectUrl'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const dossiersService = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()

mockObjectUrl('blob:url')

beforeEach(() => {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
})

function renderFragmentLines(
  queryItem: QueryItem,
  linesToShow = 3,
  queryLemmas?: readonly string[],
) {
  return render(
    <MemoryRouter>
      <DictionaryContext.Provider value={wordService}>
        <FragmentLines
          fragmentService={fragmentService}
          dossiersService={dossiersService}
          queryItem={queryItem}
          linesToShow={linesToShow}
          queryLemmas={queryLemmas}
        />
      </DictionaryContext.Provider>
    </MemoryRouter>,
  )
}

describe('FragmentLines', () => {
  it('renders compact summary lines and lemma highlights without hydration', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines(
      {
        museumNumber: fragment.number,
        matchingLines: [1, 2],
        matchCount: 2,
        fragment: withPreviewLines(fragment),
        cardSummary: createFragmentCardSummary(),
        thumbnailPath: null,
      },
      3,
      [SUMMARY_LEMMA_ID],
    )

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByRole('table')).toHaveTextContent('kur ša')
    expect(
      screen.getByText(
        tokenWithClass('Transliteration__Word--highlight', 'kur'),
      ),
    ).toBeInTheDocument()
  })

  it('renders empty compact previews without hydrating them', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [],
      matchCount: 0,
      fragment,
      cardSummary: createFragmentCardSummary(),
      thumbnailPath: null,
    })

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText(fragment.number)).toBeInTheDocument()
  })

  it('resolves summary thumbnail paths without fetching thumbnail blobs', async () => {
    const fragment = fragmentFactory.build({ hasPhoto: true, dossiers: [] })
    const thumbnailPath = `/fragments/${fragment.number}/thumbnail/small`

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [1, 2],
      matchCount: 2,
      fragment: withPreviewLines(fragment),
      cardSummary: createFragmentCardSummary(),
      thumbnailPath,
    })

    expect(
      await screen.findByAltText(`Preview of ${fragment.number}`),
    ).toHaveAttribute('src', `http://example.com${thumbnailPath}`)
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })

  it('shows the hydration spinner when the query item is not render-ready', async () => {
    fragmentService.find.mockReturnValueOnce(
      new Bluebird(() => undefined) as unknown as Bluebird<never>,
    )

    renderFragmentLines({
      museumNumber: 'X.1',
      matchingLines: [1, 2, 3],
      matchCount: 3,
    })

    expect(fragmentService.find).toHaveBeenCalledWith('X.1', [1, 2, 3], false)
    expect(await screen.findByLabelText('Spinner')).toBeInTheDocument()
    expect(screen.queryByText('X.1')).not.toBeInTheDocument()
  })

  it('fetches and renders a thumbnail for a hydrated fragment with a photo', async () => {
    const fragment = fragmentFactory.build({ hasPhoto: true, dossiers: [] })
    fragmentService.find.mockResolvedValueOnce(fragment)
    fragmentService.findThumbnail.mockResolvedValueOnce({
      blob: new Blob([''], { type: 'image/jpeg' }),
    })

    renderFragmentLines({
      museumNumber: fragment.number,
      matchingLines: [1, 2, 3],
      matchCount: 3,
    })

    expect(
      await screen.findByAltText(`Preview of ${fragment.number}`),
    ).toBeInTheDocument()
  })

  it('preserves scholarly card fields for production-shaped summaries', async () => {
    const summaryFragment = Fragment.create({
      ...fragment,
      references: productionSummaryReferences.map((reference) =>
        createReference({
          ...reference,
          document: summaryBibliographyDocuments[reference.id],
        }),
      ),
      projects: [createResearchProject('CAIC')],
      dossiers: [{ dossierId: 'D001', isUncertain: false }],
      archaeology: {
        excavationNumber: 'EX.7',
        site: { name: 'Babylon', abbreviation: '', parent: null },
      },
    })
    const thumbnailPath = '/fragments/Test.Fragment/thumbnail/small'
    dossiersService.queryByIds.mockResolvedValue([
      new DossierRecord({ _id: 'D001' }),
    ])

    renderFragmentLines(
      {
        museumNumber: summaryFragment.number,
        matchingLines: [1, 2],
        matchCount: 5,
        fragment: withPreviewLines(summaryFragment),
        cardSummary: createFragmentCardSummary(),
        thumbnailPath,
      },
      2,
      [SUMMARY_LEMMA_ID],
    )
    expect(await screen.findByRole('button', { name: 'D001' })).toBeVisible()

    expect(
      screen.getByRole('heading', { name: 'Test.Fragment (LB)' }),
    ).toBeVisible()
    expect(screen.getByText('Accession no.: A.38.b')).toBeVisible()
    expect(screen.getByText('Excavation no.: EX.7')).toBeVisible()
    expect(screen.getByText('Provenance: Babylon')).toBeVisible()
    expect(screen.getByText('ARCHIVE ➝ Administrative ➝ Lists')).toBeVisible()
    expect(screen.getByRole('time')).toHaveTextContent('1.I.1 SE')
    expect(
      screen.getByLabelText(
        'Link to Cuneiform Artefacts of Iraq in Context project',
      ),
    ).toBeVisible()
    expect(screen.getByText('1')).toBeVisible()
    expect(screen.getByRole('table')).toHaveTextContent('kur ša')
    expect(screen.getByText('And 3 more')).toBeVisible()
    expect(
      screen.getByText(/Borger/, {
        selector: '.reference-popover__interactive',
      }),
    ).toHaveTextContent('Borger, 1957: 12-13 [l. 1.] (D)')
    expect(
      await screen.findByAltText('Preview of Test.Fragment'),
    ).toHaveAttribute('src', `http://example.com${thumbnailPath}`)
    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(fragmentService.findThumbnail).not.toHaveBeenCalled()
  })
  it('counts remaining compact summary lines from rows actually rendered', () => {
    const fragment = fragmentFactory.build({ hasPhoto: false, dossiers: [] })

    renderFragmentLines(
      {
        museumNumber: fragment.number,
        matchingLines: [1, 2],
        matchCount: 7,
        fragment: withPreviewLines(fragment),
        cardSummary: createFragmentCardSummary(),
        thumbnailPath: null,
      },
      5,
    )

    expect(screen.getByText('And 5 more')).toBeInTheDocument()
  })
})
