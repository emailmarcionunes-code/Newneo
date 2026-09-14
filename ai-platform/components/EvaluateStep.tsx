import { useEffect, useRef, useState } from 'react';
import { Button, ProgressRing } from './UI';
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
  const [tab, setTab] = useState<'chat' | 'results'>('chat');
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
  useEffect(
    () => () => requests.current.forEach((request) => request.abort()),
    [],
  );
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
  return (
    <section className="evaluateStep" aria-label="Evaluation preview">
      <div
        className="evaluationTabs"
        role="tablist"
        aria-label="Evaluation views"
      >
        {(['chat', 'results'] as const).map((value) => (
          <button
            type="button"
            role="tab"
            id={`tab-${value}`}
            aria-selected={tab === value}
            aria-controls={`panel-${value}`}
            tabIndex={tab === value ? 0 : -1}
            key={value}
            onKeyDown={(event) => {
              if (
                ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 'chat'
                    : event.key === 'End'
                      ? 'results'
                      : tab === 'chat'
                        ? 'results'
                        : 'chat';
                setTab(next);
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
            onClick={() => setTab(value)}
          >
            {value === 'chat' ? 'Test Chat' : 'Evaluation Results'}
          </button>
        ))}
      </div>
      <div className="evaluationColumns">
        <div className="evaluationMain">
          <section
            className="testChat"
            id="panel-chat"
            role="tabpanel"
            aria-labelledby="tab-chat"
            hidden={tab !== 'chat'}
          >
            <p className="referenceLabel">
              Reference conversation · Customer Service Agent
            </p>
            <div
              className="chatMessages"
              role="log"
              aria-label="Demo conversation"
              aria-live="polite"
            >
              {messages.map((item, index) => (
                <div className={`chatMessage ${item.role}`} key={index}>
                  <span className="srOnly">
                    {item.role === 'user' ? 'You' : 'Demo agent'}:{' '}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
            <form className="chatComposer" onSubmit={send}>
              <label htmlFor="test-message" className="srOnly">
                Test message
              </label>
              <input
                id="test-message"
                placeholder="Type a message…"
                value={message}
                maxLength={1000}
                onChange={(event) => setMessage(event.target.value)}
              />
              <Button
                type="submit"
                aria-label="Send message"
                disabled={sending || !message.trim()}
              >
                {sending ? '…' : '→'}
              </Button>
            </form>
            {chatError && (
              <p className="requestError" role="alert">
                {chatError}
              </p>
            )}
          </section>
          <section
            className="evaluationResults"
            id="panel-results"
            role="tabpanel"
            aria-labelledby="tab-results"
            hidden={tab !== 'results'}
          >
            <h3>Evaluation Results</h3>
            {result ? (
              <>
                <p>Reference suite · Customer Service Agent</p>
                <table>
                  <caption>Test case outcomes from the approved design</caption>
                  <thead>
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.cases.map((item) => (
                      <tr key={item.status}>
                        <th scope="row">{item.status}</th>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>
                  The reference includes 3 cases needing review and 1 failed
                  case. It is not a production approval. Individual case details
                  are not supplied in this preview.
                </p>
              </>
            ) : (
              <p>Load the reference evaluation to review the sample results.</p>
            )}
          </section>
        </div>
        <aside className="evaluationSummary">
          <section className="evaluationScore">
            <h3>Evaluation Score</h3>
            {result ? (
              <div className="scoreContent">
                <ProgressRing value={result.score} />
                <div className="evaluationMetrics">
                  {result.metrics.map((metric) => (
                    <div key={metric.name} className="evaluationMetric">
                      <span>{metric.name}</span>
                      <strong>{metric.value}%</strong>
                      <div
                        role="meter"
                        aria-label={metric.name}
                        aria-valuenow={metric.value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="metricTrack"
                      >
                        <div style={{ width: `${metric.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="evaluationEmpty">
                No evaluation loaded. Load the reference results to explore this
                screen.
              </p>
            )}
          </section>
          <section className="testCases">
            <h3>Test Cases ({result ? 50 : 0})</h3>
            {result && (
              <>
                <div className="caseCounts">
                  {result.cases.map((item) => (
                    <span key={item.status}>
                      <i
                        className={`caseDot ${item.status === 'Passed' ? 'passed' : item.status === 'Failed' ? 'failed' : 'review'}`}
                      />
                      {item.count} {item.status}
                    </span>
                  ))}
                </div>
                <Button variant="link" onClick={() => setTab('results')}>
                  View all results →
                </Button>
              </>
            )}
          </section>
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
        </aside>
      </div>
    </section>
  );
}
