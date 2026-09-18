import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('financial console is owner-only, read-only and distinguishes missing, stale and exhausted accounting',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE newneo_app');
 for(const file of ['001_platform.sql','002_identity_and_drafts.sql','003_cost_controls.sql','004_cost_notifications.sql','005_account_profiles.sql','006_versioned_registry.sql','008_workspace_members.sql','013_cost_console.sql','014_cost_console_notifications.sql','015_platform_owner.sql'])await db.exec(await readFile(new URL('../db/migrations/'+file,import.meta.url),'utf8'));
 const users=(await db.query<{id:string}>("INSERT INTO newneo.identities(issuer,subject) VALUES('https://test.example','owner'),('https://test.example','tenant') RETURNING id")).rows;
 await db.query('INSERT INTO newneo_cost.console_owners(identity_id) VALUES($1)',[users[0].id]);
 await db.exec('GRANT USAGE ON SCHEMA newneo TO newneo_app');
 const org=(await db.query<{id:string}>("INSERT INTO newneo.organizations(name) VALUES('Customer') RETURNING id")).rows[0].id;
 await db.query('INSERT INTO newneo_cost.customers(organization_id) VALUES($1)',[org]);
 const read=async(i:number,subject=i?'tenant':'owner')=>{await db.exec('BEGIN; SET LOCAL ROLE newneo_app');try{await db.query("SELECT set_config('newneo.identity_id',$1,true),set_config('newneo.issuer','https://test.example',true),set_config('newneo.subject',$2,true)",[users[i].id,subject]);const value=(await db.query<{data:Record<string,unknown>}>('SELECT newneo.read_cost_console() AS data')).rows[0].data;await db.exec('COMMIT');return value}catch(e){await db.exec('ROLLBACK');throw e}};
 await assert.rejects(read(1),/Platform-owner/);
 await assert.rejects(read(0,'tenant'),/Platform-owner/);
 const missing=await read(0);assert.equal(missing.accountingState,'missing');assert.equal(missing.usedCents,null);assert.equal(missing.limitCents,null);assert.equal(missing.customerCount,1);assert.equal(missing.customerLimit,10);assert.equal(missing.reservationGate,'accounting-unavailable');
 await db.exec("INSERT INTO newneo_cost.months(period,baseline_cents,valid_until) VALUES(to_char(now() AT TIME ZONE 'UTC','YYYY-MM'),20000,now()+interval '1 hour')");
 const fresh=await read(0);assert.equal(fresh.usedCents,20000);assert.equal(fresh.limitCents,100000);assert.equal(fresh.accountingState,'fresh');assert.equal(fresh.reservationGate,'bounded-reservations-only');
 await db.query("INSERT INTO newneo_cost.reservations(id,period,organization_id,service,reserved_cents) VALUES('one',to_char(now() AT TIME ZONE 'UTC','YYYY-MM'),$1,'provider',80000)",[org]);
 const exhausted=await read(0);assert.equal(exhausted.usedCents,100000);assert.equal(exhausted.pendingReservationCents,80000);assert.equal(exhausted.reservationGate,'budget-exhausted');
 await db.exec("UPDATE newneo_cost.months SET valid_until=now()-interval '1 minute'");assert.equal((await read(0)).accountingState,'stale');assert.equal((await read(0)).reservationGate,'accounting-unavailable');
 await db.exec("INSERT INTO newneo_cost.events(id,kind,payload) VALUES('test','spend-threshold','{}')");assert.equal((await read(0)).pendingNotifications,1);
 await db.exec('SET ROLE newneo_app');await assert.rejects(db.query('SELECT * FROM newneo_cost.policy'),/permission denied/);await assert.rejects(db.query('INSERT INTO newneo_cost.console_owners(identity_id) VALUES($1)',[users[1].id]),/permission denied/);await assert.rejects(db.query('UPDATE newneo_cost.policy SET customer_limit=100'),/permission denied/);
 }finally{await db.close()}
});
