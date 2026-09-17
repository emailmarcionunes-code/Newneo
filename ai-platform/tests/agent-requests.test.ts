import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requestBrief,saveAgentRequest} from '../server/agent-requests';
const brief={outcome:'Resolve IT requests',department:'IT',targetUsers:'Employees',systems:'ServiceNow',volume:'100 per day',sensitivity:'Internal'};
test('request brief is bounded and strips operational claims',()=>{assert.deepEqual(requestBrief({...brief,activated:true}),brief);assert.throws(()=>requestBrief({...brief,outcome:''}));assert.throws(()=>requestBrief({...brief,volume:'x'.repeat(201)}))});
test('request author role required and requests never create agents',async()=>{const queries:string[]=[];const db={query:async(q:string)=>{queries.push(q);return {rows:q.startsWith('SELECT role')?[{can_edit:true}]:[{id:'request',status:'Pending review'}]}}};await saveAgentRequest(db as never,{organizationId:'org',workspaceId:'workspace'},'actor',brief);assert.equal(queries.length,2);assert.match(queries[1],/INSERT INTO newneo.agent_requests/);const denied={query:async()=>({rows:[{can_edit:false}]})};await assert.rejects(()=>saveAgentRequest(denied as never,{organizationId:'org',workspaceId:'workspace'},'actor',brief))});
