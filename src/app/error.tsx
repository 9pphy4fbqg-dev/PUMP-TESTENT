'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-pump-bg flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">出错了！</h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          重试
        </button>
      </div>
    </div>
  )
}
