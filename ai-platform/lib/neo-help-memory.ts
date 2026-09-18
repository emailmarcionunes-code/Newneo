export type NeoExchange={id:number;question:string;answer:string;topic?:string};
export const neoDay=(now=new Date())=>`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
export function readNeoMemory(raw:string|null,day:string):NeoExchange[]{
 try{const value=JSON.parse(raw??'null');if(value?.day!==day||!Array.isArray(value.exchanges))return [];return value.exchanges.filter((x:NeoExchange)=>typeof x?.id==='number'&&typeof x.question==='string'&&typeof x.answer==='string'&&x.question.length<=1500&&x.answer.length<=6000&&(x.topic===undefined||typeof x.topic==='string')).slice(-20)}catch{return []}
}
export const nextNeoMidnight=(now=new Date())=>new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime()-now.getTime();
