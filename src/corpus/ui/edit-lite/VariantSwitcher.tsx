import React from 'react'
import { Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  EditLiteVariant,
  editLiteVariants,
  withEditLiteVariant,
} from 'corpus/ui/edit-lite/editLiteParameters'
import 'corpus/ui/edit-lite/VariantSwitcher.sass'

interface Props {
  readonly variant: EditLiteVariant
  readonly search: string
}

export const variantLabels: Readonly<Record<EditLiteVariant, string>> = {
  accordion: 'A · Accordion',
  pages: 'B · Pages',
  split: 'C · Split view',
  score: 'D · Inline score',
}

function VariantSwitcher({ variant, search }: Props): JSX.Element {
  return (
    <Nav
      as="nav"
      variant="pills"
      className="edit-lite-variants"
      aria-label="Editor version"
    >
      {editLiteVariants.map((candidate) => (
        <Nav.Link
          key={candidate}
          as={Link}
          to={{ search: withEditLiteVariant(search, candidate) }}
          active={candidate === variant}
          aria-current={candidate === variant ? 'page' : undefined}
        >
          {variantLabels[candidate]}
        </Nav.Link>
      ))}
    </Nav>
  )
}

export default React.memo(VariantSwitcher)
