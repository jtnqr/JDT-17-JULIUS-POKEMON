import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  fullScreen?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isFullScreen = this.props.fullScreen ?? false

      return (
        <div
          className={`flex flex-col items-center justify-center p-6 scanlines text-text font-mono ${
            isFullScreen ? 'min-h-screen bg-[#1a1108]' : 'min-h-[60vh] flex-1 bg-[#1a1108]/50'
          }`}
        >
          <div className="max-w-md w-full border border-accent bg-surface/80 backdrop-blur-md rounded-lg p-6 shadow-2xl relative overflow-hidden">
            {/* Retro title */}
            <div className="border-b border-accent/40 pb-4 mb-6">
              <h2 className="text-xl font-heading font-bold text-highlight tracking-wider uppercase animate-pulse">
                ⚠ System Failure
              </h2>
              <p className="text-sm text-muted-foreground mt-1">ERROR CODE: DYNAMICS_ERR_01</p>
            </div>

            {/* Error Message */}
            <div className="bg-black/40 border border-destructive/20 rounded p-4 mb-6 max-h-40 overflow-y-auto">
              <p className="text-sm text-destructive font-mono break-all whitespace-pre-wrap">
                {this.state.error?.toString() || 'An unexpected runtime error occurred.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 py-2 px-4 bg-accent hover:bg-gold text-bg font-bold font-heading rounded text-sm transition-all duration-200 shadow-md hover:shadow-accent/20 active:scale-95 text-center cursor-pointer"
              >
                RE-BOOT / RETRY
              </button>
              <a
                href="/"
                className="flex-1 py-2 px-4 border border-accent/40 hover:bg-accent/10 text-accent font-bold font-heading rounded text-sm transition-all duration-200 text-center active:scale-95 cursor-pointer"
              >
                RETURN TO MAP
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
