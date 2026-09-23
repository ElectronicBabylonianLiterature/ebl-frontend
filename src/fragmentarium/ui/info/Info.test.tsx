import React from 'react'
import Bluebird from 'bluebird'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Info from 'fragmentarium/ui/info/Info'
import FragmentService from 'fragmentarium/application/FragmentService'
import DossiersService from 'dossiers/application/DossiersService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Genres } from 'fragmentarium/domain/Genres'
import { Script } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { MesopotamianDate } from 'chronology/domain/Date'
import { mesopotamianDateFactory } from 'test-support/date-fixtures'
import { colophonFactory } from 'test-support/colophon-fixtures'
import { ResearchProjects } from 'research-projects/researchProject'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('dossiers/application/DossiersService')
jest.mock('afo-register/application/AfoRegisterService')

interface DetailsProps {
  updateGenres: (genres: Genres) => unknown
  updateScript: (script: Script) => unknown
  updateDate: (date?: MesopotamianDate) => unknown
  updateDatesInText: (dates: readonly MesopotamianDate[]) => unknown
}

let detailsProps: DetailsProps

jest.mock('fragmentarium/ui/info/Details', () => ({
  __esModule: true,
  default: (props: DetailsProps) => {
    detailsProps = props
    return <div data-testid="details" />
  },
}))

jest.mock('afo-register/ui/AfoRegisterFragmentRecords', () => ({
  __esModule: true,
  default: () => <div data-testid="afo-register" />,
}))

const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const dossiersServiceMock = new (DossiersService as jest.Mock<
  jest.Mocked<DossiersService>
>)()
const afoRegisterServiceMock = new (AfoRegisterService as jest.Mock<
  jest.Mocked<AfoRegisterService>
>)()

const fragment = fragmentFactory.build({}, { transient: { chance: undefined } })
const bareFragment = fragmentFactory.build(
  { uncuratedReferences: null, colophon: undefined, projects: [] },
  { associations: { externalNumbers: {} } },
)
const richFragment = fragmentFactory.build({
  uncuratedReferences: [{ document: 'CDLI', pages: [1] }],
  colophon: colophonFactory.build(),
  projects: [ResearchProjects.CAIC],
  externalNumbers: { cdliNumber: 'P000001' },
})
const saved = Bluebird.resolve(fragment)
const onSave = jest.fn((updated: Bluebird<Fragment>) => updated)

function renderInfo(shown: Fragment = fragment): void {
  render(
    <MemoryRouter>
      <Info
        fragment={shown}
        fragmentService={fragmentServiceMock}
        dossiersService={dossiersServiceMock}
        afoRegisterService={afoRegisterServiceMock}
        onSave={onSave}
      />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Info wires the detail editors to the fragment service', () => {
  it('routes a genre change through onSave', () => {
    renderInfo()
    fragmentServiceMock.updateGenres.mockReturnValue(saved)
    const genres = Genres.fromJson([])

    detailsProps.updateGenres(genres)

    expect(fragmentServiceMock.updateGenres).toHaveBeenCalledWith(
      fragment.number,
      genres,
    )
    expect(onSave).toHaveBeenCalledWith(saved)
  })

  it('saves a script change directly, without onSave', () => {
    renderInfo()
    fragmentServiceMock.updateScript.mockReturnValue(saved)

    const returned = detailsProps.updateScript(fragment.script)

    expect(fragmentServiceMock.updateScript).toHaveBeenCalledWith(
      fragment.number,
      fragment.script,
    )
    expect(returned).toBe(saved)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves a date, sending its dto', () => {
    renderInfo()
    fragmentServiceMock.updateDate.mockReturnValue(saved)
    const date = mesopotamianDateFactory.build()

    detailsProps.updateDate(date)

    expect(fragmentServiceMock.updateDate).toHaveBeenCalledWith(
      fragment.number,
      date.toDto(),
    )
  })

  it('clears the date when there is none', () => {
    renderInfo()
    fragmentServiceMock.updateDate.mockReturnValue(saved)

    detailsProps.updateDate()

    expect(fragmentServiceMock.updateDate).toHaveBeenCalledWith(
      fragment.number,
      undefined,
    )
  })

  it('drops empty entries from the dates in text', () => {
    renderInfo()
    fragmentServiceMock.updateDatesInText.mockReturnValue(saved)
    const date = mesopotamianDateFactory.build()

    detailsProps.updateDatesInText([date, null as unknown as MesopotamianDate])

    expect(fragmentServiceMock.updateDatesInText).toHaveBeenCalledWith(
      fragment.number,
      [date.toDto()],
    )
  })
})

describe('the optional sections follow the fragment', () => {
  const headings = ['Colophon', 'Projects', 'Resources']

  it.each(headings)(
    'hides the %s section when there is nothing to show',
    (heading) => {
      renderInfo(bareFragment)

      expect(
        screen.queryByRole('heading', { name: heading }),
      ).not.toBeInTheDocument()
    },
  )

  it('hides the uncurated references when there are none', () => {
    renderInfo(bareFragment)

    expect(screen.queryByText(/uncurated/i)).not.toBeInTheDocument()
  })

  it.each(headings)(
    'shows the %s section when the fragment has one',
    (heading) => {
      renderInfo(richFragment)

      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    },
  )

  it('shows the uncurated references when the fragment has them', () => {
    renderInfo(richFragment)

    expect(screen.getByText(/uncurated/i)).toBeInTheDocument()
  })
})
