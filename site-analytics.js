/* InMed lightweight attribution + event layer.
   Works standalone and also forwards events to dataLayer/gtag when a tag manager is added later. */
(function(){
  'use strict';
  const ATTR_KEY='inmed_attribution_v1';
  const KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  window.dataLayer=window.dataLayer||[];

  function readAttribution(){
    try{return JSON.parse(sessionStorage.getItem(ATTR_KEY)||'{}')}catch(_){return {}}
  }
  function captureAttribution(){
    const q=new URLSearchParams(location.search); const current=readAttribution(); let changed=false;
    KEYS.forEach(k=>{if(q.get(k)){const v=q.get(k).slice(0,100);if(/^[a-zA-Z0-9_. -]+$/.test(v)){current[k]=v;changed=true}}});
    if(!current.landing_page){current.landing_page=location.pathname;changed=true}
    if(!current.referrer && document.referrer){try{current.referrer=new URL(document.referrer).origin;changed=true}catch(_){}}
    if(changed){try{sessionStorage.setItem(ATTR_KEY,JSON.stringify(current))}catch(_){}}
    return current;
  }
  function track(event,params){
    const attr=readAttribution();
    const enriched=Object.assign({
      page_path:location.pathname,
      page_title:document.title,
      utm_source:attr.utm_source||'',
      utm_medium:attr.utm_medium||'',
      utm_campaign:attr.utm_campaign||'',
      utm_content:attr.utm_content||'',
      utm_term:attr.utm_term||'',
      landing_page:attr.landing_page||'',
      original_referrer:attr.referrer||''
    },params||{});
    const payload=Object.assign({event:event},enriched);
    if(typeof window.gtag==='function') window.gtag('event',event,enriched);else window.dataLayer.push(payload);
    document.dispatchEvent(new CustomEvent('inmed:track',{detail:payload}));
  }
  function enrichWhatsApp(link){
    try{
      const url=new URL(link.href); if(url.hostname!=='wa.me') return;
      const attr=readAttribution(); const origin=[attr.utm_source,attr.utm_campaign].filter(Boolean).join(' / ');
      if(!origin) return;
      const base=url.searchParams.get('text')||'';
      if(!base.includes('Origen:')) url.searchParams.set('text',base+'\n\nOrigen: '+origin);
      link.href=url.toString();
    }catch(_){ }
  }
  const attr=captureAttribution();
  window.InMedTracking={track:track,getAttribution:readAttribution,captureAttribution:captureAttribution};
  track('page_view_custom',{utm_source:attr.utm_source||'',utm_campaign:attr.utm_campaign||''});

  document.addEventListener('click',function(e){
    const link=e.target.closest('a,button'); if(!link) return;
    const label=link.dataset.track;
    if(link.dataset.waDirect==='true'){
      track('whatsapp_click',{cta_source:'product_page'});
    } else if(link.matches('[data-wa="true"]')){
      enrichWhatsApp(link);
      track('whatsapp_click',{cta_source:link.dataset.waSource||label||'unknown',link_text:(link.textContent||'').trim().slice(0,80)});
    } else if(label){ track('cta_click',{cta:label,link_text:(link.textContent||'').trim().slice(0,80)}); }
  },true);

  const marks=new Set();
  addEventListener('scroll',function(){
    const max=document.documentElement.scrollHeight-innerHeight; if(max<=0)return;
    const pct=Math.round(scrollY/max*100);
    [25,50,75,90].forEach(m=>{if(pct>=m&&!marks.has(m)){marks.add(m);track('scroll_depth',{percent:m})}});
  },{passive:true});

  document.querySelectorAll('video').forEach(function(v){
    let played=false;
    v.addEventListener('play',function(){if(!played){played=true;track('video_start',{video_id:v.id||'video'})}});
    v.addEventListener('ended',function(){track('video_complete',{video_id:v.id||'video'})});
  });
})();
