import {ORIGIN,loadCatalog,activeProducts,activeCategories,productPath,categoryPath} from '../lib/inmed-seo.js';
// IndexNow verification key is deliberately public. Write access requires a valid admin session.
const key='7a94636df26baa450d8541fe984a2dbb';
const supabase="https://qozaarjaqonggtktqtxh.supabase.co",publishable=process.env.INMED_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_UYguGlcQF7sfhU4mtiidvQ_L5gxiWqK";
const send=(res,status,body)=>{res.statusCode=status;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body))};
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no permitido'})}
 const auth=String(req.headers.authorization||'');
 if(!/^Bearer [A-Za-z0-9._-]{20,4096}$/.test(auth))return send(res,401,{error:'Inicia sesión'});
 const headers={apikey:publishable,Authorization:auth,Accept:'application/json'};
 try{
  const authRes=await fetch(supabase+'/auth/v1/user',{headers,signal:AbortSignal.timeout(5000)});
  if(!authRes.ok)return send(res,401,{error:'Sesión inválida'});
  const user=await authRes.json();
  const member=await fetch(supabase+'/rest/v1/store_admins?user_id=eq.'+encodeURIComponent(user.id)+'&select=user_id',{headers,signal:AbortSignal.timeout(5000)});
  if(!member.ok||!(await member.json()).some(x=>x.user_id===user.id))return send(res,403,{error:'Acceso restringido'});
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  const row=await loadCatalog(),data=row.data;
  const current=['/','/sobre-suprimed','/categorias','/politicas/envios','/politicas/devoluciones','/politicas/privacidad','/politicas/terminos','/politicas/garantia',...activeCategories(data).map(categoryPath),...activeProducts(data).map(productPath)];
  const requested=Array.isArray(body.paths)?body.paths:[];
  // Accept only same-host canonical paths (including removed/renamed products/categories).
  const safe=p=>typeof p==='string'&&p.length<=250&&(current.includes(p)||/^\/categoria\/[a-z0-9-]+$/.test(p)||/^\/producto\/[a-z0-9-]+--[a-zA-Z0-9_%.-]+$/.test(p));
  const selected=body.all===true?current:requested.filter(safe);
  const urls=[...new Set(selected)].slice(0,500).map(p=>ORIGIN+p);
  if(!urls.length)return send(res,200,{status:0,count:0,message:'Sin cambios públicos'});
  const reply=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:'suprimedpy.vercel.app',key,keyLocation:ORIGIN+'/'+key+'.txt',urlList:urls}),signal:AbortSignal.timeout(10000)});
  return send(res,reply.status===200||reply.status===202?200:502,{status:reply.status,count:urls.length,message:reply.status===200?'URLs recibidas':reply.status===202?'Recibidas; verificación pendiente':'IndexNow no confirmó la recepción'});
 }catch(err){return send(res,503,{error:'No se pudo notificar a IndexNow. El catálogo ya guardado no se modifica.'})}
}
