'use client';
import { useState } from 'react';
import Link from 'next/link';
import { NewneoWordmark } from '../NewneoLogo';
import { Button, FormField } from '../UI';
export default function Login() {
  const [message, setMessage] = useState('');
  return (
    <main className="hybridLogin">
      <section>
        <NewneoWordmark />
        <div>
          <h1>
            Enterprise AI
            <br />
            <span>Command Center</span>
          </h1>
          <p>
            Create, govern, evaluate and operate AI agents across your
            enterprise — with full auditability and control.
          </p>
          <div className="loginNumbers">
            <div>
              <strong>6</strong>
              <small>Active agents</small>
            </div>
            <div>
              <strong>99.7%</strong>
              <small>Uptime SLA</small>
            </div>
            <div>
              <strong>7.9K</strong>
              <small>Tasks today</small>
            </div>
          </div>
        </div>
        <div className="tags">
          <span className="tag">SOC 2 Type II</span>
          <span className="tag">GDPR</span>
          <span className="tag">ISO 27001</span>
        </div>
        <small>
          Illustrative workspace and certification labels from the approved
          design.
        </small>
      </section>
      <section>
        <div className="loginForm">
          <h2>Welcome back</h2>
          <p>Sign in to your Newneo workspace</p>
          <Link className="button secondary" href="/api/auth/login">
            Continue with Enterprise SSO
          </Link>
          <p className="loginDivider">or sign in with email</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMessage(
                'Email sign-in is not connected in this preview. Use Explore preview to review the product.',
              );
            }}
          >
            <FormField
              id="email"
              label="Work email"
              type="email"
              autoComplete="username"
              placeholder="sarah.andrade@acmecorp.com"
              required
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Button
              variant="link"
              onClick={() =>
                setMessage(
                  'Password recovery is managed by your organization identity provider.',
                )
              }
            >
              Forgot password?
            </Button>
            <Button type="submit">Sign in</Button>
          </form>
          {message && <p role="status">{message}</p>}
          <Link className="loginPreview" href="/">
            Explore preview →
          </Link>
        </div>
      </section>
    </main>
  );
}
