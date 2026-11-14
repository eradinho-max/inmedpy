// SEO helpers for public storefront only. The public Supabase key obeys RLS.
// No privileged key or admin endpoint is used here.
const SUPABASE_URL="https://qozaarjaqonggtktqtxh.supabase.co";
const PUBLISHABLE_KEY=process.env.INMED_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_UYguGlcQF7sfhU4mtiidvQ_L5gxiWqK";
export const ORIGIN='https://inmedpy.vercel.app';
export const xmlEscape=s=>String(s??'').replace(/[<>&"'\u0000-\u001f]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]||''));
export const htmlEscape=s=>String(s??'').replace(/[&<>"'\u0000-\u001f]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||''));
export const slugify=s=>String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,92)||'producto';
export function productPath(p){return '/producto/'+slugify(p.name)+'--'+encodeURIComponent(String(p.id))}
export const activeProducts=data=>(Array.isArray(data?.products)?data.products:[]).filter(p=>p&&p.active!==false&&typeof p.id==='string'&&p.id.length<100&&p.name);
export function categoryName(data,id){return data.categories?.find(c=>c.id===id)?.name||id||'Equipamiento médico'}
export function priceOf(data,p){
 const base=Number(p.price),valid=Number.isFinite(base)&&base>=0;
 if(!valid)return null;
 const values=[base],today=new Date().toISOString().slice(0,10);
 const promotion=(data.promotions||[]).find(pr=>pr?.active&&Array.isArray(pr.productIds)&&pr.productIds.includes(p.id)&&(!pr.start||pr.start<=today)&&(!pr.end||pr.end>=today));
 const pct=Number(promotion?.percent);
 if(promotion&&pct>0&&pct<=100)values.push(Math.round(base*(1-pct/100)));
 if(p.promo!=null&&Number.isFinite(Number(p.promo))&&Number(p.promo)>=0&&Number(p.promo)<base)values.push(Number(p.promo));
 return Math.min(...values);
}
export function description(p){return String(p.desc||p.short||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
export function validProductImage(p){
 const v=String(p.img||'').trim();
 try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?v:null}catch{return null}
}
export const money=n=>Number(n).toLocaleString('es-PY',{maximumFractionDigits:0});
export async function loadCatalog(){
 const response=await fetch(SUPABASE_URL+'/rest/v1/store_state?id=eq.main&select=data,updated_at',{
  headers:{apikey:PUBLISHABLE_KEY,Accept:'application/json'},
  signal:AbortSignal.timeout(8000)
 });
 if(!response.ok)throw Error('Public catalog unavailable: '+response.status);
 const rows=await response.json();
 if(!Array.isArray(rows)||!rows[0]?.data?.products)throw Error('Public catalog missing');
 return rows[0];
}
export function jsonLd(value){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')}
