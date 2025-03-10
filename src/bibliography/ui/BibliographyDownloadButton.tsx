import React from 'react'
import { Button } from 'react-bootstrap'

type DownloadButtonProps = {
  format: string
  filename: string
  label: string
  onClick: (format: string, filename: string) => void
}

function DownloadButton({
  format,
  filename,
  label,
  onClick,
}: DownloadButtonProps): JSX.Element {
  return (
    <Button
      variant="outline-secondary"
      onClick={() => onClick(format, filename)}
    >
      {label}
    </Button>
  )
}

export default DownloadButton
