
import { useState } from 'react';
import {
  getApplications,
  updateApplicationStatus,
  removeApplication,
} from '../services/jobService';

const statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState(getApplications);

  function changeStatus(jobId, status) {
    updateApplicationStatus(jobId, status);
    setApplications(getApplications());
  }

  function deleteApplication(jobId) {
    removeApplication(jobId);
    setApplications(getApplications());
  }

  return (
    <div className="container">
      <section className="hero">
        <p className="eyebrow">Stay organised</p>
        <h1>My <span className="gradient-text">applications</span></h1>
        <p className="muted">Track every opportunity in one place.</p>
      </section>

      <section className="glass pad stack">
        <div className="stats">
          <div className="glass stat">
            <strong>{applications.length}</strong>
            <span>Total jobs</span>
          </div>
          <div className="glass stat">
            <strong>{applications.filter((a) => a.status === 'Applied').length}</strong>
            <span>Applied</span>
          </div>
          <div className="glass stat">
            <strong>{applications.filter((a) => a.status === 'Interview').length}</strong>
            <span>Interviews</span>
          </div>
          <div className="glass stat">
            <strong>{applications.filter((a) => a.status === 'Offer').length}</strong>
            <span>Offers</span>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="empty">
            <h3>No applications yet</h3>
            <p className="muted">Save a job or click Apply on the Jobs page.</p>
          </div>
        ) : (
          <div className="stack">
            {applications.map((job) => (
              <article className="glass pad stack" key={job.jobId}>
                <div className="row between wrap">
                  <div>
                    <h3>{job.title}</h3>
                    <p className="muted">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <a href={job.applyUrl} target="_blank" rel="noreferrer">
                    Company link ↗
                  </a>
                </div>

                <label>
                  Application status
                  <select
                    value={job.status}
                    onChange={(e) => changeStatus(job.jobId, e.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <p className="muted small">
                  Added: {new Date(job.savedAt).toLocaleDateString()}
                </p>

                <div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteApplication(job.jobId)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
