import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="footer container">
      <span>© DevDirectory · demo data from JSONPlaceholder</span>
      <span className="row wrap"><Link to="/users">Developers</Link><Link to="/add-post">Publish</Link><Link to="/login">Log in</Link>
        <a href="https://jsonplaceholder.typicode.com" target="_blank" rel="noreferrer">API</a></span>
    </footer>
  );
}
