'use client';
import { CapabilityNotice, useDemoAccess } from '../journeys/DemoExperience';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { usePreviewValue } from '../journeys/PreviewState';
import { Button } from '../UI';
import { Dialog, Field } from '../journeys/Shared';
export default function ReportSchedule() {
  const { can } = useDemoAccess();
  const query = useSearchParams();
  const [open, setOpen] = useState(query.get('schedule') === '1');
  const [schedule, setSchedule] = usePreviewValue('reports:schedule', {
    enabled: false,
    day: 'Monday',
    time: '09:00',
    email: '',
  });
  const [form, setForm] = useState(schedule);
  const [message, setMessage] = useState('');
  return (
    <CapabilityNotice cap="operate">
      <section className="panel reportSchedule">
        <div className="surfaceHeading">
          <div>
            <h2>Scheduled reports</h2>
            <p>
              {schedule.enabled
                ? `Weekly · ${schedule.day} at ${schedule.time} · ${schedule.email}`
                : 'No scheduled report in this preview.'}
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(schedule);
              setOpen(true);
            }}
          >
            {schedule.enabled ? 'Edit schedule' : 'Schedule weekly report'}
          </Button>
        </div>
        {message && <p role="status">{message}</p>}
        {schedule.enabled && (
          <Button
            variant="outline"
            onClick={() => {
              setSchedule({ ...schedule, enabled: false });
              setMessage('Report schedule paused in this preview.');
            }}
          >
            Pause schedule
          </Button>
        )}
        {open && can('operate') && (
          <Dialog title="Weekly report schedule" onClose={() => setOpen(false)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSchedule({ ...form, enabled: true });
                setOpen(false);
                setMessage(
                  'Schedule saved for this preview. No report or email will be sent.',
                );
              }}
            >
              <Field label="Delivery day">
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
                    (day) => (
                      <option key={day}>{day}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Delivery time (workspace time)">
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
              <Field label="Recipient email">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <p>
                Preview schedule only. Delivery becomes available after
                integration.
              </p>
              <div className="resourceFooter">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save report schedule</Button>
              </div>
            </form>
          </Dialog>
        )}
      </section>
    </CapabilityNotice>
  );
}
