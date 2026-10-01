import React, { act } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LemmaAnnotation, {
  LemmaAnnotatorProps,
  LineLemmaAnnotations,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { wordFactory } from 'test-support/word-fixtures'
import {
  createEditableTokens,
  mockWord,
  text,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation.testSupport'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')

const wordServiceMock = new (WordService as jest.Mock<
  jest.Mocked<WordService>
>)()
const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const updateAnnotation = jest.fn<Promise<Fragment>, [LineLemmaAnnotations]>()

let editableTokens: EditableToken[]
let annotationRef: React.RefObject<LemmaAnnotation>

function renderAnnotation(tokens: EditableToken[] = editableTokens): void {
  const props: LemmaAnnotatorProps = {
    wordService: wordServiceMock,
    text,
    editableTokens: tokens,
    museumNumber: 'A.38',
    fragmentService: fragmentServiceMock,
    setText: jest.fn(),
    updateAnnotation,
  }
  render(<LemmaAnnotation {...props} ref={annotationRef} />)
}

async function lemmatizeActiveToken(): Promise<void> {
  fireEvent.change(screen.getByLabelText('edit-token-lemmas'), {
    target: { value: 'mock' },
  })
  await userEvent.click(await screen.findByText('mockLemma'))
}

async function chooseAction(action: RegExp): Promise<void> {
  await userEvent.click(screen.getByLabelText('Open token actions'))
  const item = screen.getByText(action)
  await userEvent.hover(item)
  await userEvent.click(item)
}

beforeEach(() => {
  editableTokens = createEditableTokens()
  annotationRef = React.createRef<LemmaAnnotation>()
  wordServiceMock.searchLemma.mockResolvedValue([mockWord])
})

it('applies the lemmas to all instances of the token', async () => {
  renderAnnotation()
  await userEvent.click(screen.getByText('kur'))
  await lemmatizeActiveToken()

  await chooseAction(/Update all instances of/)

  const [ra, kur, brokenKur] = editableTokens
  expect(ra.isDirty).toBe(false)
  expect(kur.lemmas.map((lemma) => lemma.value)).toEqual(['mockLemma'])
  expect(brokenKur.lemmas.map((lemma) => lemma.value)).toEqual(['mockLemma'])
  expect(brokenKur.isPending).toBe(false)
})

it('resets all instances of the token', async () => {
  renderAnnotation()
  await userEvent.click(screen.getByText('kur'))
  await lemmatizeActiveToken()
  await chooseAction(/Update all instances of/)

  await chooseAction(/Reset all instances of/)

  expect(editableTokens.map((token) => token.isDirty)).toEqual([
    false,
    false,
    false,
  ])
})

it('resets the current token', async () => {
  renderAnnotation()
  await lemmatizeActiveToken()
  expect(editableTokens[0].isDirty).toBe(true)

  await userEvent.click(screen.getByLabelText('reset-current-token'))

  expect(editableTokens[0].isDirty).toBe(false)
})

it('clears the lemmas when the editor reports no selection', async () => {
  renderAnnotation()
  await lemmatizeActiveToken()

  act(() => annotationRef.current?.editHandlers.handleChange(null))

  expect(editableTokens[0].lemmas).toEqual([])
})

it('ignores a created proper noun without an id', async () => {
  renderAnnotation()

  act(() =>
    annotationRef.current?.onCreateProperNoun(wordFactory.build({ _id: '' })),
  )

  expect(updateAnnotation).not.toHaveBeenCalled()
  expect(editableTokens[0].isDirty).toBe(false)
})

it('explains when there are no lemmatizable tokens', async () => {
  renderAnnotation([])

  expect(screen.getByText('No Lemmatizable Tokens Found')).toBeVisible()
})
