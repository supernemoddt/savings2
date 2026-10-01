import { z } from 'zod';
export const currencies = ['UAH','USD','EUR'] as const;
export type Currency = typeof currencies[number];
export const MAX = 10_000_000_000;
const moneySchema=z.number().int().min(0).max(MAX);
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v);return !isNaN(+d)&&d.toISOString().slice(0,10)===v},'Некоректна дата');
export const jarSchema=z.object({id:z.string().min(1).max(100),name:z.string().trim().min(1).max(60),description:z.string().max(400),goal:moneySchema.positive(),currency:z.enum(currencies),emoji:z.string().min(1).max(16),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),createdAt:z.string().datetime(),targetDate:day.optional(),archived:z.boolean()}).strict();
export const transactionSchema=z.object({id:z.string().min(1).max(100),jarId:z.string().min(1),kind:z.enum(['deposit','withdrawal']),amount:moneySchema.positive(),comment:z.string().max(300),date:day,createdAt:z.string().datetime()}).strict();
export const dataSchema=z.object({version:z.literal(1),jars:z.array(jarSchema).max(1000),transactions:z.array(transactionSchema).max(20000),settings:z.object({currency:z.enum(currencies),theme:z.enum(['system','light','dark'])}).strict()}).strict();
export type Jar=z.infer<typeof jarSchema>;
export type Transaction=z.infer<typeof transactionSchema>;
export type Data=z.infer<typeof dataSchema>;
export const emptyData:Data={version:1,jars:[],transactions:[],settings:{currency:'UAH',theme:'system'}};
export const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function parseMoney(s:string):number{const v=s.trim().replace(',','.');if(!/^\d+(\.\d{1,2})?$/.test(v))throw Error('Вкажіть суму з точністю до двох знаків після коми.');const [a,b='']=v.split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n)||n>MAX)throw Error('Максимальна сума — 100 000 000.');return n}
export function money(n:number,c:Currency){return new Intl.NumberFormat(c==='UAH'?'uk-UA':'en-US',{style:'currency',currency:c,currencyDisplay:'narrowSymbol',minimumFractionDigits:n%100?2:0,maximumFractionDigits:2}).format(n/100)}
export function balance(data:Data,id:string){return data.transactions.filter(t=>t.jarId===id).reduce((s,t)=>s+(t.kind==='deposit'?t.amount:-t.amount),0)}
export function validateData(input:unknown):Data{const d=dataSchema.parse(input);const ids=new Set(d.jars.map(j=>j.id));if(ids.size!==d.jars.length||new Set(d.transactions.map(t=>t.id)).size!==d.transactions.length)throw Error('Повторювані ідентифікатори.');if(d.transactions.some(t=>!ids.has(t.jarId)||t.date>today()))throw Error('Операція має невідому банку або майбутню дату.');if(d.jars.some(j=>balance(d,j.id)<0))throw Error('Баланс банки не може бути від’ємним.');return d}
export function addTransaction(d:Data,t:Transaction){transactionSchema.parse(t);if(!d.jars.some(j=>j.id===t.jarId&&!j.archived))throw Error('Банку не знайдено або вона в архіві.');return validateData({...d,transactions:[...d.transactions,t]})}
export function removeTransaction(d:Data,id:string){const next={...d,transactions:d.transactions.filter(t=>t.id!==id)};if(next.jars.some(j=>balance(next,j.id)<0))throw Error('Це поповнення вже використане. Спочатку видаліть відповідне зняття.');return validateData(next)}
export function currencyTransactions(d:Data,c:Currency){const ids=new Set(d.jars.filter(j=>j.currency===c).map(j=>j.id));return d.transactions.filter(t=>ids.has(t.jarId))}
export function statistics(d:Data,c:Currency){const tx=currencyTransactions(d,c),dep=tx.filter(t=>t.kind==='deposit'),deposited=dep.reduce((s,t)=>s+t.amount,0),withdrawn=tx.filter(t=>t.kind==='withdrawal').reduce((s,t)=>s+t.amount,0);const months:Record<string,number>={};tx.forEach(t=>{const m=t.date.slice(0,7);months[m]=(months[m]||0)+(t.kind==='deposit'?t.amount:-t.amount)});const best=Object.entries(months).sort((a,b)=>b[1]-a[1])[0];return{deposited,withdrawn,count:tx.length,average:dep.length?Math.round(deposited/dep.length):0,monthly:months[today().slice(0,7)]||0,best,months}}
export function forecast(d:Data,j:Jar){const remaining=Math.max(0,j.goal-balance(d,j.id));const days=j.targetDate?Math.max(0,Math.ceil((+new Date(j.targetDate+'T23:59:59')-Date.now())/86400000)):null;const elapsed=Math.max(1,(Date.now()-+new Date(j.createdAt))/86400000);const rate=balance(d,j.id)/Math.max(30,elapsed);return{remaining,days,monthly:days&&remaining?Math.ceil(remaining/(days/30)):null,estimate:rate>0&&remaining?Math.ceil(remaining/rate):null}}
