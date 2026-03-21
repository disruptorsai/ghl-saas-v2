import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, showDetails } = this.state;

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Something went wrong
                </h2>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred. Please try reloading the page.
                </p>
              </div>

              <Button onClick={this.handleReload} className="w-full">
                Reload Page
              </Button>

              <div className="w-full">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {showDetails ? 'Hide' : 'Show'} error details
                </button>

                {showDetails && error && (
                  <div className="mt-2 max-h-48 overflow-auto rounded-md bg-muted p-3 text-left">
                    <p className="text-xs font-medium text-foreground">
                      {error.name}: {error.message}
                    </p>
                    {error.stack && (
                      <pre className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A simpler error boundary for wrapping individual routes or sections.
 * Renders inline (no min-h-screen) so it fits within an existing layout.
 */
class RouteErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[RouteErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, showDetails } = this.state;

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-6 text-center text-card-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">
              Failed to load this section
            </h3>
            <p className="text-sm text-muted-foreground">
              Something went wrong while rendering this part of the page.
            </p>
          </div>

          <Button onClick={this.handleReload} variant="outline" size="sm">
            Reload Page
          </Button>

          <div className="w-full">
            <button
              type="button"
              onClick={this.toggleDetails}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {showDetails ? 'Hide' : 'Show'} error details
            </button>

            {showDetails && error && (
              <div className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-3 text-left">
                <p className="text-xs font-medium text-foreground">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary, RouteErrorBoundary };
