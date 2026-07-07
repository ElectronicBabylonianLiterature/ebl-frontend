import { screen, within } from '@testing-library/react'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import {
  realiaEntryFactory,
  afoRegisterEntryFactory,
} from 'test-support/realia-fixtures'
import { afoVolumeId } from 'realia/ui/realiaSections'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { renderDisplay } from 'realia/ui/RealiaDisplay.testSupport'

jest.mock('realia/application/RealiaService')

describe('RealiaDisplay inline AfO cross-references', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('links an inline AfO cross-reference to the target lemma and its AfO volume', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 25',
      crossReference: 'Anu',
      crossReferences: [{ id: 'realia_anu', lemma: 'Anu' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('link', { name: 'Anu' })).toHaveAttribute(
      'href',
      `/tools/realia/Anu#${afoVolumeId('AfO 25')}`,
    )
  })

  it('encodes the target lemma, even with spaces and parentheses', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 50',
      crossReference: 'Elam',
      crossReferences: [{ id: 'realia_elam', lemma: 'Elam (Geschichte)' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('link', { name: 'Elam (Geschichte)' }),
    ).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Elam (Geschichte)')}#${afoVolumeId(
        'AfO 50',
      )}`,
    )
  })

  it('renders an unresolved inline AfO cross-reference as plain text', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      crossReference: 'Syntax',
      crossReferences: [],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByText('Syntax')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Syntax' }),
    ).not.toBeInTheDocument()
  })

  it('shows the AfO volume next to an inline AfO cross-reference link', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 48/49',
      page: '358',
      crossReference: 'Elam',
      crossReferences: [{ id: 'realia_elam', lemma: 'Elam (Geschichte)' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(
      screen.getByRole('link', { name: 'Elam (Geschichte)' }),
    ).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Elam (Geschichte)')}#${afoVolumeId(
        'AfO 48/49',
      )}`,
    )
    expect(screen.getByText('(AfO 48/49, 358)')).toBeInTheDocument()
  })

  it('links several resolved cross-references in one AfO entry', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: 'AfO 25',
      page: '370',
      crossReference: 'Anu, Enlil',
      crossReferences: [
        { id: 'realia_anu', lemma: 'Anu' },
        { id: 'realia_enlil', lemma: 'Enlil' },
      ],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('link', { name: 'Anu' })).toHaveAttribute(
      'href',
      `/tools/realia/Anu#${afoVolumeId('AfO 25')}`,
    )
    expect(screen.getByRole('link', { name: 'Enlil' })).toHaveAttribute(
      'href',
      `/tools/realia/Enlil#${afoVolumeId('AfO 25')}`,
    )
  })

  it('links an inline cross-reference without a hash when the entry has no AfO volume', async () => {
    const afoEntry = afoRegisterEntryFactory.build({
      afoVolume: '',
      page: '',
      AfO: '',
      crossReference: 'Anu',
      crossReferences: [{ id: 'realia_anu', lemma: 'Anu' }],
    })
    const entry = realiaEntryFactory.build({
      reallexikon: [],
      afoRegister: [afoEntry],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    expect(screen.getByRole('link', { name: 'Anu' })).toHaveAttribute(
      'href',
      '/tools/realia/Anu',
    )
    expect(screen.queryByText(/^\(AfO/)).not.toBeInTheDocument()
  })

  it('keeps an AfO entry whose only content is a cross-reference', async () => {
    const entry = realiaEntryFactory.build({
      id: 'Adad',
      reallexikon: [],
      afoRegister: [
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          page: '615',
          note: '',
          reference: '',
          crossReference: 'Iškur',
          crossReferences: [{ id: 'realia_iskur', lemma: 'Iškur' }],
        }),
        afoRegisterEntryFactory.build({
          mainWord: 'Adad',
          afoVolume: 'AfO 44/45',
          page: '615',
          note: 'kept note',
          reference: '',
          crossReference: '',
          crossReferences: [],
        }),
      ],
    })
    renderDisplay(entry)
    await waitForSpinnerToBeRemoved(screen)
    const afoList = screen.getByRole('list', { name: 'AfO 44/45' })
    expect(within(afoList).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Iškur' })).toHaveAttribute(
      'href',
      `/tools/realia/${encodeURIComponent('Iškur')}#${afoVolumeId('AfO 44/45')}`,
    )
  })
})
