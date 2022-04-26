export function silenceConsoleErrors(): void {
  jest.spyOn(console, 'error').mockImplementation()
}
