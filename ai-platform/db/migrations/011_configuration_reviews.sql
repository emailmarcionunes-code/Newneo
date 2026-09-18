ALTER TABLE newneo.configuration_checks ADD UNIQUE(organization_id,workspace_id,agent_version_id,id);
CREATE TABLE newneo.configuration_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL,workspace_id uuid NOT NULL,agent_version_id uuid NOT NULL,
 check_id uuid NOT NULL,requested_by uuid NOT NULL REFERENCES newneo.identities(id),notes text NOT NULL CHECK(length(trim(notes)) BETWEEN 1 AND 1000),created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,workspace_id,id),UNIQUE(organization_id,workspace_id,agent_version_id),
 FOREIGN KEY(organization_id,workspace_id,agent_version_id,check_id) REFERENCES newneo.configuration_checks(organization_id,workspace_id,agent_version_id,id));
CREATE TABLE newneo.configuration_decisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),organization_id uuid NOT NULL,workspace_id uuid NOT NULL,review_id uuid NOT NULL UNIQUE,
 actor_id uuid NOT NULL REFERENCES newneo.identities(id),decision text NOT NULL CHECK(decision IN ('approved','rejected')),
 reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 1 AND 1000),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id,review_id) REFERENCES newneo.configuration_reviews(organization_id,workspace_id,id));
ALTER TABLE newneo.configuration_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.configuration_reviews FORCE ROW LEVEL SECURITY;
ALTER TABLE newneo.configuration_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newneo.configuration_decisions FORCE ROW LEVEL SECURITY;
CREATE POLICY member_read ON newneo.configuration_reviews FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=configuration_reviews.organization_id AND m.workspace_id=configuration_reviews.workspace_id));
CREATE POLICY author_request ON newneo.configuration_reviews FOR INSERT WITH CHECK(newneo.can_author(organization_id,workspace_id) AND requested_by=nullif(current_setting('newneo.identity_id',true),'')::uuid);
CREATE POLICY member_read ON newneo.configuration_decisions FOR SELECT USING(EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=configuration_decisions.organization_id AND m.workspace_id=configuration_decisions.workspace_id));
CREATE POLICY independent_reviewer ON newneo.configuration_decisions FOR INSERT WITH CHECK(
 actor_id=nullif(current_setting('newneo.identity_id',true),'')::uuid AND
 EXISTS(SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=configuration_decisions.organization_id AND m.workspace_id=configuration_decisions.workspace_id AND m.role IN ('Org Admin','Reviewer / Approver')) AND
 EXISTS(SELECT 1 FROM newneo.configuration_reviews r JOIN newneo.agent_versions v ON v.id=r.agent_version_id WHERE r.id=configuration_decisions.review_id AND r.organization_id=configuration_decisions.organization_id AND r.workspace_id=configuration_decisions.workspace_id AND r.requested_by<>configuration_decisions.actor_id AND v.created_by<>configuration_decisions.actor_id));
GRANT SELECT,INSERT ON newneo.configuration_reviews,newneo.configuration_decisions TO newneo_app;
CREATE INDEX configuration_reviews_scope ON newneo.configuration_reviews(organization_id,workspace_id,created_at DESC);
CREATE INDEX configuration_decisions_scope ON newneo.configuration_decisions(organization_id,workspace_id,created_at DESC);
