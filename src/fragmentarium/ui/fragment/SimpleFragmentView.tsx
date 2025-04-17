import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Session } from 'auth/Session'
import { Transliteration } from 'transliteration/ui/Transliteration'
import './SimpleFragmentView.sass'

function SimpleView({
  session,
  fragment,
}: {
  session: Session
  fragment: Fragment
}): JSX.Element {
  return session.isAllowedToReadFragments() ? (
    <>
      <h1 className={'SimpleFragmentView__title'}>{fragment.number}</h1>
      <Transliteration text={fragment.text} />
    </>
  ) : (
    <>{"You don't have permissions to view this fragment."}</>
  )
}

const SimpleFragmentView = withData<
  {
    fragmentService: FragmentService
    session: Session
  },
  { number: string },
  Fragment
>(
  ({ data, ...props }) => <SimpleView fragment={data} {...props} />,
  (props) =>
    props.fragmentService
      .find(props.number)
      .then((fragment) => fragment.filterFolios(props.session)),
  {
    watch: (props) => [props.number],
  }
)
export default SimpleFragmentView
