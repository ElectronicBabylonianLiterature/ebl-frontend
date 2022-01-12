import React from 'react'
import { Dropdown, DropdownButton, DropdownButtonProps } from 'react-bootstrap'
import { ChapterListing, Text } from 'corpus/domain/text'

function GotoItem({
  text,
  chapter,
}: {
  text: Text
  chapter: ChapterListing
}): JSX.Element {
  const stage = text.hasMultipleStages ? `${chapter.stage} ` : ''
  const name =
    chapter.name !== '-' || !text.hasMultipleStages ? chapter.name : ''
  return (
    <Dropdown.Item
      href={`/corpus/${text.genre}/${text.category}/${text.index}/${chapter.stage}/${chapter.name}`}
    >
      {stage}
      {name}
    </Dropdown.Item>
  )
}
export function GotoButton({
  text,
  ...props
}: { text: Text } & DropdownButtonProps): JSX.Element {
  return (
    <DropdownButton {...props}>
      {text.chapters.map((chapter, index) => (
        <GotoItem key={index} text={text} chapter={chapter} />
      ))}
      <Dropdown.Item
        href={`/corpus/${text.genre}/${text.category}/${text.index}`}
      >
        Introduction
      </Dropdown.Item>
    </DropdownButton>
  )
}
