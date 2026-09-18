import {test} from 'node:test';
import assert from 'node:assert/strict';
import {agentTemplates,getTemplate} from '../lib/catalog';
import {agentAddition} from '../lib/agent-addition';
import {registryInput} from '../server/registry';
test('every catalog Agent can be added without connections or a fabricated deployment',()=>{
 for(const a of agentTemplates){const input=agentAddition(a,a.id,a.name,a.description,{access:{can_edit:true},skills:[],skillVersions:[],documents:[]});const saved=registryInput(input);assert.equal(saved.configuration.environment,'Staging');assert.equal(saved.configuration.blueprintTemplateId,a.id);assert.deepEqual(saved.skillVersionIds,[]);assert.deepEqual(saved.documentIds,[]);assert.ok(!('productionApproved' in saved.configuration));}
});
test('quick add links latest available versions but excludes archived, optional and high-risk capabilities',()=>{
 const a=getTemplate('it-support');const r=a.recommendedSkills.find(s=>!s.optional&&!s.highRisk)!;
 const input=agentAddition(a,a.id,a.name,a.description,{access:{can_edit:true},skills:[{id:'a',name:r.name},{id:'b',name:r.name,archived_at:'2026-01-01'},{id:'c',name:'Reset Password'}],skillVersions:[{id:'old',skill_id:'a',number:1},{id:'new',skill_id:'a',number:2},{id:'archived',skill_id:'b',number:3},{id:'risk',skill_id:'c',number:1}],documents:[]});assert.deepEqual(input.skillVersionIds,['new']);assert.ok(!JSON.parse(input.configuration.skillPlan).includes('Reset Password'));
});
