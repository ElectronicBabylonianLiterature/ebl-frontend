import { screen } from '@testing-library/react'
import Citation from 'bibliography/domain/Citation'
import DossierRecord from 'dossiers/domain/DossierRecord'
import { ResearchProjects } from 'research-projects/researchProject'
import {
  buildSummaryBackedFragment,
  createFragmentariumSearchTestContext,
  FragmentariumSearchTestContext,
} from 'fragmentarium/ui/search/FragmentariumSearch.testSupport'

jest.mock('fragmentarium/application/FragmentSearchService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('corpus/application/TextService')
jest.mock('bibliography/application/BibliographyService')
jest.mock('dossiers/application/DossiersService')

let context: FragmentariumSearchTestContext

beforeEach(() => {
  context = createFragmentariumSearchTestContext()
})

describe('Searching fragments from summary-backed results', () => {
  it('renders the prefetched summary row without hydrating the fragment', async () => {
    const { fragmentService, wordService, textService, dossiersService } =
      context
    const summaryFragment = buildSummaryBackedFragment()
    const citation = Citation.for(summaryFragment.references[0]).getMarkdown()

    fragmentService.query.mockReturnValueOnce(
      Promise.resolve({
        items: [
          {
            museumNumber: summaryFragment.number,
            matchingLines: [1, 2, 3, 4, 5, 6, 7],
            matchCount: 7,
            fragment: summaryFragment,
          },
        ],
        matchCountTotal: 7,
      }),
    )
    wordService.findAll.mockReturnValue(Promise.resolve([]))
    textService.query.mockReturnValueOnce(
      Promise.resolve({ items: [], matchCountTotal: 0 }),
    )
    dossiersService.queryByIds.mockResolvedValue([
      new DossierRecord({
        _id: 'D001',
        description: 'Summary dossier',
      }),
    ])

    await context.renderSearch(summaryFragment.number, {
      lemmas: 'test-lemma',
    })

    expect(fragmentService.find).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Spinner')).not.toBeInTheDocument()
    expect(screen.getByText('Found 7 lines in 1 document')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: `${summaryFragment.number} (${summaryFragment.script.period.abbreviation})`,
      }),
    ).toBeVisible()
    expect(
      screen.getByText(`Accession no.: ${summaryFragment.accession}`),
    ).toBeVisible()
    expect(
      screen.getByText(
        `Excavation no.: ${summaryFragment.archaeology?.excavationNumber}`,
      ),
    ).toBeVisible()
    expect(
      screen.getByText(
        `Provenance: ${summaryFragment.archaeology?.site?.name}`,
      ),
    ).toBeVisible()
    expect(screen.getByText('ARCHIVE ➝ Administrative')).toBeVisible()
    expect(screen.getByText('CANONICAL ➝ Divination (?)')).toBeVisible()
    expect(screen.getByRole('time')).toHaveTextContent(
      summaryFragment.date!.toString().split(' (')[0],
    )
    expect(screen.getByRole('time')).toHaveTextContent('30 August 302 BCE PJC')
    expect(screen.getByText(citation)).toBeVisible()
    expect(screen.getByAltText(ResearchProjects.CAIC.name)).toBeVisible()
    expect(screen.getByAltText(ResearchProjects.RECC.name)).toBeVisible()
    expect(screen.getByRole('button', { name: 'D001' })).toBeVisible()
    expect(screen.getByText('And 2 more')).toBeVisible()
  })
})
