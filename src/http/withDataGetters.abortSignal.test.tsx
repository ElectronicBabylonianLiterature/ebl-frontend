import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import FragmentService from 'fragmentarium/application/FragmentService'
import SignService from 'signs/application/SignService'
import MarkupService from 'markup/application/MarkupService'
import Annotator from 'fragmentarium/ui/image-annotation/Annotator'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'
import PeriodSearchFormGroup from 'fragmentarium/ui/search/SearchFormPeriod'
import Markup from 'markup/ui/markup'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { PeriodString } from 'query/FragmentQuery'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('signs/application/SignService')
jest.mock('markup/application/MarkupService')

type PendingRead = {
  signals: AbortSignal[]
  read: (...parameters: unknown[]) => Promise<never>
}

function pendingRead(): PendingRead {
  const signals: AbortSignal[] = []
  return {
    signals,
    read: (...parameters: unknown[]): Promise<never> => {
      signals.push(parameters[parameters.length - 1] as AbortSignal)
      return new Promise<never>(() => undefined)
    },
  }
}

const fragmentService = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const markupService = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()
const fragment = fragmentFactory.build()

async function expectAbortedOnUnmount(
  pending: PendingRead,
  unmount: () => void,
): Promise<void> {
  await waitFor(() => expect(pending.signals).toHaveLength(1))
  expect(pending.signals[0]).toBeInstanceOf(AbortSignal)
  expect(pending.signals[0].aborted).toBe(false)
  unmount()
  expect(pending.signals[0].aborted).toBe(true)
}

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
