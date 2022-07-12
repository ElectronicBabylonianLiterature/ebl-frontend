import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import { submitFormByTestId } from 'test-support/utils'
import Edition from './Edition'
import {
  fragmentFactory,
  manuscriptAttestationFactory,
} from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'
import { FragmentService } from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { textIdToString } from 'transliteration/domain/text-id'
import { stageToAbbreviation } from 'corpus/domain/period'

let fragment: Fragment
let manuscriptAttestation: ManuscriptAttestation
let fragmentService
let fragmentSearchService
let updateTransliteration
let container: HTMLElement

jest.mock('fragmentarium/application/FragmentService')
jest.mock('fragmentarium/application/FragmentSearchService')

beforeEach(async () => {
  updateTransliteration = jest.fn().mockReturnValue(Promise.resolve())
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  fragmentSearchService = new (FragmentSearchService as jest.Mock<
    jest.Mocked<FragmentSearchService>
  >)()
  fragment = fragmentFactory.build({ atf: '1. ku' })
  manuscriptAttestation = manuscriptAttestationFactory.build()
  fragmentService.findInCorpus = jest
    .fn()
    .mockReturnValue(Promise.resolve([manuscriptAttestation]))
  container = render(
    <MemoryRouter>
      <Edition
        fragment={fragment}
        fragmentService={fragmentService}
        fragmentSearchService={fragmentSearchService}
        updateTransliteration={updateTransliteration}
      />
    </MemoryRouter>
  ).container
  await waitForSpinnerToBeRemoved(screen)
})

it('Renders header', () => {
  expect(container).toHaveTextContent(fragment.publication)
})

xit('Renders transliteration field', () => {
  expect(screen.getByLabelText('Transliteration')).toHaveValue(fragment.atf)
})

xit('Renders notes field', () => {
  expect(screen.getByLabelText('Notes')).toEqual(fragment.notes)
})

it('Calls updateTransliteration on save', () => {
  submitFormByTestId(screen, 'transliteration-form')
  expect(updateTransliteration).toHaveBeenCalled()
})

it('Renders manuscript attestations', () => {
  const textName = manuscriptAttestation.text.name
  const textGenre = manuscriptAttestation.text.id.genre
  const textId = textIdToString(manuscriptAttestation.chapterId.textId)
  const chapterStage = stageToAbbreviation(
    manuscriptAttestation.chapterId.stage
  )
  const chapterName = manuscriptAttestation.chapterId.name
  const { manuscriptSiglum } = manuscriptAttestation
  expect(container).toHaveTextContent(
    `Edited in Corpus:${textGenre}${textId} ${textName}${chapterStage} ${chapterName}${manuscriptSiglum}`
  )
  expect(fragmentService.findInCorpus).toHaveBeenCalled()
})
