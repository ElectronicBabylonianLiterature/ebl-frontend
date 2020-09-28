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
    <Popover id={_.uniqueId('ReferenceshHelp-')} title="References">
      <Popover.Content>
        <code>C</code> = Copy <br />
        <code>P</code> = Photograph <br />
        <code>E</code> = Edition <br />
        <code>D</code> = Discussion <br />
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '.5rem',
              marginLeft: '.5rem',
            }}
          >
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
