import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

// Hoist mock fns for Vitest
const hoisted = vi.hoisted(() => ({ capture: vi.fn() }))
vi.mock('../../sentry.client', () => ({
  Sentry: {
    captureException: hoisted.capture,
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}))

import PainelPage from '../painel'

describe('PainelPage Sentry debug', () => {
  it('calls Sentry.captureException when clicking debug button', async () => {
    // silence alert in jsdom
    // @ts-expect-error jsdom
    globalThis.alert = vi.fn()
    render(<PainelPage />)
    const btn = await screen.findByText('Debug Sentry (capturar)')
    fireEvent.click(btn)
    expect(hoisted.capture).toHaveBeenCalledTimes(1)
    expect(hoisted.capture.mock.calls[0][0]).toBeInstanceOf(Error)
  })
})
