/**
 * Docs Interface Welcome Page
 * 
 * Displays setup instructions and health checks when the module is first accessed.
 * Shows system status, features overview, and quick setup guide.
 * 
 * Dependencies: None (pure React component)
 */

import React, { useState, useEffect } from 'react'

interface HealthCheck {
  name: string
  status: 'checking' | 'success' | 'warning' | 'error'
  message: string
}

interface DocsWelcomeProps {
  onGetStarted?: () => void
}

/**
 * Welcome page component for docs-interface module.
 * 
 * Displays health checks, features, and setup instructions.
 * 
 * @param onGetStarted - Callback when user clicks "Get Started"
 */
export function DocsWelcome({ onGetStarted }: DocsWelcomeProps) {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'Next.js Environment', status: 'checking', message: 'Checking...' },
    { name: 'Docs Directory', status: 'checking', message: 'Checking...' },
    { name: 'Git Repository', status: 'checking', message: 'Checking...' },
    { name: 'API Routes', status: 'checking', message: 'Checking...' },
  ])
  const [ready, setReady] = useState(false)
  const [hasVisited, setHasVisited] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasVisited(!!localStorage.getItem('docs-interface-visited'))
    }
    runHealthChecks()
  }, [])

  /**
   * Run all health checks to verify the system is ready.
   * 
   * Dependencies: API routes at /api/docs
   */
  const runHealthChecks = async () => {
    // Check 1: Environment
    setTimeout(() => {
      updateCheck('Next.js Environment', {
        status: process.env.NODE_ENV === 'development' ? 'success' : 'error',
        message: process.env.NODE_ENV === 'development' 
          ? 'Running in development mode ✓' 
          : 'Must run in development mode (npm run dev)'
      })
    }, 300)

    // Check 2: Docs directory
    setTimeout(async () => {
      try {
        const res = await fetch('/api/docs')
        const data = await res.json()
        
        if (res.ok) {
          const count = data.meta?.count || 0
          updateCheck('Docs Directory', {
            status: count > 0 ? 'success' : 'warning',
            message: count > 0 
              ? `Found ${count} markdown file${count !== 1 ? 's' : ''} ✓` 
              : 'No markdown files found in /docs directory'
          })
        } else {
          updateCheck('Docs Directory', {
            status: 'error',
            message: 'Could not access /docs directory'
          })
        }
      } catch (err) {
        updateCheck('Docs Directory', {
          status: 'error',
          message: 'API routes not responding - ensure Next.js is running'
        })
      }
    }, 600)

    // Check 3: Git repository
    setTimeout(async () => {
      try {
        // Try to get history for any file - if docs exist, use first file
        const docsRes = await fetch('/api/docs')
        const docsData = await docsRes.json()
        
        if (docsData.data && docsData.data.length > 0) {
          const firstFile = docsData.data[0].relativePath
          const historyRes = await fetch(`/api/docs/${encodeURIComponent(firstFile)}/history`)
          const historyData = await historyRes.json()
          
          const hasGit = historyData.data && historyData.data.length > 0
          updateCheck('Git Repository', {
            status: hasGit ? 'success' : 'warning',
            message: hasGit 
              ? 'Git integration active ✓' 
              : 'Git not detected - version history disabled'
          })
        } else {
          updateCheck('Git Repository', {
            status: 'warning',
            message: 'No files to check git status'
          })
        }
      } catch (err) {
        updateCheck('Git Repository', {
          status: 'warning',
          message: 'Git not available - version history disabled'
        })
      }
    }, 900)

    // Check 4: API routes
    setTimeout(() => {
      const apiCheck = checks.find(c => c.name === 'Docs Directory')
      const apiWorking = apiCheck?.status !== 'error'
      
      updateCheck('API Routes', {
        status: apiWorking ? 'success' : 'error',
        message: apiWorking 
          ? 'API endpoints ready ✓' 
          : 'API endpoints not responding'
      })
      setReady(apiWorking)
    }, 1200)
  }

  /**
   * Update a specific health check status.
   * 
   * @param name - Name of the check to update
   * @param update - Partial health check data to merge
   */
  const updateCheck = (name: string, update: Partial<HealthCheck>) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, ...update } : check
    ))
  }

  const handleGetStarted = () => {
    if (ready && onGetStarted) {
      // Store that user has visited (only if coming from first visit)
      if (typeof window !== 'undefined' && !localStorage.getItem('docs-interface-visited')) {
        localStorage.setItem('docs-interface-visited', 'true')
      }
      onGetStarted()
    }
  }
  
  const handleClose = () => {
    if (onGetStarted) {
      onGetStarted()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">⚙️ Settings</h1>
        <p className="text-lg text-gray-600">
          Configure and monitor your documentation interface. View system status, features, and setup information.
        </p>
      </div>

      {/* Health Checks */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>⚡</span>
          System Status
        </h2>
        <div className="space-y-3">
          {checks.map(check => (
            <div key={check.name} className="flex items-start gap-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                check.status === 'checking' ? 'bg-gray-400 animate-pulse' :
                check.status === 'success' ? 'bg-green-500' :
                check.status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{check.name}</div>
                <div className="text-sm text-gray-600">{check.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>✨</span>
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Feature icon="📖" title="View Docs" description="Render markdown with syntax highlighting" />
          <Feature icon="✏️" title="Edit Docs" description="Split-pane editor with live preview" />
          <Feature icon="➕" title="Create Files" description="Add new documentation files" />
          <Feature icon="🗑️" title="Delete Files" description="Remove outdated documentation" />
          <Feature icon="🔍" title="Search" description="Full-text search across all docs" />
          <Feature icon="⏱️" title="Version History" description="View git commit history" />
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span>🚀</span>
          Quick Setup
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            Ensure you're running <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">npm run dev</code>
          </li>
          <li>
            Create a <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">/docs</code> folder in your project root
          </li>
          <li>
            Add markdown files (e.g., <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">README.md</code>)
          </li>
          <li>
            <span className="text-gray-500">(Optional)</span> Initialize git for version history: 
            <code className="bg-blue-100 px-2 py-1 rounded text-sm font-mono ml-2">git init</code>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {!hasVisited ? (
          <button 
            onClick={handleGetStarted}
            disabled={!ready}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              ready 
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {ready ? 'Get Started →' : 'Running checks...'}
          </button>
        ) : (
          <button 
            onClick={handleClose}
            className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            ← Back to Interface
          </button>
        )}
        <button 
          onClick={() => runHealthChecks()}
          className="px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          🔄 Recheck Status
        </button>
      </div>

      {/* Tech Info */}
      <div className="bg-gray-50 rounded-lg p-6 text-sm text-gray-600 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Technical Notes</h3>
        <ul className="space-y-2">
          <li>
            <strong>Development Only:</strong> This interface only works in development mode (<code className="bg-gray-200 px-1 rounded">NODE_ENV=development</code>)
          </li>
          <li>
            <strong>Backend Required:</strong> Next.js API routes provide file system access and git integration. 
            The browser cannot access files directly for security reasons.
          </li>
          <li>
            <strong>Git Optional:</strong> Version history requires a git repository. The interface works without git but history features will be disabled.
          </li>
        </ul>
      </div>
    </div>
  )
}

/**
 * Feature display component.
 * 
 * @param icon - Emoji icon
 * @param title - Feature title
 * @param description - Feature description
 */
function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </div>
  )
}

