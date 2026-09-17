-- A request never applies configuration, grants access, or activates execution.
DROP POLICY IF EXISTS create_agent_requests ON newneo.agent_requests;
CREATE POLICY create_agent_requests ON newneo.agent_requests FOR INSERT WITH CHECK (
 created_by=nullif(current_setting('newneo.identity_id',true),'')::uuid AND EXISTS (
 SELECT 1 FROM newneo.workspace_memberships m WHERE m.organization_id=agent_requests.organization_id
 AND m.workspace_id=agent_requests.workspace_id AND m.active
 AND m.identity_id=nullif(current_setting('newneo.identity_id',true),'')::uuid));
