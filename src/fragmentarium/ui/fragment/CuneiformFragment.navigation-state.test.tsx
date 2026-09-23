import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CuneiformFragment from 'fragmentarium/ui/fragment/CuneiformFragment'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import FragmentService from 'fragmentarium/application/FragmentService'
import WordService from 'dictionary/application/WordService'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import DossiersService from 'dossiers/application/DossiersService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

let mockSavePromise: Promise<Fragment>
const mockInfoSaves: jest.Mock<Promise<Fragment>>[] = []

jest.mock('fragmentarium/ui/info/Info', () => {
  return function InfoMock(props: {
    fragment: { number: string; publication: string }
    onSave: (save: () => Promise<Fragment>) => void
  }) {
    return (
      <div data-testid="fragment-info">
        {props.fragment.number}
        <span data-testid="fragment-publication">
          {props.fragment.publication}
        </span>
        <button
          type="button"
          onClick={() => props.onSave(mockInfoSaves[mockInfoSaves.length - 1])}
        >
          Save genres
        </button>
      </div>
    )
  }
})

jest.mock('fragmentarium/ui/fragment/CuneiformFragmentEditor', () => {
  const { useState } = jest.requireActual('react')
  return {
    EditorTabs: function EditorTabsMock(props: {
      fragment: { number: string }
      onSave: (save: () => Promise<Fragment>) => Promise<Fragment>
    }) {
      const [draft, setDraft] = useState(props.fragment.number)
      return (
        <div data-testid="fragment-editor">
          {props.fragment.number}
          <label>
            Fragment editor draft
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => props.onSave(() => mockSavePromise)}
          >
            Save fragment
          </button>
        </div>
      )
    },
  }
})

jest.mock('common/errors/ErrorAlert', () => {
  return function ErrorAlertMock(props: { error: Error | null }) {
    return props.error ? <div>{props.error.message}</div> : null
  }
})

jest.mock('fragmentarium/ui/fragment/FragmentInCorpus', () => {
  return function FragmentInCorpusMock() {
    return null
  }
})

jest.mock('fragmentarium/ui/images/Images', () => {
  return function ImagesMock() {
    return null
  }
})

const services = {
  fragmentService: {} as FragmentService,
  fragmentSearchService: {} as FragmentSearchService,
  dossiersService: {} as DossiersService,
  afoRegisterService: {} as AfoRegisterService,
  wordService: {} as WordService,
  findspotService: {} as FindspotService,
}

function view(fragment: Fragment): JSX.Element {
  return (
    <CuneiformFragment
      {...services}
      fragment={fragment}
      activeFolio={null}
      tab={null}
      activeLine={''}
    />
  )
}

it('renders the incoming fragment after navigation changes', () => {
  const firstFragment = fragmentFactory.build({ number: 'K.1' })
  const secondFragment = fragmentFactory.build({ number: 'K.2' })
  const { rerender } = render(view(firstFragment))

  expect(screen.getByTestId('fragment-info')).toHaveTextContent('K.1')
  expect(screen.getByTestId('fragment-editor')).toHaveTextContent('K.1')
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Fragment editor draft' }),
    { target: { value: 'K.1 local draft' } },
  )

  rerender(view(secondFragment))

  expect(screen.getByTestId('fragment-info')).toHaveTextContent('K.2')
  expect(screen.getByTestId('fragment-editor')).toHaveTextContent('K.2')
  expect(
    screen.getByRole('textbox', { name: 'Fragment editor draft' }),
  ).toHaveValue('K.2')

  rerender(view(firstFragment))

  expect(screen.getByTestId('fragment-info')).toHaveTextContent('K.1')
  expect(screen.getByTestId('fragment-editor')).toHaveTextContent('K.1')
  expect(
    screen.getByRole('textbox', { name: 'Fragment editor draft' }),
  ).toHaveValue('K.1')
})

it('does not show a previous fragment save error after navigation', async () => {
  const firstFragment = fragmentFactory.build({ number: 'K.1' })
  const secondFragment = fragmentFactory.build({ number: 'K.2' })
  let rejectSave: (error: Error) => void = () => undefined
  mockSavePromise = new Promise<Fragment>((_resolve, reject) => {
    rejectSave = reject
  })
  const { rerender } = render(view(firstFragment))

  await userEvent.click(screen.getByRole('button', { name: 'Save fragment' }))
  rerender(view(secondFragment))
  await act(async () => rejectSave(new Error('K.1 save failed')))

  expect(screen.queryByText('K.1 save failed')).not.toBeInTheDocument()
  expect(screen.getByTestId('fragment-editor')).toHaveTextContent('K.2')
})

it('dispatches an info save only after the previous one has settled', async () => {
  const fragment = fragmentFactory.build({ number: 'K.1' })
  let resolveAdd: (saved: Fragment) => void = () => undefined
  const addGenre = jest.fn(
    () =>
      new Promise<Fragment>((resolve) => {
        resolveAdd = resolve
      }),
  )
  const deleteGenre = jest.fn(() =>
    Promise.resolve({ ...fragment, publication: 'deleted' } as Fragment),
  )
  render(view(fragment))

  mockInfoSaves.push(addGenre)
  await userEvent.click(screen.getByRole('button', { name: 'Save genres' }))
  mockInfoSaves.push(deleteGenre)
  await userEvent.click(screen.getByRole('button', { name: 'Save genres' }))
  expect(deleteGenre).not.toHaveBeenCalled()

  await act(async () =>
    resolveAdd({ ...fragment, publication: 'added' } as Fragment),
  )

  expect(deleteGenre).toHaveBeenCalledTimes(1)
  expect(screen.getByTestId('fragment-publication')).toHaveTextContent(
    'deleted',
  )
})
