import {ORIGIN,loadCatalog,activeProducts,productPath,xmlEscape} from '../lib/inmed-seo.js';
export default async function handler(req,res){
 if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');res.status(405).end('Method not allowed');return}
 try{
  const row=await loadCatalog();
  const date=new Date(row.updated_at||Date.now());
  const lastmod=Number.isFinite(date.getTime())?date.toISOString().slice(0,10):null;
  const pages=[ORIGIN+'/',...activeProducts(row.data).map(p=>ORIGIN+productPath(p))];
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
    pages.map(url=>'  <url><loc>'+xmlEscape(url)+'</loc>'+(lastmod?'<lastmod>'+lastmod+'</lastmod>':'')+'</url>').join('\n')+
    '\n</urlset>\n';
  res.setHeader('Content-Type','application/xml; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=120, stale-while-revalidate=300');
  res.status(200).end(xml);
 }catch(error){
  console.error('Public sitemap failed:',error.message);
  res.setHeader('Retry-After','60');
  res.setHeader('Cache-Control','no-store');
  res.status(503).end('Temporarily unavailable');
 }
}
