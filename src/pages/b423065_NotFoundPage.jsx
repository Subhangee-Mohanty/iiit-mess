import { Link } from 'react-router-dom'
import { EmptyState } from '../components/b423065_components.jsx'

export default function NotFoundPage() {
  return (
    <div className="container page">
      <EmptyState
        icon="🍲"
        title="This page is off the menu"
        text="The page you are looking for does not exist."
        action={
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      />
    </div>
  )
}
