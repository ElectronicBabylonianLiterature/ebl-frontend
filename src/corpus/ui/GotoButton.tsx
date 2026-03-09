import React from 'react'
import { Dropdown, DropdownButton, DropdownButtonProps } from 'react-bootstrap'
import { ChapterListing, Text } from 'corpus/domain/text'
import { stageToAbbreviation } from 'common/period'

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
      href={`/corpus/${text.genre}/${text.category}/${
        text.index
      }/${stageToAbbreviation(chapter.stage)}/${chapter.name}`}
    >
      {stage}
      {name}
    </Dropdown.Item>
  )
}

export default function GotoButton({
  text,
  ...props
}: { text: Text } & Omit<DropdownButtonProps, 'children'>): JSX.Element {
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
