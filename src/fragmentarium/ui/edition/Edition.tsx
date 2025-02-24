import React from 'react'
import Bluebird from 'bluebird'
import TransliterationForm from './TransliterationForm'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import CollapseExpandButton from 'fragmentarium/ui/CollapseExpandButton'
import './Edition.css'
import TransliterationHeader from 'fragmentarium/ui/fragment/TransliterationHeader'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { EditionFields } from 'fragmentarium/application/FragmentService'

type Props = {
  fragment: Fragment
  updateEdition: (fields: EditionFields) => Bluebird<Fragment>
  fragmentSearchService: FragmentSearchService
  disabled: boolean
  onToggle
  isColumnVisible: boolean
}

function Edition({
  fragment,
  fragmentSearchService,
  updateEdition,
  disabled,
  onToggle,
  isColumnVisible,
}: Props): JSX.Element {
  return (
    <>
      <TransliterationHeader fragment={fragment} />
      <TransliterationForm
        transliteration={fragment.atf}
        notes={fragment.notes.text}
        introduction={fragment.introduction.text}
        updateEdition={updateEdition}
        disabled={disabled}
      />
      <p className="Edition__navigation">
        <PioneersButton fragmentSearchService={fragmentSearchService} />
        <CollapseExpandButton
          onToggle={onToggle}
          initialCollapsed={!isColumnVisible}
        />
      </p>
    </>
  )
}

Edition.defaultProps = {
  disabled: false,
}

export default Edition
