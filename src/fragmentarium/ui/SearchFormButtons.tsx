import React from 'react'
import { Button, ButtonToolbar, Col, Row } from 'react-bootstrap'
import LuckyButton from 'fragmentarium/ui/front-page/LuckyButton'
import PioneersButton from 'fragmentarium/ui/PioneersButton'
import { helpColSize, SearchFormProps } from 'fragmentarium/ui/SearchForm.state'

type Props = Pick<SearchFormProps, 'project' | 'fragmentSearchService'> & {
  isValid: boolean
  onSearch: (event: React.MouseEvent<HTMLElement>) => void
}

export default function SearchFormButtons({
  project,
  fragmentSearchService,
  isValid,
  onSearch,
}: Props): JSX.Element {
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
