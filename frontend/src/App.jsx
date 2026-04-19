import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── Constants ────────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  "Just started",
  "1–2 days",
  "3–5 days",
  "1 week+",
  "Chronic / Recurring",
];

const SEVERITY_CONFIG = {
  low: {
    label: "Self-Care at Home",
    colorClass: "result--green",
    icon: "🏠",
    badge: "LOW SEVERITY",
    badgeClass: "badge--green",
  },
  medium: {
    label: "Visit a Clinic",
    colorClass: "result--yellow",
    icon: "🏥",
    badge: "MEDIUM SEVERITY",
    badgeClass: "badge--yellow",
  },
  high: {
    label: "Go to Emergency",
    colorClass: "result--red",
    icon: "🚨",
    badge: "HIGH SEVERITY",
    badgeClass: "badge--red",
  },
};

// ─── Spinner Component ────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="spinner-text">Analyzing symptoms…</p>
    </div>
  );
}

// ─── Result Component ─────────────────────────────────────────────────────────

function ResultCard({ result, onReset }) {
  const config = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.medium;
  const [hospitalClicked, setHospitalClicked] = useState(false);

  function handleFindHospitals() {
    setHospitalClicked(true);
    // Opens Google Maps search for nearby hospitals in a new tab
    const query = encodeURIComponent("hospitals near me");
    window.open(`https://www.google.com/maps/search/${query}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`result-card ${config.colorClass}`} role="region" aria-label="Triage result">
      <div className="result-header">
        <span className={`badge ${config.badgeClass}`}>{config.badge}</span>
        <span className="result-icon" aria-hidden="true">{config.icon}</span>
      </div>

      <h2 className="result-title">{config.label}</h2>

      <div className="result-divider" aria-hidden="true" />

      <p className="result-reason">{result.reason}</p>

      <div className="result-actions">
        {result.severity === "high" && (
          <a
            href="tel:112"
            className="btn btn--emergency"
            aria-label="Call emergency services 112"
          >
            📞 Call 112 Now
          </a>
        )}

        <button
          className="btn btn--hospitals"
          onClick={handleFindHospitals}
          aria-label="Find nearby hospitals on Google Maps"
        >
          {hospitalClicked ? "🗺️ Opening Maps…" : "🗺️ Find Nearby Hospitals"}
        </button>

        <button
          className="btn btn--reset"
          onClick={onReset}
          aria-label="Start a new triage assessment"
        >
          ← New Assessment
        </button>
      </div>

      <p className="disclaimer">
        ⚠️ MediRoute is an AI triage aid only — it does not replace a qualified
        doctor. In a medical emergency always call <strong>112</strong>.
      </p>
    </div>
  );
}

// ─── Form Component ───────────────────────────────────────────────────────────

function TriageForm({ onResult, onError, onLoading, isLoading }) {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [duration, setDuration] = useState("");
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError("");

    if (symptoms.trim().length < 3) {
      setFieldError("Please describe your symptoms (at least 3 characters).");
      return;
    }

    onLoading(true);
    onError(null);
    onResult(null);

    try {
      const response = await fetch(`${API_URL}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          age: age.trim(),
          duration,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        await response.text();
      }

      if (!contentType.includes("application/json")) {
        throw new Error("Server error");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Server error");
      }

      onResult(data);
    } catch (err) {
      const networkError = err instanceof TypeError;
      onError(networkError ? "Network error. Please check your internet connection." : (err.message || "Server error"));
    } finally {
      onLoading(false);
    }
  }

  return (
    <form className="triage-form" onSubmit={handleSubmit} noValidate>
      {/* Symptoms */}
      <div className="field">
        <label className="field-label" htmlFor="symptoms">
          Describe your symptoms <span className="required" aria-hidden="true">*</span>
        </label>
        <textarea
          id="symptoms"
          className={`field-textarea ${fieldError ? "field--error" : ""}`}
          rows={4}
          placeholder="e.g. I have had a fever of 101°F for two days along with a headache and sore throat…"
          value={symptoms}
          onChange={(e) => {
            setSymptoms(e.target.value);
            if (fieldError) setFieldError("");
          }}
          disabled={isLoading}
          required
          aria-describedby={fieldError ? "symptoms-error" : undefined}
        />
        {fieldError && (
          <p className="field-error-msg" id="symptoms-error" role="alert">
            {fieldError}
          </p>
        )}
      </div>

      {/* Age + Duration row */}
      <div className="field-row">
        <div className="field field--half">
          <label className="field-label" htmlFor="age">
            Age (years)
          </label>
          <input
            id="age"
            type="number"
            className="field-input"
            placeholder="e.g. 34"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="field field--half">
          <label className="field-label" htmlFor="duration">
            Duration
          </label>
          <select
            id="duration"
            className="field-select"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select duration…</option>
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn--submit"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? "Analyzing…" : "Analyse Symptoms →"}
      </button>
    </form>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleReset() {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="page">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">🏥</span>
            <div className="logo-text">
              <span className="logo-name">MediRoute</span>
              <span className="logo-tagline">AI Health Triage</span>
            </div>
          </div>
          <span className="header-badge">For Rural India</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main">
        <div className="container">

          {/* Hero */}
          {!result && !isLoading && (
            <div className="hero">
              <h1 className="hero-title">
                Get the right care,{" "}
                <span className="hero-accent">instantly.</span>
              </h1>
              <p className="hero-sub">
                Describe your symptoms and our AI will tell you whether to
                stay home, visit a clinic, or go to emergency — in seconds.
              </p>
            </div>
          )}

          {/* Card */}
          <div className="card">
            {isLoading ? (
              <Spinner />
            ) : result ? (
              <ResultCard result={result} onReset={handleReset} />
            ) : (
              <>
                <h2 className="card-title">Patient Assessment</h2>
                <TriageForm
                  onResult={setResult}
                  onError={setError}
                  onLoading={setIsLoading}
                  isLoading={isLoading}
                />
              </>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="error-box" role="alert">
                <span className="error-icon" aria-hidden="true">⚠️</span>
                <div>
                  <strong>Something went wrong</strong>
                  <p>{error}</p>
                </div>
                <button
                  className="btn btn--reset"
                  onClick={handleReset}
                  style={{ marginTop: "0.75rem" }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Info strip */}
          {!result && !isLoading && (
            <div className="info-strip">
              <div className="info-item">
                <span className="info-icon">⚡</span>
                <span>Results in seconds</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <span>No data stored</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🌐</span>
                <span>Hindi support coming soon</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>
          MediRoute is an AI triage tool only. Always consult a qualified
          doctor for medical advice. Emergency: <strong>112</strong>
        </p>
        <p className="footer-sub">
          Built for Technophilia Hackathon 2026 · College of Vocational Studies,
          University of Delhi
        </p>
      </footer>
    </div>
  );
}
