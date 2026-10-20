import { Link } from 'react-router-dom';
export default function NotFound() {
  return <section className="container narrow glass pad center-text"><h1 className="gradient-text">404</h1><p>That page doesn’t exist.</p><Link className="btn" to="/">Back to home</Link></section>;
}
