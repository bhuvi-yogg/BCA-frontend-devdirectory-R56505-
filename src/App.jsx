
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import useTheme from './hooks/useTheme';

import Home from './pages/Home';
import UserDirectory from './pages/UserDirectory';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import AddPost from './pages/AddPost';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

import Jobs from './pages/Jobs';
import ApplicationTracker from './pages/ApplicationTracker';

export default function App() {
  const [theme, toggleTheme] = useTheme();

  return (
    <>
      <div className="bg-orbs" aria-hidden="true" />

      <a href="#main" className="skip">
        Skip to content
      </a>

      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserProfile />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected pages */}
          <Route
            path="/add-post"
            element={
              <ProtectedRoute>
                <AddPost />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'publisher']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Career toolkit */}
          <Route path="/jobs" element={<Jobs />} />

          <Route
            path="/applications"
            element={<ApplicationTracker />}
          />

          <Route
            path="/resume-analyzer"
            element={<ResumeAnalyzer />}
          />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <ChatWidget />
    </>
  );
}
