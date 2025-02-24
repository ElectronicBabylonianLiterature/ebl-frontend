import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'

type CollapseExpandButtonProps = {
  onToggle
  initialCollapsed?: boolean
}

const CollapseExpandButton: React.FC<CollapseExpandButtonProps> = ({
  onToggle,
  initialCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

  const handleClick = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onToggle(newCollapsedState)
  }

  return (
    <Button variant="primary" onClick={handleClick}>
      {isCollapsed ? 'Show' : 'Hide'} Image Column
    </Button>
  )
}

export default CollapseExpandButton
