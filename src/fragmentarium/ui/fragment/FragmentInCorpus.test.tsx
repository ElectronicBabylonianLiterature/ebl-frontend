import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { Promise } from 'bluebird'

import FragmentInCorpus from 'fragmentarium/ui/fragment/FragmentInCorpus'
import { FragmentService } from 'fragmentarium/application/FragmentService'
import {
  fragmentFactory,
  manuscriptAttestationFactory,
  uncertainFragmentAttestationFactory,
} from 'test-support/fragment-fixtures'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'
import { textIdToString } from 'transliteration/domain/text-id'
import { stageToAbbreviation } from 'common/period'
import { Fragment } from 'fragmentarium/domain/fragment'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

let manuscriptAttestation: ManuscriptAttestation
let uncertainFragmentAttestation: UncertainFragmentAttestation
let fragment: Fragment
let fragmentService
let container: HTMLElement

async function renderFragment() {
  fragment = fragmentFactory.build({ atf: '1. ku' })
  container = render(
    <MemoryRouter>
      <FragmentInCorpus fragment={fragment} fragmentService={fragmentService} />
    </MemoryRouter>
  ).container
  await waitForSpinnerToBeRemoved(screen)
}

describe('Manuscript attestation rendering', () => {
  beforeEach(async () => {
    fragmentService = new (FragmentService as jest.Mock<
      jest.Mocked<FragmentService>
    >)()
    manuscriptAttestation = manuscriptAttestationFactory.build()
    fragmentService.findInCorpus = jest.fn().mockReturnValue(
      Promise.resolve({
        manuscriptAttestations: [manuscriptAttestation],
        uncertainFragmentAttestations: [],
      })
    )
    await renderFragment()
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
})

describe('Uncertain fragment attestation rendering', () => {
  beforeEach(async () => {
    fragmentService = new (FragmentService as jest.Mock<
      jest.Mocked<FragmentService>
    >)()
    uncertainFragmentAttestation = uncertainFragmentAttestationFactory.build()
    fragmentService.findInCorpus = jest.fn().mockReturnValue(
      Promise.resolve({
        manuscriptAttestations: [],
        uncertainFragmentAttestations: [uncertainFragmentAttestation],
      })
    )
    await renderFragment()
  })

  it('Renders uncertain fragment attestations', () => {
    const textName = uncertainFragmentAttestation.text.name
    const textGenre = uncertainFragmentAttestation.text.id.genre
    const textId = textIdToString(uncertainFragmentAttestation.chapterId.textId)
    const chapterStage = stageToAbbreviation(
      uncertainFragmentAttestation.chapterId.stage
    )
    const chapterName = uncertainFragmentAttestation.chapterId.name
    expect(container).toHaveTextContent(
      `Edited in Corpus${textGenre}${textId} ${textName}${chapterStage} ${chapterName}`
    )
    expect(fragmentService.findInCorpus).toHaveBeenCalled()
  })
})
