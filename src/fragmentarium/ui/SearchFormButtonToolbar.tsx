import React from 'react'
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { ResearchProjects } from 'research-projects/researchProject'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { helpColSize } from 'fragmentarium/ui/searchFormLayout'

export default function SearchFormButtonToolbar({
  project,
  isValid,
  onSearch,
  fragmentSearchService,
}: {
  project?: keyof typeof ResearchProjects | null
  isValid: boolean
  onSearch: (event: React.MouseEvent<HTMLElement>) => void
  fragmentSearchService: FragmentSearchService
}): JSX.Element {
  return (
    <Row>
      <Col sm={helpColSize} className={'SearchForm__help-col'}></Col>
      <Col>
        <ButtonToolbar>
          <Button
            className="w-25 m-1"
            onClick={onSearch}
            variant="primary"
            disabled={!isValid}
          >
            {project ? `Search in ${project}` : 'Search'}
          </Button>
          {!project && (
            <>
              <LuckyButton fragmentSearchService={fragmentSearchService} />
              <PioneersButton fragmentSearchService={fragmentSearchService} />
            </>
          )}
        </ButtonToolbar>
      </Col>
    </Row>
  )
}
