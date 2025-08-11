import { ServerCrash } from "lucide-react"

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center py-16 border-2 border-dashed border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
        <ServerCrash className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-medium text-white">An Error Occurred</h3>
        <p className="mt-2 text-sm text-red-200 max-w-2xl mx-auto">{message}</p>
        <p className="mt-4 text-xs text-red-300/80">
          This is likely a configuration issue. Please check your environment variables and Contentful setup.
        </p>
      </div>
    </div>
  )
}
