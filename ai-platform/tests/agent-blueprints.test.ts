import {test} from 'node:test';
import assert from 'node:assert/strict';
import {agentTemplates,getTemplate} from '../lib/catalog';
import {buildBlueprint,preferredProfile,rankModels,matchRecommendation,type ModelCandidate} from '../lib/agent-blueprints';
import {registryInput} from '../server/registry';
test('all catalog templates contain complete enterprise blueprints',()=>{
 assert.equal(agentTemplates.length,20);
 for(const t of agentTemplates){assert.ok(t.defaultMission);assert.ok(t.defaultTargetUsers);assert.ok(t.suggestedBusinessOwner);assert.ok(t.defaultSuccessMetrics.length);assert.ok(t.recommendedSkills.length);assert.ok(t.recommendedKnowledgeTypes.length);assert.ok(t.recommendedTools.length);assert.equal(t.recommendedGovernancePolicies.length,6);assert.ok(t.recommendedEvaluationSuite.length);assert.ok(t.recommendedDeploymentPath.includes('Staging'))}
 assert.notDeepEqual(getTemplate('customer-service').recommendedModelProfile,getTemplate('research-assistant').recommendedModelProfile);
 assert.equal(getTemplate('it-support').suggestedBusinessOwner,'IT Operations');
 assert.ok(getTemplate('it-support').recommendedTools.filter(t=>t.highRisk).every(t=>t.optional));
});
test('custom mission proposes domain-specific requirements; source matching is conservative',()=>{
 const template=getTemplate('custom');const b=buildBlueprint({...template,objective:'Review financial invoices'});
 assert.equal(b.suggestedBusinessOwner,'Finance Operations');assert.equal(b.recommendedInfrastructure,'Private Cloud');
 assert.equal(matchRecommendation('Confluence IT Knowledge',getTemplate('it-support').recommendedKnowledgeTypes[1]),true);
 assert.equal(matchRecommendation('Unrelated customer document',getTemplate('it-support').recommendedKnowledgeTypes[1]),false);
});
test('model recommendation excludes unavailable, unapproved and incompatible models',()=>{
 const profile=getTemplate('it-support').recommendedModelProfile;
 const c:ModelCandidate={id:'a',name:'A',provider:'Provider A',approved:true,available:true,profile,quality:'High',latency:'Fast',cost:'Medium',context:'Medium',multimodal:'No',toolUse:'High'};
 assert.equal(rankModels([{...c,id:'bad',approved:false},{...c,id:'offline',available:false},c],profile).length,1);
 assert.equal(rankModels([c],preferredProfile(profile,'Private / Controlled')).length,0);
 assert.equal(rankModels([],profile).length,0);
 assert.equal(rankModels([c],{...profile,multimodal:true}).length,0);
});
test('blueprint persistence preserves plans and strips claimed approval or execution',()=>{
 const payload={kind:'agent',name:'IT',configuration:{mission:'Resolve requests',skillPlan:JSON.stringify(['Search IT Knowledge']),toolPlan:JSON.stringify(['Search ITSM Records']),governancePlan:JSON.stringify(['Audit Logging']),modelProfile:JSON.stringify({reasoning:'high',approved:true}),environment:'Staging',productionApproved:true}};
 const result=registryInput(payload);const config=result.configuration as Record<string,string>;assert.equal(config.skillPlan,payload.configuration.skillPlan);assert.equal('productionApproved' in result.configuration,false);assert.equal(JSON.parse(config.modelProfile).approved,undefined);
 assert.throws(()=>registryInput({...payload,configuration:{...payload.configuration,toolPlan:'["duplicate","duplicate"]'}}));
 assert.throws(()=>registryInput({...payload,configuration:{...payload.configuration,modelProfile:'{"reasoning":"perfect"}'}}));
});
