export interface Env { DB: D1Database; GEMINI_API_KEY?: string; AI_MODEL?: string; AUTH_JWT_SECRET?: string; ADMIN_API_KEY?: string; RESEND_API_KEY?: string; EMAIL_FROM?: string; NOWPAYMENTS_API_KEY?: string; NOWPAYMENTS_IPN_SECRET?: string; CLOUDFLARE_ACCOUNT_ID?: string; CLOUDFLARE_STREAM_API_TOKEN?: string; }
export interface DbRow { [key:string]: any }
export interface DbResult { rows: DbRow[]; rowCount:number }
export interface DbClient { query(sql:string, params?:any[]):Promise<DbResult> }
function normalizeSql(sql:string):string {
 return sql.replace(/\$\d+/g,"?").replace(/\bNOW\(\)/gi,"CURRENT_TIMESTAMP").replace(/\s+FOR\s+UPDATE\b/gi,"")
  .replace(/\bbalance\b/g,"available_balance").replace(/\blocked_saldo\b/g,"total_locked");
}
export async function withDb<T>(env:Env, fn:(client:DbClient)=>Promise<T>):Promise<T>{ 
 const client:DbClient={async query(sql,params=[]){
  const s=normalizeSql(sql);
  if(/^\s*(BEGIN|COMMIT|ROLLBACK)\b/i.test(s)) return {rows:[],rowCount:0};
  const stmt=params.length?env.DB.prepare(s).bind(...params):env.DB.prepare(s);
  if(/^\s*(SELECT|WITH|PRAGMA)\b/i.test(s)){const r=await stmt.all();const rows=(r.results??[]) as DbRow[];return {rows,rowCount:rows.length}}
  const r=await stmt.run(); return {rows:((r as any).results??[]) as DbRow[],rowCount:Number((r as any).meta?.changes??0)}
 }};
 return fn(client);
}
export function json(data:unknown,status=200):Response{return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}})}
export async function readJson<T=any>(request:Request):Promise<T>{return await request.json() as T}
