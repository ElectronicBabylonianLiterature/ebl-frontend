import React from 'react'
import ReactMarkdown from 'react-markdown'
import AppContent from 'common/AppContent'
import withData from 'http/withData'
import ChapterNavigation from './ChapterNavigation'

function textChanged(prevProps, props) {
  return (
    prevProps.match.params.category !== props.match.params.category ||
    prevProps.match.params.index !== props.match.params.index
  )
}

function TextView({ text }) {
  const title = (
    <ReactMarkdown
      source={text.name}
      disallowedTypes={['paragraph']}
      unwrapDisallowed
    />
  )

  return (
    <AppContent crumbs={['Corpus', title]} title={title}>
      <ChapterNavigation text={text} />
    </AppContent>
  )
}

export default withData(
  ({ data }) => <TextView text={data} />,
  ({ match, textService }) => {
    const category = decodeURIComponent(match.params.category)
    const index = decodeURIComponent(match.params.index)
    return textService.find(category, index)
  },
  {
    shouldUpdate: textChanged
  }
)
