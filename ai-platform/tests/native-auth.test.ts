import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { AuthError, AuthLimiter, authMessage, nativeAuth, verifyIdentity } from '../server/native-auth';
import { seal, unseal } from '../server/session-token';

process.env.OIDC_ISSUER_URL = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TEST';
process.env.OIDC_CLIENT_ID = 'test-client';
process.env.OIDC_CLIENT_SECRET = 'test-only-secret';
process.env.SESSION_SECRET = '12'.repeat(32);
const identity = { iss: process.env.OIDC_ISSUER_URL, sub: 'verified-subject', exp: Math.floor(Date.now()/1000)+3600 };
const hash = (name: string) => createHmac('sha256','test-only-secret').update(name+'test-client').digest('base64');

test('password sign-in issues identity only after token verification, never exposes tokens or password', async () => {
  let verified = false;
  const result = await nativeAuth({ action:'signin', email:'member@example.com',password:'test-password' }, null, async (action, body) => {
    assert.equal(action,'InitiateAuth'); assert.equal(body.AuthFlow,'USER_AUTH');
    assert.deepEqual(body.AuthParameters,{ USERNAME:'member@example.com',PASSWORD:'test-password',PREFERRED_CHALLENGE:'PASSWORD',SECRET_HASH:hash('member@example.com') });
    return { AuthenticationResult:{IdToken:'signed-id-token'} };
  },async token=>{ assert.equal(token,'signed-id-token'); verified=true; return identity; });
  assert.ok(verified); assert.deepEqual(result,{view:{step:'complete'},identity});
  assert.ok(!JSON.stringify(result).includes('signed-id-token'));
});
test('a token verification failure cannot produce an authenticated outcome', async () => {
  await assert.rejects(nativeAuth({action:'signin',email:'x@example.com',password:'x'},null,async()=>({AuthenticationResult:{IdToken:'forged'}}),async()=>{throw new Error('invalid signature');}),/invalid signature/);
});
test('production verifier rejects malformed tokens', async () => {
  await assert.rejects(verifyIdentity('not.a.valid.jwt'));
});
test('MFA remains mandatory and uses canonical username and server-side challenge', async () => {
  const first = await nativeAuth({action:'signin',email:'alias@example.com',password:'x'},null,async()=>({ChallengeName:'SOFTWARE_TOKEN_MFA',Session:'provider-session',ChallengeParameters:{USERNAME:'canonical-user'}}));
  assert.equal(first.view.step,'code'); assert.equal(first.identity,undefined);
  assert.ok(!JSON.stringify(first.view).includes('provider-session'));
  assert.ok(!JSON.stringify(first.state).includes('password'));
  const second = await nativeAuth({action:'challenge',code:'123456',challenge:'complete',username:'attacker'},first.state!,async (action,body)=>{
    assert.equal(action,'RespondToAuthChallenge'); assert.equal(body.Session,'provider-session'); assert.equal(body.ChallengeName,'SOFTWARE_TOKEN_MFA');
    assert.deepEqual(body.ChallengeResponses,{USERNAME:'canonical-user',SECRET_HASH:hash('canonical-user'),SOFTWARE_TOKEN_MFA_CODE:'123456'});
    return {AuthenticationResult:{IdToken:'verified'}};
  },async()=>identity);
  assert.deepEqual(second.identity,identity);
});
test('first login collects only Cognito-required attributes and still honors subsequent MFA', async()=>{
  const first=await nativeAuth({action:'signin',email:'user@example.com',password:'temporary'},null,async()=>({ChallengeName:'NEW_PASSWORD_REQUIRED',Session:'first',ChallengeParameters:{requiredAttributes:'["userAttributes.name"]'}}));
  assert.deepEqual(first.view.requiredAttributes,['name']);
  const next=await nativeAuth({action:'challenge',password:'new-password',attributes:{name:'Jane',email_verified:'true'}},first.state!,async(_,body)=>{
    assert.deepEqual(body.ChallengeResponses,{USERNAME:'user@example.com',SECRET_HASH:hash('user@example.com'),NEW_PASSWORD:'new-password','userAttributes.name':'Jane'});
    return {ChallengeName:'SMS_MFA',Session:'next'};
  });
  assert.equal(next.view.step,'code'); assert.equal(next.identity,undefined);
});
test('recovery masks nonexistent accounts and confirmation does not sign users in',async()=>{
  const found=await nativeAuth({action:'forgot',email:'user@example.com'},null,async()=>({}));
  const missing=await nativeAuth({action:'forgot',email:'user@example.com'},null,async()=>{throw new AuthError('UserNotFoundException');});
  assert.deepEqual(found,missing);
  const reset=await nativeAuth({action:'reset',code:'123456',password:'new-password'},found.state!,async(action,body)=>{
    assert.equal(action,'ConfirmForgotPassword'); assert.equal(body.Username,'user@example.com'); return {};
  });
  assert.equal(reset.view.step,'signin'); assert.equal(reset.identity,undefined); assert.equal(reset.state,undefined);
});
test('MFA enrollment uses the verified session before completing the challenge',async()=>{
  const first=await nativeAuth({action:'signin',email:'u@example.com',password:'x'},null,async(action)=>action==='InitiateAuth'?{ChallengeName:'MFA_SETUP',Session:'initial',ChallengeParameters:{MFAS_CAN_SETUP:'["SOFTWARE_TOKEN_MFA"]'}}:{Session:'associated',SecretCode:'setup-key'});
  assert.equal(first.view.step,'setup-mfa'); assert.equal(first.state?.session,'associated'); assert.equal(first.identity,undefined);
  const actions:string[]=[];
  await nativeAuth({action:'challenge',code:'123456'},first.state!,async(action,body)=>{
    actions.push(action);
    if(action==='VerifySoftwareToken'){assert.equal(body.Session,'associated');return {Session:'verified-setup',Status:'SUCCESS'};}
    assert.equal(body.Session,'verified-setup'); assert.equal(body.ChallengeName,'MFA_SETUP');return {AuthenticationResult:{IdToken:'signed'}};
  },async()=>identity);
  assert.deepEqual(actions,['VerifySoftwareToken','RespondToAuthChallenge']);
});
test('challenge input cannot bypass missing, expired or unsupported authentication state',async()=>{
  let called=false; const provider=async()=>{called=true;return {};};
  await assert.rejects(nativeAuth({action:'challenge',code:'1'},null,provider),/Expired/);
  await assert.rejects(nativeAuth({action:'challenge',code:'1'},{username:'u',challenge:'CUSTOM_CHALLENGE',session:'s'},provider),/UnsupportedChallenge/);
  await assert.rejects(nativeAuth({action:'challenge',choice:'EMAIL_OTP'},{username:'u',challenge:'SELECT_MFA_TYPE',session:'s',choices:['SOFTWARE_TOKEN_MFA']},provider),/InvalidInput/);
  assert.equal(called,false);
});
test('encrypted challenge expires and is not usable as an application session',()=>{
  const state={username:'u',challenge:'SMS_MFA',session:'private-session'};
  const token=seal(state,'native-auth',Date.now()+180000);
  assert.deepEqual(unseal(token,'native-auth'),state);
  assert.equal(unseal(token,'session'),null);
  assert.equal(unseal(seal(state,'native-auth',Date.now()-1),'native-auth'),null);
  assert.ok(!token.includes('private-session'));
});
test('limiting normalizes accounts, has a fixed window and expires old entries',()=>{
  const limiter=new AuthLimiter();
  assert.ok(limiter.allow('Account:U@example.com',2,1000,0));
  assert.ok(limiter.allow('account:u@example.com',2,1000,100));
  assert.equal(limiter.allow('account:u@example.com',2,1000,900),false);
  assert.ok(limiter.allow('account:u@example.com',2,1000,1000));
});
test('public errors never expose provider internals or distinguish missing accounts',()=>{
  assert.equal(authMessage(new AuthError('NotAuthorizedException')),authMessage(new AuthError('UserNotFoundException')));
  assert.ok(!authMessage(new Error('secret client id')).includes('secret'));
});
