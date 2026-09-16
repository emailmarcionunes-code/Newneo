import { useEffect, useRef, useState } from 'react';
import { Button } from './UI';
import {
  previewRequest,
  sampleAnswer,
  sampleQuestion,
  type ReferenceEvaluation,
} from '@/lib/preview';
import type { LaunchDraft } from '@/lib/launch';

export function EvaluateStep({
  draft,
  result,
  onResult,
}: {
  draft: LaunchDraft;
  result: ReferenceEvaluation | null;
  onResult: (value: ReferenceEvaluation) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [chatError, setChatError] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'user', text: sampleQuestion },
    { role: 'agent', text: sampleAnswer },
  ]);
  const requests = useRef<AbortController[]>([]);
  useEffect(() => {
    // Each visit loads a fresh reference if configuration changes cleared it.
    if (!result) void evaluate();
    return () => requests.current.forEach((request) => request.abort());
  }, []);
  async function evaluate() {
    const controller = new AbortController();
    requests.current.push(controller);
    setLoading(true);
    setError('');
    try {
      onResult(
        await previewRequest<ReferenceEvaluation>(
          { action: 'evaluate', draft },
          controller.signal,
        ),
      );
    } catch (error) {
      if (!controller.signal.aborted)
        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load results. Please try again.',
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim() || sending) return;
    const controller = new AbortController();
    requests.current.push(controller);
    const question = message.trim();
    setSending(true);
    setChatError('');
    try {
      const response = await previewRequest<{
        mode: 'preview';
        answer: string;
      }>({ action: 'chat', draft, message: question }, controller.signal);
      setMessages((current) => [
        ...current,
        { role: 'user', text: question },
        { role: 'agent', text: response.answer },
      ]);
      setMessage('');
    } catch (error) {
      if (!controller.signal.aborted)
        setChatError(
          error instanceof Error
            ? error.message
            : 'Message failed. Please try again.',
        );
    } finally {
      if (!controller.signal.aborted) setSending(false);
    }
  }
  const notes = [
    '47/50 scenarios completed',
    'High groundedness score',
    '2 edge cases need review',
    'All actions performed correctly',
    '$0.14/task vs $0.10 target',
    '3 failure modes unhandled',
  ];
  return (
    <section
      className="evaluateStep hybridEvaluation"
      aria-label="Evaluation preview"
    >
      {result ? (
        <>
          <div className="readinessBanner">
            <div
              role="meter"
              aria-label="Evaluation score"
              aria-valuenow={result.score}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {result.score}%
            </div>
            <div>
              <h3>Agent needs attention</h3>
              <p>5 passed · 2 warnings · 1 failed</p>
              <small>3 scenarios require action before Production.</small>
            </div>
          </div>
          <div className="evaluationRows">
            {result.metrics.map((metric, index) => (
              <div key={metric.name}>
                <span>
                  <strong>{metric.name}</strong>
                  <small>{notes[index]}</small>
                </span>
                <progress
                  aria-label={metric.name}
                  max={100}
                  value={metric.value}
                />
                <b>{metric.value}</b>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p role="status">
          {loading
            ? 'Loading reference results… Next will be enabled shortly.'
            : 'Reference results could not be loaded. Use the button below to try again.'}
        </p>
      )}
      <Button variant="secondary" onClick={evaluate} disabled={loading}>
        {loading
          ? 'Loading reference…'
          : result
            ? 'Reload reference evaluation'
            : 'Load reference evaluation'}
      </Button>
      {error && (
        <p className="requestError" role="alert">
          {error}
        </p>
      )}
      <p className="hybridDataNote">
        Approved design reference · simulated results, not a production
        approval.
      </p>
      <details className="advancedSettings">
        <summary>Test Chat</summary>
        <div className="chatMessages" role="log" aria-label="Demo conversation">
          {messages.map((m, i) => (
            <div key={i} className={`chatMessage ${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form className="chatComposer" onSubmit={send}>
          <label htmlFor="test-message" className="srOnly">
            Test message
          </label>
          <input
            id="test-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="Type a message…"
          />
          <Button type="submit" disabled={sending || !message.trim()}>
            Send message
          </Button>
        </form>
        {chatError && <p role="alert">{chatError}</p>}
      </details>
    </section>
  );
}
