import React from 'react'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Col, Row } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import useObjectUrl from 'common/useObjectUrl'
import Bluebird from 'bluebird'
import SignService from 'signs/application/SignService'
import FragmentAnnotation from 'fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation'

function isBlob(image: Blob | Record<string, never>): image is Blob {
  return (image as Blob).size !== undefined
}

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
  const objectUrl = useObjectUrl(image as Blob)
  return (
    <>
      {objectUrl && (
        <FragmentAnnotation
          image={objectUrl}
          fragment={fragment}
          initialAnnotations={annotations}
          fragmentService={fragmentService}
          signService={signService}
        />
      )}
    </>
  )
}

function Annotator({
  image,
  fragment,
  annotations,
  fragmentService,
  signService,
}: {
  image: Blob | Record<string, never>
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}): JSX.Element {
  if (isBlob(image)) {
    return (
      <AnnotatorDisplay
        image={image}
        fragment={fragment}
        annotations={annotations}
        fragmentService={fragmentService}
        signService={signService}
      />
    )
  } else {
    return (
      <Row>
        <Col className={'text-center mt-5'}>
          <h3>{`Fragment ${fragment.number} doesn't have a Photo`}</h3>
        </Col>
      </Row>
    )
  }
}

const WithAnnotations = withData<
  {
    fragment: Fragment
    image: Blob | Record<string, never>
    fragmentService: FragmentService
    signService: SignService
  },
  unknown,
  readonly Annotation[]
>(
  ({ data, ...props }) => <Annotator {...props} annotations={data} />,
  ({ fragment, fragmentService }) =>
    fragmentService.findAnnotations(fragment.number)
)

const WithPhoto = withData<
  {
    fragment: Fragment
    fragmentService: FragmentService
    signService: SignService
  },
  unknown,
  Blob | Record<string, never>
>(
  ({ data, ...props }) => <WithAnnotations {...props} image={data} />,
  ({ fragment, fragmentService }) => {
    try {
      return fragmentService.findPhoto(fragment)
    } catch (e) {
      return Bluebird.resolve({})
    }
  }
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
  }
)
