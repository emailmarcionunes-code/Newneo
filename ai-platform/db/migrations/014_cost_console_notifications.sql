-- Notifications record provider acceptance, not inbox delivery.
CREATE OR REPLACE FUNCTION newneo.read_cost_console() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE actor uuid; current_period text; m newneo_cost.months%ROWTYPE; usage_cents bigint; pending_cents bigint; count_customers bigint; customer_cap integer; drivers jsonb; events jsonb; unsettled boolean; approvals jsonb;
BEGIN
 SELECT i.id INTO actor FROM newneo.identities i JOIN newneo_cost.console_owners o ON o.identity_id=i.id
 WHERE i.id=nullif(current_setting('newneo.identity_id',true),'')::uuid AND i.issuer=current_setting('newneo.issuer',true) AND i.subject=current_setting('newneo.subject',true);
 IF actor IS NULL THEN RAISE EXCEPTION 'Platform-owner financial access is required.' USING ERRCODE='42501'; END IF;
 current_period:=to_char(now() AT TIME ZONE 'UTC','YYYY-MM');
 SELECT * INTO m FROM newneo_cost.months WHERE period=current_period;
 SELECT coalesce(sum(coalesce(actual_cents,reserved_cents)),0),coalesce(sum(reserved_cents) FILTER(WHERE actual_cents IS NULL),0) INTO usage_cents,pending_cents FROM newneo_cost.reservations WHERE period=current_period;
 SELECT count(*) INTO count_customers FROM newneo_cost.customers;
 SELECT customer_limit INTO customer_cap FROM newneo_cost.policy WHERE id=true;
 SELECT EXISTS(SELECT 1 FROM newneo_cost.reservations WHERE period<>current_period AND actual_cents IS NULL) INTO unsettled;
 SELECT coalesce(jsonb_agg(to_jsonb(d)),'[]'::jsonb) INTO drivers FROM (SELECT service,sum(coalesce(actual_cents,reserved_cents)) AS cents,count(*) AS operations FROM newneo_cost.reservations WHERE period=current_period GROUP BY service ORDER BY cents DESC,service LIMIT 10) d;
 SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]'::jsonb) INTO events FROM (SELECT id,kind,created_at,published_at,attempts,next_attempt_at FROM newneo_cost.events ORDER BY created_at DESC,id LIMIT 25) e;
 SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb) INTO approvals FROM (SELECT scope,period,previous_limit,new_limit,reason,created_at FROM newneo_cost.approvals ORDER BY created_at DESC,id LIMIT 10) a;
 RETURN jsonb_build_object('period',current_period,'customerCount',count_customers,'customerLimit',customer_cap,'customerAdmissionBlocked',count_customers>=customer_cap,
 'accountingState',CASE WHEN m.period IS NULL THEN 'missing' WHEN m.valid_until<=now() THEN 'stale' ELSE 'fresh' END,
 'validUntil',m.valid_until,'limitCents',m.limit_cents,'baselineCents',m.baseline_cents,'reservedAndSettledCents',usage_cents,'pendingReservationCents',pending_cents,
 'usedCents',CASE WHEN m.period IS NULL THEN NULL ELSE m.baseline_cents+usage_cents END,
 'reservationGate',CASE WHEN m.period IS NULL OR m.valid_until<=now() THEN 'accounting-unavailable' WHEN unsettled THEN 'previous-period-unsettled' WHEN m.baseline_cents+usage_cents>=m.limit_cents THEN 'budget-exhausted' ELSE 'bounded-reservations-only' END,
 'drivers',drivers,'events',events,'approvals',approvals,'pendingNotifications',(SELECT count(*) FROM newneo_cost.events WHERE published_at IS NULL));
END $$;
