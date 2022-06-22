import React from 'react'

import TransliteratioForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/ui/PioneersButton'

import './Edition.css'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import { Fragment } from 'fragmentarium/domain/fragment'
import Breadcrumbs, { TextCrumb, SectionCrumb } from 'common/Breadcrumbs'

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
  fragmentService.findInCorpus(fragment.number).then((result) => {
    console.log('!!!', result)
  })
  return (
    <>
      <FragmentInCorpus />
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

function FragmentInCorpus(): JSX.Element {
  return (
    <>
      <p>Edited in Corpus:</p>
      <div>
        <Breadcrumbs
          className="manuscript_chapter__breadcrumbs"
          crumbs={[
            new SectionCrumb('Corpus'),
            new TextCrumb('bababa'),
            new TextCrumb('bebebe'),
          ]}
          hasFullPath={false}
        />
      </div>
    </>
  )
}

export default Edition
