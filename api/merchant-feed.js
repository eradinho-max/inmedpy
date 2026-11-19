import {ORIGIN,loadCatalog,activeProducts,productPath,priceOf,description,validProductImage,brandOf,verifiedGtin,categoryName,xmlEscape as e} from '../lib/inmed-seo.js';
// Preview only: do not submit to Merchant Center until checkout, shipping, business identity and regulatory requirements are confirmed.
export default async function handler(req,res){
 res.setHeader('X-Robots-Tag','noindex, noarchive');
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return res.status(405).end('Método no permitido')}
 try{
  const {data}=await loadCatalog();
  const tag=(k,v)=>'<g:'+k+'>'+e(v)+'</g:'+k+'>';
  const items=activeProducts(data).flatMap(p=>{
   const price=priceOf(data,p),image=validProductImage(p),desc=description(p);
   // Separate sellable variant offers need separate landing pages. The existing BIC listings are already individual products.
   if(!image||!desc||price===null||price<=0||p.id.length>50||(p.cat!=='Estetoscopios'&&Array.isArray(p.variants)&&p.variants.length))return [];
   const brand=brandOf(p),gtin=verifiedGtin(p),mpn=String(p.specs?.MPN||'').trim(),condition=String(p.specs?.Condicion||'').trim();
   const images=[...new Set((Array.isArray(p.imgs)?p.imgs:[]).map(img=>validProductImage({img})).filter(x=>x&&x!==image))].slice(0,4);
   const stock=(Number(p.stock)||0)>0;
   return ['<item>'+tag('id',p.id)+tag('title',String(p.name).trim().slice(0,150))+tag('description',desc.slice(0,5000))+tag('link',ORIGIN+productPath(p))+tag('image_link',image)+images.map(x=>tag('additional_image_link',x)).join('')+tag('availability',stock?'in_stock':'out_of_stock')+tag('price',String(price)+' PYG')+tag('product_type',categoryName(data,p.cat))+(brand?tag('brand',brand):'')+(gtin?tag('gtin',gtin):'')+(mpn?tag('mpn',mpn):'')+(['new','used','refurbished'].includes(condition)?tag('condition',condition):'')+'</item>'];
  });
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>SupriMed Paraguay - catálogo preliminar</title><link>'+ORIGIN+'/</link><description>Vista previa para revisión comercial; no constituye aprobación de Google.</description>'+items.join('\n')+'</channel></rss>';
  res.setHeader('Content-Type','application/xml; charset=utf-8');return res.status(200).end(xml);
 }catch(_){res.setHeader('Retry-After','60');return res.status(503).end('Catálogo temporalmente indisponible')}
}
