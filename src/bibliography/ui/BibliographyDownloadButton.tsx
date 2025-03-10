import React from 'react'
import { Button } from 'react-bootstrap'
import { DownloadButtonProps } from 'bibliography/domain/DownloadButton'

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
