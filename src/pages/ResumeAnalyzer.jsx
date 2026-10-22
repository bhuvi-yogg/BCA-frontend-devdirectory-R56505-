
import { useState } from 'react';
import { runAi } from '../services/aiService';

export default function ResumeAnalyzer() {
  const [role, setRole] = useState('Frontend Developer');
  const [resume, setResume] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function analyzeResume(e) {
    e.preventDefault();
    setError('');
    setResult('');

    if (resume.trim().length < 80) {
      setError('Please paste at least 80 characters of resume text.');
      return;
    }

    setLoading(true);

    try {
      const data = await runAi('resume', {
        title: role,
        text: resume,
      });
      setResult(data.text || 'No analysis was returned.');
    } catch (err) {
      setError(err.message || 'Resume analysis failed. Check your AI server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container narrow">
      <section className="hero">
        <p className="eyebrow">AI career toolkit</p>
        <h1>AI Resume <span className="gradient-text">Analyzer</span></h1>
        <p className="muted">
          Get actionable feedback for your target developer role.
        </p>
      </section>

      <form className="glass pad stack" onSubmit={analyzeResume}>
        <label>
          Target job role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>Java Developer</option>
            <option>Python Developer</option>
            <option>AI/ML Engineer</option>
          </select>
        </label>

        <label>
          Paste your resume text
          <textarea
            rows={14}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your professional summary, skills, education, projects and experience here..."
            required
          />
        </label>

        <p className="muted small">
          Remove personal details you do not want to share. Do not paste passwords,
          identity numbers or other sensitive information.
        </p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Analyzing resume...' : 'Analyze My Resume'}
        </button>
      </form>

      {result && (
        <section className="glass pad stack" style={{ marginTop: '1rem' }}>
          <h2>Resume feedback</h2>
          <div className="preview">{result}</div>
          <p className="muted small">
            AI-generated guidance is an estimate, not an official ATS score or a
            guarantee of getting shortlisted.
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => navigator.clipboard?.writeText(result)}
          >
            Copy feedback
          </button>
        </section>
      )}
    </div>
  );
}
