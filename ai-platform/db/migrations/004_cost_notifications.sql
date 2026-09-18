-- Provider acceptance is not proof of delivery to an email inbox.
ALTER TABLE newneo_cost.events RENAME COLUMN delivered_at TO published_at;
ALTER TABLE newneo_cost.events ADD COLUMN lease_token uuid;
ALTER TABLE newneo_cost.events ADD COLUMN lease_until timestamptz;
ALTER TABLE newneo_cost.events ADD COLUMN provider_message_id text;
ALTER TABLE newneo_cost.events ADD COLUMN last_error text;
CREATE INDEX cost_events_pending ON newneo_cost.events(next_attempt_at) WHERE published_at IS NULL;
