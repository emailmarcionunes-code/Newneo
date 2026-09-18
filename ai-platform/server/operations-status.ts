import {readFile} from 'node:fs/promises';
export type OperationsStatus={checkedAt:string;app:string;database:string;proxy:string;backup:string;backupAt:string|null;freeDiskBytes:number;state:'healthy'|'attention'};
export function parseOperationsStatus(value:unknown,now=Date.now()):OperationsStatus|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(typeof v.checkedAt!=='string'||!Number.isFinite(Date.parse(v.checkedAt))||Date.parse(v.checkedAt)>now+60000||now-Date.parse(v.checkedAt)>15*60*1000)return null;
 if(!['healthy','unhealthy','starting','missing'].includes(String(v.app))||!['healthy','unhealthy','starting','missing'].includes(String(v.database))||!['running','not-running'].includes(String(v.proxy))||!['fresh','stale','missing','failed','unknown'].includes(String(v.backup))||typeof v.freeDiskBytes!=='number'||!Number.isSafeInteger(v.freeDiskBytes)||v.freeDiskBytes<0)return null;
 if(v.backupAt!==null&&(typeof v.backupAt!=='string'||!Number.isFinite(Date.parse(v.backupAt))||Date.parse(v.backupAt)>now+60000))return null;
 const backup=v.backupAt===null?'missing':now-Date.parse(v.backupAt as string)>30*3600000?'stale':String(v.backup);
 return {checkedAt:v.checkedAt,app:String(v.app),database:String(v.database),proxy:String(v.proxy),backup,backupAt:v.backupAt as string|null,freeDiskBytes:v.freeDiskBytes,state:v.app==='healthy'&&v.database==='healthy'&&v.proxy==='running'&&backup==='fresh'&&v.freeDiskBytes>=4*1024**3?'healthy':'attention'};
}
export async function readOperationsStatus(){try{const raw=await readFile('/run/newneo-operations/status.json','utf8');if(raw.length>4096)return null;return parseOperationsStatus(JSON.parse(raw))}catch{return null}}
