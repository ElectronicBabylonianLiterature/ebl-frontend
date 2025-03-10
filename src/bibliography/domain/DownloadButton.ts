export type DownloadButtonProps = {
  format: string
  filename: string
  label: string
  onClick: (format: string, filename: string) => void
}
