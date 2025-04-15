import React from 'react'
import AppContent from 'common/AppContent'
import { SectionCrumb, TextCrumb } from 'common/Breadcrumbs'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentCrumb from 'fragmentarium/ui/FragmentCrumb'
import { RecordList } from 'fragmentarium/ui/info/Record'
import withData from 'http/withData'
import './RecordView.sass'

function RecordView({ fragment }: { fragment: Fragment }): JSX.Element {
  return (
    <AppContent
      crumbs={[
        new SectionCrumb('Library'),
        new FragmentCrumb(fragment.number),
        new TextCrumb('Record'),
      ]}
      title={`Record of ${fragment.number}`}
    >
      <section className={'FullRecord'}>
        <RecordList record={fragment.record} />
      </section>
    </AppContent>
  )
}

const FragmentWithData = withData<
  unknown,
  { number: string; fragmentService: FragmentService },
  Fragment
>(
  ({ data, ...props }) => <RecordView fragment={data} {...props} />,
  (props) => props.fragmentService.find(props.number)
)
export default FragmentWithData
