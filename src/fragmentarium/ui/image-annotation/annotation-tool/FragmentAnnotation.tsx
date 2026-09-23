import Content from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import SignService from 'signs/application/SignService'
import AnnotationTool from 'fragmentarium/ui/image-annotation/annotation-tool/Annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import Editor from 'fragmentarium/ui/image-annotation/annotation-tool/Editor'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import React from 'react'
import _ from 'lodash'
import Highlight from 'fragmentarium/ui/image-annotation/annotation-tool/Highlight'
import withData from 'http/withData'
import useObjectUrl from 'common/hooks/useObjectUrl'
import ErrorAlert from 'common/errors/ErrorAlert'
import { createAnnotationTokens } from 'fragmentarium/ui/image-annotation/annotation-tool/mapTokensToAnnotationTokens'
import FragmentAnnotationToolbar from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotationToolbar'
import useFragmentAnnotationState from 'fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState'

const annotationOverlayStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.4)',
  borderRadius: '5px',
  bottom: '4px',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold',
  opacity: 0,
  padding: '10px',
  pointerEvents: 'none',
  position: 'absolute',
  right: '4px',
  transition: 'opacity 0.21s ease-in-out',
  userSelect: 'none',
}

interface Props {
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  image: Blob
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}
export default withData<
  Omit<Props, 'tokens'>,
  { fragment: Fragment; signService: SignService },
  ReadonlyArray<ReadonlyArray<AnnotationToken>>
>(
  ({ data, ...props }) => <FragmentAnnotation {...props} tokens={data} />,
  ({ fragment, signService }, signal) =>
    signService.associateSigns(createAnnotationTokens(fragment.text), signal),
)

function FragmentAnnotation({
  tokens,
  fragment,
  image,
  initialAnnotations,
  fragmentService,
}: Props): React.ReactElement {
  const imageUrl = useObjectUrl(image)
  const state = useFragmentAnnotationState({
    tokens,
    fragment,
    initialAnnotations,
    fragmentService,
  })

  return (
    <>
      {state.error && <ErrorAlert error={state.error} />}
      <FragmentAnnotationToolbar
        isGenerateAnnotationsLoading={state.isGenerateAnnotationsLoading}
        isAutomaticSelected={state.isAutomaticSelected}
        isDeleting={state.isDeleting}
        isSaving={state.isSaving}
        displayCards={state.displayCards}
        isChangeExistingMode={state.isChangeExistingMode}
        generateAnnotations={state.generateAnnotations}
        toggleAutomaticSelection={state.toggleAutomaticSelection}
        deleteAllAnnotations={state.deleteAllAnnotations}
        saveCurrentAnnotations={state.saveCurrentAnnotations}
        toggleDisplayCards={state.toggleDisplayCards}
      />
      <AnnotationTool
        allowTouch
        onZoom={state.onZoom}
        disableAnnotation={state.isDisableAnnotating}
        src={imageUrl}
        alt={fragment.number}
        annotations={state.annotations}
        type={RectangleSelector.TYPE}
        value={state.annotation}
        onChange={state.onChange}
        renderEditor={(props: {
          annotation: RawAnnotation
          onChange: (annotation: RawAnnotation) => void
        }) => (
          <Editor
            {...props}
            disabled={
              !(
                (state.annotation && state.annotation.geometry) ||
                state.isChangeExistingMode
              )
            }
            annotation={state.toggled ? state.toggled : props.annotation}
            handleSelection={state.handleSelection}
            hoveringAnnotation={state.hovering}
            annotations={state.annotations}
            tokens={tokens}
          />
        )}
        renderHighlight={(props: {
          key?: React.Key
          annotation: RawAnnotation
          active: boolean
        }) => {
          const { key, ...highlightProps } = props

          return (
            <Highlight
              key={key}
              {...highlightProps}
              scale={state.contentScale}
              isToggled={_.isEqual(state.toggled, props.annotation)}
            />
          )
        }}
        renderContent={(props) => {
          const { key, ...contentProps } = props as {
            key?: React.Key
            annotation: Annotation
          }

          return (
            <Content
              key={key}
              {...contentProps}
              displayCards={state.displayCards}
              setHovering={state.setHovering}
              contentScale={state.contentScale}
              onDelete={state.onDelete}
            />
          )
        }}
        renderOverlay={() => (
          <div style={annotationOverlayStyle}>Click and Drag to Annotate</div>
        )}
        onClick={state.onClick}
      />
    </>
  )
}
