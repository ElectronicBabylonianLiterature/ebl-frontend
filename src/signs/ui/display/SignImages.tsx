import SignService from 'signs/application/SignService'
import React from 'react'
import withData, { WithoutData } from 'http/withData'

type Props = {
  signName: string
  data: { images: Blob[] }
  signService: SignService
}

export default withData<
  WithoutData<Props>,
  { signName: string; signService: SignService },
  { images: Blob[] }
>(
  ({ data }) => {
    return <SignImages images={data} />
  },
  (props) => props.signService.getImages(decodeURIComponent(props.signName))
)

function SignImages({ images }: { images: { images: Blob[] } }): JSX.Element {
  console.log(images['images'])
  return <div>asdasd</div>
}
