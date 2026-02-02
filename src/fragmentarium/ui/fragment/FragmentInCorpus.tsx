import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import Breadcrumbs, { TextCrumb } from 'common/Breadcrumbs'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import CorpusTextCrumb from 'corpus/ui/CorpusTextCrumb'
import ChapterCrumb from 'corpus/ui/ChapterCrumb'
import withData from 'http/withData'
import { UncertainFragmentAttestation } from 'corpus/domain/uncertainFragmentAttestation'

const FragmentInCorpus = withData<
  {
    fragment: Fragment
  },
  { fragmentService },
  {
    manuscriptAttestations: Array<ManuscriptAttestation>
    uncertainFragmentAttestations: Array<UncertainFragmentAttestation>
  }
>(
  ({ data }): JSX.Element => <FragmentInCorpusDisplay attestations={data} />,
  (props) => props.fragmentService.findInCorpus(props.fragment.number),
)

function FragmentInCorpusDisplay({
  attestations,
}: {
  attestations: {
    manuscriptAttestations: Array<ManuscriptAttestation>
    uncertainFragmentAttestations: Array<UncertainFragmentAttestation>
  }
}): JSX.Element {
  const { manuscriptAttestations, uncertainFragmentAttestations } = attestations
  const attestationsArray = [
    ...manuscriptAttestations,
    ...uncertainFragmentAttestations,
  ]
  return (
    <>
      {attestationsArray.length > 0 && (
        <div className="fragment_in_corpus__container">
          <h3 className="fragment_in_corpus__header">Edited in Corpus</h3>
          {attestationsArray.map((attestation, index) => {
            return (
              <Breadcrumbs
                key={index}
                className="fragment_in_corpus__breadcrumbs"
                crumbs={getCrumbs({ attestation })}
                hasFullPath={false}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

function getCrumbs({
  attestation,
}: {
  attestation: ManuscriptAttestation | UncertainFragmentAttestation
}): [GenreCrumb, CorpusTextCrumb, ChapterCrumb, TextCrumb] {
  return [
    new GenreCrumb(attestation.text.genre, false),
    new CorpusTextCrumb(
      attestation.chapterId.textId,
      attestation.text.name,
      false,
    ),
    new ChapterCrumb(attestation.chapterId, false, true),
    'manuscriptSiglum' in attestation
      ? new TextCrumb(attestation.manuscriptSiglum)
      : new TextCrumb('Uncertain Fragment'),
  ]
}

export default FragmentInCorpus
