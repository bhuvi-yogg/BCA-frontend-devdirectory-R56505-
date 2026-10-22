
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { demoJobs, saveApplication } from '../services/jobService';

export default function Jobs() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [type, setType] = useState('All');
  const [message, setMessage] = useState('');
  const [savedJobIds, setSavedJobIds] = useState([]);

  const jobs = useMemo(() => {
    const search = query.toLowerCase().trim();

    return demoJobs.filter((job) => {
      const searchable = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...job.skills,
      ]
        .join(' ')
        .toLowerCase();

      return (
        searchable.includes(search) &&
        (location === 'All' || job.location.includes(location)) &&
        (type === 'All' || job.type === type)
      );
    });
  }, [query, location, type]);

  function saveJob(job) {
    saveApplication(job, 'Saved');

    setSavedJobIds((previous) =>
      previous.includes(job.id) ? previous : [...previous, job.id]
    );

    setMessage(
      `"${job.title}" saved to My Applications.`
    );
  }

  function applyJob(job) {
    // Record the job in the local application tracker.
    saveApplication(job, 'Applied');

    setMessage(
      `"${job.title}" marked as Applied in My Applications. This is a demo listing; no real company application was submitted.`
    );
  }

  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">Your next opportunity</p>

        <h1>
          Find your <span className="gradient-text">developer job</span>
        </h1>

        <p className="muted">
          Search internships and developer roles by skill, company or location.
        </p>
      </section>

      <section className="glass pad stack">
        <div className="filters">
          <input
            type="search"
            aria-label="Search jobs"
            placeholder="Search React, JavaScript, company..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            aria-label="Filter by location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="All">All locations</option>
            <option value="Remote">Remote</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>

          <select
            aria-label="Filter by job type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="All">All job types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
          </select>
        </div>

        {message && (
          <div className="alert alert-success" role="status">
            {message}
          </div>
        )}

        <p className="muted small">
          {jobs.length} sample jobs found
        </p>

        {jobs.length === 0 ? (
          <div className="empty">
            <h3>No matching jobs</h3>
            <p className="muted">
              Try another skill or location.
            </p>
          </div>
        ) : (
          <div className="grid">
            {jobs.map((job) => (
              <article className="glass card" key={job.id}>
                <div className="row between">
                  <span className="chip">{job.type}</span>
                  <span className="muted small">{job.location}</span>
                </div>

                <h3>{job.title}</h3>
                <p className="muted">{job.company}</p>
                <p>{job.description}</p>

                <div className="chips">
                  {job.skills.map((skill) => (
                    <span className="chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="row wrap" style={{ marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => saveJob(job)}
                  >
                    {savedJobIds.includes(job.id) ? 'Saved ✓' : 'Save Job'}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => applyJob(job)}
                  >
                    Mark as Applied
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="muted small">
          These are sample listings for testing, not verified vacancies.
          Marking a job as Applied only updates your local tracker; it does
          not submit an application to a company.
        </p>

        <Link to="/applications">
          View my application tracker →
        </Link>
      </section>
    </div>
  );
}
