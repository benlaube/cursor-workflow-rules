import { DocsInterface } from '../../src/components/DocsInterface'

export default function DocsPage() {
  // Dev-only check
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Documentation Interface</h1>
          <p className="text-gray-600">
            This interface is only available in development mode.
          </p>
        </div>
      </div>
    )
  }

  return <DocsInterface />
}

