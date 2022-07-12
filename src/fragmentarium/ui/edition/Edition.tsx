import React from 'react'
import Bluebird from 'bluebird'
import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/ui/PioneersButton'

import './Edition.css'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import Breadcrumbs, { TextCrumb } from 'common/Breadcrumbs'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import CorpusTextCrumb from 'corpus/ui/CorpusTextCrumb'
import ChapterCrumb from 'corpus/ui/ChapterCrumb'
import withData from 'http/withData'

import FragmentService from 'fragmentarium/application/FragmentService'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'

type Props = {
  fragment: Fragment
  updateTransliteration: (
    transliteration: string,
    notes: string
  ) => Bluebird<Fragment>
  fragmentService: FragmentService
  fragmentSearchService: FragmentSearchService
  disabled: boolean
}

function Edition({
  fragment,
  fragmentService,
  fragmentSearchService,
  updateTransliteration,
  disabled,
}: Props): JSX.Element {
  return (
    <>
      <FragmentInCorpus fragment={fragment} fragmentService={fragmentService} />
      <TransliterationHeader fragment={fragment} />
      <TransliteratioForm
        transliteration={fragment.atf}
        notes={fragment.notes}
        updateTransliteration={updateTransliteration}
        disabled={disabled}
      />
      <p className="Edition__navigation">
        <PioneersButton fragmentSearchService={fragmentSearchService} />
      </p>
    </>
  )
}
Edition.defaultProps = {
  disabled: false,
}

const FragmentInCorpus = withData<
  {
    fragment: Fragment
  },
  { fragmentService },
  Array<ManuscriptAttestation>
>(
  ({ data }): JSX.Element => (
    <FragmentInCorpusDisplay manuscriptAttestations={data} />
  ),
  (props) => props.fragmentService.findInCorpus(props.fragment.number)
)

function FragmentInCorpusDisplay({
  manuscriptAttestations,
}: {
  manuscriptAttestations: ManuscriptAttestation[]
}): JSX.Element {
  return (
    <>
      {manuscriptAttestations.length > 0 && (
        <>
          <p>Edited in Corpus:</p>
          <div data-testid="manuscript-attestations">
            {manuscriptAttestations.map((manuscriptAttestation, index) => {
              return (
                <Breadcrumbs
                  key={index}
                  className="manuscript_chapter__breadcrumbs"
                  crumbs={[
                    new GenreCrumb(manuscriptAttestation.text.genre, false),
                    new CorpusTextCrumb(
                      manuscriptAttestation.chapterId.textId,
                      manuscriptAttestation.text.name,
                      false
                    ),
                    new ChapterCrumb(
                      manuscriptAttestation.chapterId,
                      false,
                      true
                    ),
                    new TextCrumb(manuscriptAttestation.manuscriptSiglum),
                  ]}
                  hasFullPath={false}
                />
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

export default Edition
