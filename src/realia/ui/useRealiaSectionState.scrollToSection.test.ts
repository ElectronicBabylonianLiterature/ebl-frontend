import { scrollToSection } from 'realia/ui/useRealiaSectionState'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'

jest.mock('common/utils/prefersReducedMotion')

function nextFrames(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

describe('scrollToSection', () => {
  beforeEach(() => {
    ;(prefersReducedMotion as jest.Mock).mockReturnValue(true)
    document.body.innerHTML = ''
  })

  it('makes a plain section focusable and focuses it', async () => {
    const section = document.createElement('section')
    section.id = 'plain'
    document.body.appendChild(section)
    scrollToSection('plain')
    await nextFrames()
    await nextFrames()
    expect(section).toHaveAttribute('tabindex', '-1')
    expect(section).toHaveFocus()
  })

  it('keeps the tab order of an element that is already focusable', async () => {
    const button = document.createElement('button')
    button.id = 'focusable'
    button.setAttribute('tabindex', '0')
    document.body.appendChild(button)
    scrollToSection('focusable')
    await nextFrames()
    await nextFrames()
    expect(button).toHaveAttribute('tabindex', '0')
    expect(button).toHaveFocus()
  })

  it('does nothing when the target does not exist', async () => {
    scrollToSection('missing')
    await nextFrames()
    await nextFrames()
    expect(document.body).toHaveFocus()
  })
})
