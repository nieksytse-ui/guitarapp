import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="mt-3 text-xl font-bold">Pagina niet gevonden</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Deze plek bestaat (nog) niet. Ga terug naar het dashboard en pak de draad weer op.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">
          <Home className="h-4 w-4" /> Naar dashboard
        </Link>
      </Button>
    </div>
  )
}
