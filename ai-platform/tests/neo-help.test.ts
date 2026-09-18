import {test} from 'node:test';
import assert from 'node:assert/strict';
import {answerNeoHelp} from '../lib/neo-help';
test('specific skill intent takes precedence over generic agent mention',()=>{
 const r=answerNeoHelp('Como adicionar uma skill ao meu agente?','AI Platform Admin');
 assert.equal(r.topic,'skills');assert.match(r.text,/Operations → Skills/);
});
test('user receives handoff guidance rather than administrative instructions',()=>{
 const r=answerNeoHelp('How do I change user permissions?','Operator');
 assert.equal(r.topic,'access');assert.match(r.text,/Administrator manages/);assert.doesNotMatch(r.text,/choose User/);
});
test('financial queries are scoped and never invent current spend',()=>{
 const r=answerNeoHelp('qual o custo do meu agente?','Org Admin');assert.equal(r.topic,'costs');assert.match(r.text,/não lê sua fatura/);
 assert.match(answerNeoHelp('billing','AI Platform Admin').text,/Administrator manages/);
});
test('followup keeps topic but rechecks permissions; unknown requests are explicit',()=>{
 assert.equal(answerNeoHelp('more details','AI Platform Admin','skills').topic,'skills');
 assert.match(answerNeoHelp('more details','Operator','costs').text,/Administrator manages/);
 assert.match(answerNeoHelp('weather on mars','Org Admin').text,/could not find guidance/);
});
