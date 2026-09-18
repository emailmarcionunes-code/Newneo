import {test} from 'node:test';
import assert from 'node:assert/strict';
import {neoDay,nextNeoMidnight,readNeoMemory} from '../lib/neo-help-memory';
test('daily memory is restored only for the same local day',()=>{
 const raw=JSON.stringify({day:'2026-09-18',exchanges:[{id:1,question:'Skills?',answer:'Guidance',topic:'skills'}]});
 assert.equal(readNeoMemory(raw,'2026-09-18').length,1);
 assert.deepEqual(readNeoMemory(raw,'2026-09-19'),[]);
 assert.deepEqual(readNeoMemory('bad json','2026-09-18'),[]);
});
test('rollover uses next local midnight including month boundary',()=>{
 const now=new Date(2026,8,30,23,59,59);
 assert.equal(neoDay(now),'2026-09-30');assert.equal(nextNeoMidnight(now),1000);
 assert.equal(neoDay(new Date(now.getTime()+1000)),'2026-10-01');
});
