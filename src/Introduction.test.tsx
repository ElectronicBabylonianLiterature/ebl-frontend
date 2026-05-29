import { getNewsletterPreview } from 'Introduction'

describe('getNewsletterPreview', () => {
  test('keeps markdown links intact in preview lines', () => {
    const content = [
      '---',
      'title: eBL Newsletter',
      '---',
      '# eBL Newsletter 21',
      '- A long update with [link](https://example.com/some/really/long/path?query=with-many-parts)',
      '- Another update line',
      '- Third update line',
      '- Fourth update line',
    ].join('\n')

    expect(getNewsletterPreview(content)).toContain(
      '[link](https://example.com/some/really/long/path?query=with-many-parts)',
    )
    expect(getNewsletterPreview(content)).not.toContain('Fourth update line')
  })

  test('skips empty and heading lines after frontmatter', () => {
    const content = [
      '---',
      'title: eBL Newsletter',
      'date: 2026-02-10',
      '---',
      '# Heading',
      '',
      'Line one',
      'Line two',
      '# Another heading',
      'Line three',
      'Line four',
    ].join('\n')

    expect(getNewsletterPreview(content)).toEqual(
      ['Line one', 'Line two', 'Line three'].join('\n'),
    )
  })
})
