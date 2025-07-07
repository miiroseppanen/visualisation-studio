import Link from 'next/link'
import { H23Logo } from '@/components/ui/h23-logo'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <H23Logo size="lg" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            You're Offline
          </h1>
          
          <p className="text-muted-foreground">
            It looks like you've lost your internet connection. 
            Some features may not be available while offline.
          </p>
          
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="font-semibold text-foreground mb-2">
              Available Offline
            </h2>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Home page and navigation</li>
              <li>• Previously visited visualizations</li>
              <li>• Basic app functionality</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="block w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Go to Home
          </Link>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Check your internet connection and try again
        </p>
      </div>
    </div>
  )
} 