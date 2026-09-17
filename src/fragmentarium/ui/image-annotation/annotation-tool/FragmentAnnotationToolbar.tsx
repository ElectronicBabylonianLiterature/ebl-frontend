import React from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import Spinner from 'common/ui/Spinner'
import HelpTrigger from 'common/ui/HelpTrigger'
import Help from 'fragmentarium/ui/image-annotation/annotation-tool/Help'

export default function FragmentAnnotationToolbar({
  isGenerateAnnotationsLoading,
  isAutomaticSelected,
  isDeleting,
  isSaving,
  displayCards,
  isChangeExistingMode,
  generateAnnotations,
  toggleAutomaticSelection,
  deleteAllAnnotations,
  saveCurrentAnnotations,
  toggleDisplayCards,
}: {
  isGenerateAnnotationsLoading: boolean
  isAutomaticSelected: boolean
  isDeleting: boolean
  isSaving: boolean
  displayCards: boolean
  isChangeExistingMode: boolean
  generateAnnotations: () => void
  toggleAutomaticSelection: () => void
  deleteAllAnnotations: () => void
  saveCurrentAnnotations: () => void
  toggleDisplayCards: () => void
}): JSX.Element {
  return (
    <>
      <ButtonGroup>
        <Button variant="outline-dark" onClick={generateAnnotations}>
          {isGenerateAnnotationsLoading ? (
            <Spinner loading={true} />
          ) : (
            'Generate Annotations'
          )}
        </Button>
        <Button
          variant="outline-dark"
          active={isAutomaticSelected}
          onClick={toggleAutomaticSelection}
        >
          Automatic Selection
        </Button>
        <Button variant="outline-dark" onClick={deleteAllAnnotations}>
          {isDeleting ? <Spinner loading={true} /> : 'Delete all'}
        </Button>
        <Button variant="outline-dark" onClick={saveCurrentAnnotations}>
          {isSaving ? <Spinner loading={true} /> : 'Save'}
        </Button>
        <Button
          active={displayCards}
          variant="outline-dark"
          onClick={toggleDisplayCards}
        >
          Show Card
        </Button>
      </ButtonGroup>

      <ButtonGroup className={'ml-3 '} vertical size={'sm'}>
        <Button variant="outline-dark" disabled>
          Mode: {isChangeExistingMode ? 'change existing' : 'default'}
        </Button>
      </ButtonGroup>
      <HelpTrigger overlay={Help()} className={'m-2'} />
      <span className="text-danger">&#8592; Please read this!</span>
    </>
  )
}
