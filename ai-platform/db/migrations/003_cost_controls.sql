-- Deliberately private: never grant this schema to newneo_app or tenant roles.
CREATE SCHEMA newneo_cost;
REVOKE ALL ON SCHEMA newneo_cost FROM PUBLIC;
CREATE TABLE newneo_cost.policy (
 id boolean PRIMARY KEY DEFAULT true CHECK(id),
 customer_limit integer NOT NULL DEFAULT 10 CHECK(customer_limit > 0)
);
INSERT INTO newneo_cost.policy DEFAULT VALUES;
CREATE TABLE newneo_cost.months (
 period text PRIMARY KEY CHECK(period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
 limit_cents bigint NOT NULL DEFAULT 100000 CHECK(limit_cents > 0),
 baseline_cents bigint NOT NULL CHECK(baseline_cents >= 0),
 valid_until timestamptz NOT NULL
);
CREATE TABLE newneo_cost.customers (
 organization_id uuid PRIMARY KEY REFERENCES newneo.organizations(id),
 activated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE newneo_cost.reservations (
 id text PRIMARY KEY CHECK(length(id) BETWEEN 1 AND 200),
 period text NOT NULL REFERENCES newneo_cost.months(period),
 organization_id uuid NOT NULL REFERENCES newneo_cost.customers(organization_id),
 service text NOT NULL CHECK(length(service) BETWEEN 1 AND 100),
 reserved_cents bigint NOT NULL CHECK(reserved_cents > 0),
 actual_cents bigint CHECK(actual_cents >= 0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE newneo_cost.events (
 id text PRIMARY KEY,
 kind text NOT NULL,
 recipient text NOT NULL DEFAULT 'adm@gawservices.com',
 payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 delivered_at timestamptz,
 attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE newneo_cost.approvals (
 id text PRIMARY KEY,
 scope text NOT NULL CHECK(scope IN ('customers','monthly-spend')),
 period text,
 previous_limit bigint NOT NULL,
 new_limit bigint NOT NULL,
 actor text NOT NULL,
 reason text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
