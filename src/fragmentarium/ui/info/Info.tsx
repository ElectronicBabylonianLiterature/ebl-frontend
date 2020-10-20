import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import Details from 'fragmentarium/ui/info/Details'
import Record from 'fragmentarium/ui/info/Record'
import OrganizationLinks from 'fragmentarium/ui/info/OrganizationLinks'
import UncuratedReferences from 'fragmentarium/ui/info/UncuratedReferences'
import { Fragment, UncuratedReference } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import HelpTrigger from 'common/HelpTrigger'
import _ from 'lodash'
import { Popover, Row } from 'react-bootstrap'
import './Info.css'
interface Props {
  fragment: Fragment
  fragmentService: FragmentService
  onSave: (updateGenres: any) => any
}
export default function Info({
  fragment,
  fragmentService,
  onSave,
}: Props): JSX.Element {
  const updateGenres = (genres) =>
    onSave(fragmentService.updateGenres(fragment.number, genres))
  const ReferencesHelp = () => (
    <Popover id={_.uniqueId('ReferencesHelp-')} title="References">
      <Popover.Content>
        <dl className="ReferencesHelp__dl">
          <dt className="ReferencesHelp__dt">
            <code>C</code>
          </dt>
          <dd className="ReferencesHelp__dd">Copy</dd>

          <dt className="ReferencesHelp__dt">
            <code>P</code>
          </dt>
          <dd className="ReferencesHelp__dd">Photograph</dd>

          <dt className="ReferencesHelp__dt">
            <code>E</code>
          </dt>
          <dd className="ReferencesHelp__dd">Edition</dd>

          <dt className="ReferencesHelp__dt">
            <code>D</code>
          </dt>
          <dd className="ReferencesHelp__dd">Discussion</dd>
        </dl>
      </Popover.Content>
    </Popover>
  )

  return (
    <>
      <Details
        fragment={fragment}
        updateGenres={updateGenres}
        fragmentService={fragmentService}
      />
      <section>
        <Row>
          <h3>References</h3>
          <div className="ReferencesHelp__icon">
            <HelpTrigger overlay={ReferencesHelp()} />
          </div>
        </Row>
        <ReferenceList references={fragment.references} />
        {fragment.hasUncuratedReferences && (
          <UncuratedReferences
            uncuratedReferences={
              fragment.uncuratedReferences as UncuratedReference[]
            }
          />
        )}
      </section>
      <Record record={fragment.uniqueRecord} />
      <OrganizationLinks fragment={fragment} />
    </>
  )
}
