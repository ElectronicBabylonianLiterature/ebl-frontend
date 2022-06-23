import React from 'react'

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

type Props = {
  fragment: Fragment
  updateTransliteration
  fragmentService
  fragmentSearchService
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
  ReadonlyArray<ManuscriptAttestation>
>(
  ({ data }) => {
    if (!data.length) {
      return null
    }
    // TODO:  - Fix siglum rendering
    //        - Adjust breadcrumps style (?)
    return (
      <>
        <p>Edited in Corpus:</p>
        <div>
          {data.map((manuscriptAttestation, index) => {
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
                  new ChapterCrumb(manuscriptAttestation.chapterId),
                  new TextCrumb(manuscriptAttestation.manuscript.siglum),
                ]}
                hasFullPath={false}
              />
            )
          })}
        </div>
      </>
    )
  },
  (props) => props.fragmentService.findInCorpus(props.fragment.number)
)

export default Edition
