import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import Breadcrumbs, { TextCrumb } from 'common/Breadcrumbs'
import GenreCrumb from 'corpus/ui/GenreCrumb'
import CorpusTextCrumb from 'corpus/ui/CorpusTextCrumb'
import ChapterCrumb from 'corpus/ui/ChapterCrumb'
import withData from 'http/withData'

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
        <div className="fragment_in_corpus__container">
          <h3 className="fragment_in_corpus__header">Edited in Corpus</h3>
          {manuscriptAttestations.map((manuscriptAttestation, index) => {
            return (
              <Breadcrumbs
                key={index}
                className="fragment_in_corpus__breadcrumbs"
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
      )}
    </>
  )
}

export default FragmentInCorpus
