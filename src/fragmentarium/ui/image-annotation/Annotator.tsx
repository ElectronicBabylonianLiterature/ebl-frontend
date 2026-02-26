import React from 'react'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import SignService from 'signs/application/SignService'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'

function AnnotatorDisplay({
  image,
  fragment,
  annotations,
  fragmentService,
  signService,
}: {
  image: Blob
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}): JSX.Element {
  return (
    <FragmentAnnotation
      image={image}
      fragment={fragment}
      initialAnnotations={annotations}
      fragmentService={fragmentService}
      signService={signService}
    />
  )
}

function Annotator({
  image,
  fragment,
  annotations,
  fragmentService,
  signService,
}: {
  image: Blob
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}): JSX.Element {
  return (
    <AnnotatorDisplay
      image={image}
      fragment={fragment}
      annotations={annotations}
      fragmentService={fragmentService}
      signService={signService}
    />
  )
}

const WithAnnotations = withData<
  {
    fragment: Fragment
    image: Blob
    fragmentService: FragmentService
    signService: SignService
  },
  unknown,
  readonly Annotation[]
>(
  ({ data, ...props }) => <Annotator {...props} annotations={data} />,
  ({ fragment, fragmentService }) =>
    fragmentService.findAnnotations(fragment.number),
)

const WithPhoto = withData<
  {
    fragment: Fragment
    fragmentService: FragmentService
    signService: SignService
  },
  unknown,
  Blob
>(
  ({ data, ...props }) => <WithAnnotations {...props} image={data} />,
  ({ fragment, fragmentService }) => fragmentService.findPhoto(fragment),
)

export default withData<
  {
    fragmentService: FragmentService
    signService: SignService
  },
  { number: string },
  Fragment
>(
  ({ data, fragmentService, ...props }) => (
    <WithPhoto fragment={data} fragmentService={fragmentService} {...props} />
  ),
  (props) => props.fragmentService.find(props.number),
  {
    watch: (props) => [props.number],
  },
)
