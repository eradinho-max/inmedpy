import {ORIGIN,loadCatalog,activeProducts,htmlEscape as e,productPath,priceOf,description,validProductImage,money,categoryName,jsonLd} from '../lib/inmed-seo.js';

const send=(res,code,html,cache='no-store')=>{
 res.statusCode=code;
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control',cache);
 res.setHeader('X-Content-Type-Options','nosniff');
 res.end(html);
};
const simple=(title,message)=>'<!doctype html><html lang="es-PY"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(title)+' | INMED</title></head><body style="font:16px system-ui;max-width:720px;margin:10vh auto;padding:20px;color:#161B26"><h1>'+e(title)+'</h1><p>'+e(message)+'</p><a href="/">Volver al catálogo</a></body></html>';
export default async function handler(req,res){
 if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return send(res,405,'Método no permitido')}
 const input=String(req.query?.slug||'');
 if(input.length>230||!input.includes('--'))return send(res,404,simple('Producto no encontrado','Consulta el catálogo actualizado.'));
 const encodedId=input.slice(input.lastIndexOf('--')+2);
 let id;
 try{id=decodeURIComponent(encodedId)}catch{return send(res,404,simple('Producto no encontrado','Consulta el catálogo actualizado.'))}
 if(!id||id.length>100)return send(res,404,simple('Producto no encontrado','Consulta el catálogo actualizado.'));
 let row;
 try{row=await loadCatalog()}catch(error){console.error('Product SEO catalog load failed:',error.message);res.setHeader('Retry-After','60');return send(res,503,simple('Servicio temporalmente no disponible','Intenta nuevamente en unos momentos.'))}
 const data=row.data,p=activeProducts(data).find(x=>x.id===id);
 if(!p)return send(res,404,simple('Producto no disponible','Este producto no figura en el catálogo público.'));
 const canonical=ORIGIN+productPath(p);
 if('/producto/'+input!==productPath(p)){
  res.writeHead(308,{Location:canonical,'Cache-Control':'no-store'});return res.end();
 }
 const name=String(p.name),cat=categoryName(data,p.cat),desc=description(p);
 const synopsis=String(p.short||desc).replace(/\s+/g,' ').slice(0,158)||'Equipamiento médico en Paraguay. Comprá con INMED por WhatsApp.';
 const price=priceOf(data,p),regular=Number(p.price),stock=Math.max(0,Math.floor(Number(p.stock)||0));
 const photo=validProductImage(p),images=[p.img,...(Array.isArray(p.imgs)?p.imgs:[])].filter(x=>{try{return new URL(x).protocol==='https:'}catch{return false}}).slice(0,5);
 const seoTitle=(name+' | INMED Paraguay').slice(0,120);
 const sku=String(p.sku||'').trim();
 const whatsapp=String(data.settings?.whatsapp||'').replace(/\D/g,'');
 const waUrl=/^\d{8,15}$/.test(whatsapp)?'https://wa.me/'+whatsapp+'?text='+encodeURIComponent('Hola INMED, quisiera consultar disponibilidad y compra de '+name+(sku?' (SKU: '+sku+')':'')+'. Precio publicado: Gs. '+money(price??0)+'.'):null;
 const cartUrl='/?producto='+encodeURIComponent(id)+'#productos';
 const ld={'@context':'https://schema.org','@type':'Product',name,description:desc||synopsis,url:canonical,...(photo?{image:images}:{}),...(sku?{sku}:{}),offers:{'@type':'Offer',url:canonical,priceCurrency:'PYG',price:price??regular,availability:stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock',seller:{'@type':'Organization',name:'INMED Soluciones Médicas',url:ORIGIN}}};
 const paragraphs=String(p.desc||p.short||'').trim()||synopsis;
 const imageHtml=photo?'<img src="'+e(photo)+'" width="680" height="680" alt="'+e(name)+'" fetchpriority="high">':'<div class="placeholder">INMED</div>';
 const thumbnails=images.length>1?'<div class="thumbnails">'+images.map((x,i)=>'<img src="'+e(x)+'" alt="'+e(name)+' - Vista '+(i+1)+'" loading="lazy">').join('')+'</div>':'';
 const html=`<!doctype html>
<html lang="es-PY"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(seoTitle)}</title>
<meta name="description" content="${e(synopsis)}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${e(canonical)}"><link rel="icon" href="/assets/inmed-icon.svg" type="image/svg+xml"><meta name="theme-color" content="#B5001B">
<meta property="og:type" content="product"><meta property="og:locale" content="es_PY"><meta property="og:site_name" content="INMED Soluciones Médicas"><meta property="og:title" content="${e(seoTitle)}">
<meta property="og:description" content="${e(synopsis)}"><meta property="og:url" content="${e(canonical)}">
${photo?'<meta property="og:image" content="'+e(photo)+'">':''}
<meta name="twitter:card" content="${photo?'summary_large_image':'summary'}">
<script type="application/ld+json">${jsonLd(ld)}</script>
<style>
:root{--red:#B5001B;--wine:#7D010E;--ink:#161B26;--line:#E3E7EE;--muted:#64748B}*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--ink);font:16px/1.55 system-ui,-apple-system,'Segoe UI',sans-serif}a{color:inherit;text-decoration:none}
header{border-bottom:1px solid var(--line);background:#fff}.head{max-width:1180px;margin:auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}.logo{width:192px;height:auto;max-width:45vw}.home{font-size:14px;font-weight:650;color:var(--red)}
main{max-width:1180px;margin:0 auto;padding:30px 24px 90px}.crumb{font-size:13px;color:var(--muted);margin-bottom:28px}.crumb a:hover{text-decoration:underline}
.product{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:45px;align-items:start}
.photo{border:1px solid var(--line);border-radius:22px;padding:20px;display:flex;justify-content:center;align-items:center;min-height:420px;background:#fff}.photo img{display:block;max-width:100%;max-height:560px;width:auto;height:auto;object-fit:contain}.placeholder{font-size:38px;color:var(--red);font-weight:850}
.thumbnails{display:flex;gap:12px;flex-wrap:wrap;margin:14px 0}.thumbnails img{width:80px;height:80px;border:1px solid var(--line);border-radius:10px;object-fit:contain}
.tag{display:inline-block;font-size:12px;letter-spacing:.09em;font-weight:800;color:var(--red);text-transform:uppercase;margin-bottom:12px}
h1{font-size:clamp(29px,3.5vw,43px);line-height:1.13;letter-spacing:-.025em;margin:0 0 15px;overflow-wrap:anywhere}p{margin:0 0 17px}.muted{color:var(--muted)}
.price{font-size:38px;font-weight:850;line-height:1.2;letter-spacing:-.03em;margin:19px 0 9px}.price small{font-size:17px}.old{color:var(--muted);text-decoration:line-through;font-size:16px;margin:2px 0}.availability{margin:18px 0 24px;font-weight:700;color:#047857}.availability.out{color:#b45309}.actions{display:flex;flex-wrap:wrap;gap:10px}.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;padding:13px 20px;font-weight:750;border:1px solid var(--red);font-size:14px}.primary{background:var(--red);color:white}.secondary{background:#fff;color:var(--red)}.btn:hover{filter:brightness(.94)}
.details{margin-top:40px;border-top:1px solid var(--line);padding-top:25px;max-width:1000px}.details h2{font-size:23px;margin:0 0 12px}.description{white-space:pre-line;overflow-wrap:anywhere}.shipping{margin-top:25px;color:var(--muted);font-size:14px}
footer{background:#161B26;color:#fff;padding:35px 24px;text-align:center;font-size:13px}
@media(max-width:780px){.product{grid-template-columns:1fr;gap:24px}.photo{min-height:280px}.head{padding:15px 18px}main{padding:25px 18px 65px}.price{font-size:32px}}
</style></head><body>
<header><div class="head"><a href="/" aria-label="INMED inicio"><img class="logo" src="/assets/inmed-logo-vermelho.svg" alt="INMED"></a><a class="home" href="/#productos">Ver todos los productos</a></div></header>
<main><nav class="crumb" aria-label="Ubicación"><a href="/">Inicio</a> › <a href="/#productos">${e(cat)}</a> › ${e(name)}</nav>
<div class="product"><div><div class="photo">${imageHtml}</div>${thumbnails}</div>
<div><span class="tag">${e(cat)}</span><h1>${e(name)}</h1>${sku?'<p class="muted">SKU: '+e(sku)+'</p>':''}
${price!==null?'<div class="price"><small>Gs.</small> '+money(price)+'</div>':''}
${price!==null&&regular>price?'<div class="old">Antes: Gs. '+money(regular)+'</div>':''}
<p class="availability ${stock>0?'':'out'}">${stock>0?'Disponible · '+stock+' unidades':'Agotado · consultar disponibilidad'}</p>
<div class="actions"><a class="btn primary" href="${e(cartUrl)}">Ver en la tienda</a>${waUrl?'<a class="btn secondary" target="_blank" rel="noopener noreferrer" href="'+e(waUrl)+'">Consultar por WhatsApp</a>':''}</div>
<p class="shipping">Envíos a todo Paraguay. Confirmamos costos y plazos antes de cerrar el pedido.</p>
</div></div><section class="details"><h2>Características del producto</h2><p class="description">${e(paragraphs)}</p></section>
</main><footer>INMED · Soluciones Médicas · Paraguay</footer></body></html>`;
 return send(res,200,html,'public, max-age=0, s-maxage=120, stale-while-revalidate=300');
}
