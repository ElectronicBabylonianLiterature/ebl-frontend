import React from 'react'
import { Button } from 'react-bootstrap'
import { useTheme } from './ThemeContext'
import './ThemeToggle.sass'

export default function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      variant="link"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
    </Button>
  )
}
