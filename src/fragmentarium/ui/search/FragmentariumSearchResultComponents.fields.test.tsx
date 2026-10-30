import { screen } from '@testing-library/react'
import { fragment } from 'test-support/test-fragment'
import {
  createFragmentCardSummary,
  productionSummaryReferences,
  summaryBibliographyDocuments,
  SUMMARY_LEMMA_ID,
} from 'test-support/fragment-query-summary'
import { withPreviewLines } from 'test-support/fragment-query-preview'
import createReference from 'bibliography/application/createReference'
import { createResearchProject } from 'research-projects/researchProject'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { Fragment } from 'fragmentarium/domain/fragment'
import {
  dossiersService,
  fragmentService,
  renderFragmentLines,
} from 'fragmentarium/ui/search/FragmentariumSearchResultComponents.testSupport'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('dictionary/application/WordService')

beforeEach(() => {
  jest.clearAllMocks()
  dossiersService.queryByIds.mockResolvedValue([])
})

describe('FragmentLines', () => {
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
        matchingLines: [1, 2, 3, 4, 5],
        matchCount: 5,
        totalMatchingLines: 5,
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
    expect(
      screen.getByRole('button', { name: 'Show 3 more matching lines' }),
    ).toBeVisible()
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
})
