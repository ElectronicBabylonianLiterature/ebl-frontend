import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import SignService from 'signs/application/SignService'
import MarkupService from 'markup/application/MarkupService'
import Annotator from 'fragmentarium/ui/image-annotation/Annotator'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'
import PeriodSearchFormGroup from 'fragmentarium/ui/search/SearchFormPeriod'
import Markup from 'markup/ui/markup'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { PeriodString } from 'query/FragmentQuery'
import { expectAbortedOnUnmount, pendingRead } from 'test-support/pendingRead'
import { MemoryRouter } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import SumerianWordDisplay from 'sumerian-dictionary/ui/SumerianWordDisplay'
import SumerianDictionarySearch from 'sumerian-dictionary/ui/SumerianDictionarySearch'
import SumerianCitationForm from 'sumerian-dictionary/ui/SumerianCitationForm'
import {
  SumerianDictionaryFeaturedEntries,
  SumerianDictionaryStatisticsBar,
} from 'sumerian-dictionary/ui/SumerianDictionaryOverview'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('signs/application/SignService')
jest.mock('markup/application/MarkupService')
jest.mock('sumerian-dictionary/application/SumerianDictionaryService')

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const markupService = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()
const fragment = fragmentFactory.build()
const sumerianDictionaryService = new (SumerianDictionaryService as jest.Mock<
  jest.Mocked<SumerianDictionaryService>
>)()

it('Annotator passes its signal to findPhoto', async () => {
  const pending = pendingRead()
  fragmentService.find.mockResolvedValue(fragment)
  fragmentService.findPhoto.mockImplementation(pending.read)

  const { unmount } = render(
    <Annotator
      number={fragment.number}
      fragmentService={fragmentService}
      signService={signService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
  expect(fragmentService.findPhoto).toHaveBeenCalledWith(
    fragment,
    pending.signals[0],
  )
})

it('PeriodSearchFormGroup passes its signal to fetchPeriods', async () => {
  const pending = pendingRead()
  fragmentService.fetchPeriods.mockImplementation(pending.read)

  const { unmount } = render(
    <PeriodSearchFormGroup
      scriptPeriod=""
      scriptPeriodModifier=""
      onChangeScriptPeriod={jest.fn()}
      onChangeScriptPeriodModifier={jest.fn()}
      fragmentService={fragmentService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
})

it('Markup passes its signal to fromString', async () => {
  const pending = pendingRead()
  markupService.fromString.mockImplementation(pending.read)

  const { unmount } = render(
    <Markup text="some text" markupService={markupService} />,
  )

  await expectAbortedOnUnmount(pending, unmount)
  expect(markupService.fromString).toHaveBeenCalledWith(
    'some text',
    pending.signals[0],
  )
})

it('FragmentAnnotation passes its signal to associateSigns', async () => {
  const pending = pendingRead()
  signService.associateSigns.mockImplementation(pending.read)

  const { unmount } = render(
    <FragmentAnnotation
      image={new Blob()}
      fragment={fragment}
      initialAnnotations={[]}
      fragmentService={fragmentService}
      signService={signService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
})

it('PeriodSearchFormGroup reports a cleared period as empty', async () => {
  const onChangeScriptPeriod = jest.fn()
  fragmentService.fetchPeriods.mockResolvedValue(['Neo-Assyrian'])
  render(
    <PeriodSearchFormGroup
      scriptPeriod={'Neo-Assyrian' as PeriodString}
      scriptPeriodModifier=""
      onChangeScriptPeriod={onChangeScriptPeriod}
      onChangeScriptPeriodModifier={jest.fn()}
      fragmentService={fragmentService}
    />,
  )
  const periodSelect = await screen.findByLabelText('select-period')

  fireEvent.keyDown(periodSelect, { key: 'Backspace' })

  expect(onChangeScriptPeriod).toHaveBeenCalledWith('')
})

it('SumerianWordDisplay passes its signal to find', async () => {
  const pending = pendingRead()
  sumerianDictionaryService.find.mockImplementation(pending.read)

  const { unmount } = render(
    <MemoryRouter>
      <SessionContext.Provider
        value={new MemorySession(['read:sumerian-words'])}
      >
        <SumerianWordDisplay
          id="o0033341"
          sumerianDictionaryService={sumerianDictionaryService}
          markupService={markupService}
        />
      </SessionContext.Provider>
    </MemoryRouter>,
  )

  await expectAbortedOnUnmount(pending, unmount)
})

it('SumerianDictionarySearch passes its signal to search', async () => {
  const pending = pendingRead()
  sumerianDictionaryService.search.mockImplementation(pending.read)

  const { unmount } = render(
    <SumerianDictionarySearch
      state={{ query: 'lugal', kind: 'all', source: 'any' }}
      sumerianDictionaryService={sumerianDictionaryService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
})

it('SumerianDictionaryStatisticsBar passes its signal to statistics', async () => {
  const pending = pendingRead()
  sumerianDictionaryService.statistics.mockImplementation(pending.read)

  const { unmount } = render(
    <SumerianDictionaryStatisticsBar
      sumerianDictionaryService={sumerianDictionaryService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
})

it('SumerianDictionaryFeaturedEntries passes its signal to findSummaries', async () => {
  const pending = pendingRead()
  sumerianDictionaryService.findSummaries.mockImplementation(pending.read)

  const { unmount } = render(
    <SumerianDictionaryFeaturedEntries
      sumerianDictionaryService={sumerianDictionaryService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
})

it('SumerianCitationForm passes its signal to fromString', async () => {
  const pending = pendingRead()
  markupService.fromString.mockImplementation(pending.read)

  const { unmount } = render(
    <SumerianCitationForm
      citationForm="lugal"
      atf="lugal"
      markupService={markupService}
    />,
  )

  await expectAbortedOnUnmount(pending, unmount)
})
