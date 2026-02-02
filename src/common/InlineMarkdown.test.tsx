import React from 'react'
import { render, screen } from '@testing-library/react'
import InlineMarkdown from './InlineMarkdown'

describe('InlineMarkdown', () => {
  describe('Basic text rendering', () => {
    const source = 'Hello world'

    function renderInlineMarkdown(): void {
      render(<InlineMarkdown source={source} />)
    }

    it('Renders the provided text', () => {
      renderInlineMarkdown()
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('Does not wrap text in paragraph tags by default', () => {
      renderInlineMarkdown()
      expect(screen.getByText('Hello world')).not.toHaveProperty('tagName', 'P')
    })
  })

  describe('With className prop', () => {
    const source = 'Styled text'
    const className = 'test-class'

    function renderInlineMarkdown(): void {
      render(<InlineMarkdown source={source} className={className} />)
    }

    it('Applies the provided className', () => {
      renderInlineMarkdown()
      expect(screen.getByText('Styled text')).toHaveClass(className)
    })
  })

  describe('With subscript and superscript', () => {
    const source = 'ešemen~21~ and TI₈^mušen^'

    function renderInlineMarkdown(): void {
      render(<InlineMarkdown source={source} />)
    }

    it('Renders subscript correctly', () => {
      renderInlineMarkdown()
      expect(screen.getByText('21')).toHaveProperty('tagName', 'SUB')
    })

    it('Renders superscript correctly', () => {
      renderInlineMarkdown()
      expect(screen.getByText('mušen')).toHaveProperty('tagName', 'SUP')
    })
  })

  describe('With allowParagraphs disabled', () => {
    const source = 'Line one\n\nLine two'

    function renderInlineMarkdown(): void {
      render(<InlineMarkdown source={source} allowParagraphs={false} />)
    }

    it('Unwraps paragraphs when not allowed', () => {
      renderInlineMarkdown()
      expect(
        screen.queryByText('Line one', { selector: 'p' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Line two', { selector: 'p' }),
      ).not.toBeInTheDocument()
    })

    it('Still renders all text', () => {
      renderInlineMarkdown()
      expect(screen.getByText(/Line one/)).toBeInTheDocument()
      expect(screen.getByText(/Line two/)).toBeInTheDocument()
    })
  })

  describe('With allowParagraphs enabled', () => {
    const source = 'Paragraph text\n\nNew paragraph'

    function renderInlineMarkdown(): void {
      render(<InlineMarkdown source={source} allowParagraphs={true} />)
    }

    it('Renders paragraphs when allowed', () => {
      renderInlineMarkdown()
      const paragraph1 = screen.getByText('Paragraph text')
      const paragraph2 = screen.getByText('New paragraph')
      expect(paragraph1).toHaveProperty('tagName', 'P')
      expect(paragraph2).toHaveProperty('tagName', 'P')
    })
  })
})
