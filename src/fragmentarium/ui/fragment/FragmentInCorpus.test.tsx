import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import FragmentInCorpus from 'fragmentarium/ui/fragment/FragmentInCorpus'
import { FragmentService } from 'fragmentarium/application/FragmentService'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { manuscriptAttestationFactory } from 'test-support/fragment-fixtures'
import { textIdToString } from 'transliteration/domain/text-id'
import { stageToAbbreviation } from 'common/period'
import { Fragment } from 'fragmentarium/domain/fragment'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

let manuscriptAttestation: ManuscriptAttestation
let fragment: Fragment
let fragmentService
let container: HTMLElement

beforeEach(async () => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  manuscriptAttestation = manuscriptAttestationFactory.build()
  fragmentService.findInCorpus = jest
    .fn()
    .mockReturnValue(Promise.resolve([manuscriptAttestation]))
  fragment = fragmentFactory.build({ atf: '1. ku' })
  container = render(
    <MemoryRouter>
      <FragmentInCorpus fragment={fragment} fragmentService={fragmentService} />
    </MemoryRouter>
  ).container
  await waitForSpinnerToBeRemoved(screen)
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
    `Edited in Corpus${textGenre}${textId} ${textName}${chapterStage} ${chapterName}${manuscriptSiglum}`
  )
  expect(fragmentService.findInCorpus).toHaveBeenCalled()
})
