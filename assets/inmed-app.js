/* ==========================================================================
   INMED · TIENDA + PANEL ADMIN (V1 funcional, datos locales)
   ========================================================================== */
(function(){
'use strict';
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.prototype.slice.call(r.querySelectorAll(s));
const IMG = window.IMAGES || {};
const safeImageURL = value => {
  const v=String(value||'').trim();
  // Photo URLs are interpolated into HTML attributes; reject markup delimiters
  // and control characters before they ever reach an image element.
  if(!v || /[<>"'`\\\x00-\x1f\x7f]/.test(v))return '';
  if(/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(v))return v;
  if(/^https:\/\//i.test(v)){
    try{const url=new URL(v);return url.protocol==='https:'&&url.username===''&&url.password===''?v:''}catch(_){return ''}
  }
  return '';
};
const img = k => {
  const v=String(k||'');
  const source=/^https?:\/\//i.test(v)||/^data:image\//i.test(v)?v:(IMG[v]||IMG['bic-rosa']||'');
  return safeImageURL(source);
};
const esc = s => String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Permit only the intentional decorative tags in merchant-editable banners.
const safeRich = (value,tags=['em','b']) => {
  let html=esc(value);
  for(const tag of tags){const re=new RegExp('&lt;(/?)'+tag+'&gt;','gi');html=html.replace(re,(_m,slash)=>'<'+slash+tag+'>');}
  return html;
};
const gs  = n => 'Gs. '+Math.round(Number(n)||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const norm= s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const slug= s => norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const uid = () => 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const ic  = (n,style='') => `<svg class="ic" ${style?`style="${style}"`:''}><use href="#i-${n}"/></svg>`;

/* ---------- almacenamiento seguro (iframe sandbox -> memoria) ---------- */
const mem = {};
const ST = {
  get(k){ try{return localStorage.getItem(k);}catch(e){return mem[k]||null;} },
  set(k,v){ try{localStorage.setItem(k,v);}catch(e){mem[k]=v;} },
  del(k){ try{localStorage.removeItem(k);}catch(e){delete mem[k];} }
};

/* ---------- datos demo ---------- */
const DEFAULT = () => ({
  settings:{
    storeName:'InMed', whatsapp:'595981000000', email:'hola@inmed.com.py', phone:'+595 981 000-000',
    freeShipMin:300000, footer:'Equipamiento médico para estudiantes, profesionales y cuidado en casa. Productos originales, asesoría real y envíos a todo Paraguay.',
    copy:'© 2026 InMed Soluciones Médicas · Asunción, Paraguay'
  },
  banners:{
    showAnnouncement:true, announcement:'<b>5% OFF</b> en tu primera compra con el cupón <b>INMED5</b>',
    heroTitle:'EQUIPÁ TU PRÁCTICA CON PRODUCTOS QUE <em>HACEN LA DIFERENCIA.</em>',
    heroSub:'Equipamiento médico para estudiantes, profesionales y cuidado en casa.',
    showHeroBadge:true, heroBadge:'<span>15%</span>OFF',
    showOffer:true, offerTitle:'SEMANA INMED · 15% OFF', offerText:'En estetoscopios, kits de sutura y diagnóstico. Precios especiales por tiempo limitado, sin editar una sola línea de código.',
    offerEnd:'2026-11-10T23:59:59',
    newsText:'Guías prácticas, novedades del catálogo y una selección de ofertas. Un correo por semana, sin ruido.'
  },
  categories:[
    {id:'Sutura',           name:'Kits de Sutura',    img:'sutura',      desc:'Práctica y entrenamiento'},
    {id:'Estetoscopios',    name:'Estetoscopios',     img:'bic-rosa',    desc:'BIC, cardiology y más'},
    {id:'Presión arterial', name:'Presión Arterial',  img:'esfigmo',     desc:'Aneroides y digitales'},
    {id:'Oxímetros',        name:'Oxímetros',         img:'oximetro',    desc:'SpO2 y pulso'},
    {id:'Termómetros',      name:'Termómetros',       img:'termometro',  desc:'Digitales e infrarrojos'},
    {id:'Glucómetros',      name:'Glucómetros',       img:'glucometro',  desc:'Control de glucosa'}
  ],
  products:[
    {id:'p1',name:'Kit de Sutura InMed — 19 piezas',cat:'Sutura',short:'Pad de silicona, instrumental y 12 hilos.',desc:'Kit completo para práctica de sutura: almohadilla de silicona con heridas predefinidas, portaagujas, pinza, tijera, bisturí y hilos de entrenamiento en estuche rígido con cierre.',price:279000,promo:249000,stock:24,sku:'KIT-SUT-19',img:'sutura',rating:4.9,reviews:38,active:true,freeShip:true,featured:true,tags:['MÁS VENDIDO'],
      features:['19 piezas organizadas en estuche','Pad de silicona reutilizable de 3 capas','Instrumental de acero inoxidable','Hilos de nylon, seda y poliéster','Ideal para estudiantes y residentes'],includes:['1 almohadilla de sutura','1 portaagujas + 1 pinza','1 tijera quirúrgica + 1 bisturí','12 hilos con aguja','Estuche con cierre y manual'],specs:{Piezas:'19',Material:'Acero inoxidable / silicona',Nivel:'Estudiante y residente',SKU:'KIT-SUT-19'}},
    {id:'p2',name:'Estetoscopio BIC Eternity III',cat:'Estetoscopios',short:'Doble campana, acero inoxidable. 5 colores.',desc:'El clásico BIC Eternity III con doble campana de acero inoxidable, tubo de PVC flexible y olivas suaves. Disponible en cinco combinaciones de color con terminación Rainbow.',price:329000,promo:289000,stock:18,sku:'BIC-ET3',img:'bic-rosa',rating:4.9,reviews:52,active:true,freeShip:true,featured:true,tags:['MÁS VENDIDO'],
      features:['Doble campana adulto / pediátrico','Acero inoxidable pulido','Tubo flexible de doble lumen','Olivas suaves intercambiables','Incluye estuche y accesorios'],includes:['Estetoscopio BIC Eternity III','Par de olivas de repuesto','Diafragmas de repuesto','Estuche protector'],specs:{Modelo:'Eternity III',Campana:'Doble, acero inoxidable',Tubo:'PVC doble lumen',Garantía:'12 meses',SKU:'BIC-ET3'},
      variants:[
        {name:'Rosa / Rainbow',color:'#E8A0B8',img:'bic-rosa',price:289000,stock:4,sku:'BIC-ET3-RO'},
        {name:'Total Black',color:'#20242B',img:'bic-black',price:279000,stock:7,sku:'BIC-ET3-BK'},
        {name:'Vino / Rainbow',color:'#7A1F33',img:'bic-vino',price:299000,stock:2,sku:'BIC-ET3-VI'},
        {name:'Azul / Black',color:'#1E4FA1',img:'bic-azul',price:289000,stock:5,sku:'BIC-ET3-AZ'},
        {name:'Gold / Rainbow',color:'linear-gradient(135deg,#D9B25C,#7A4BD0)',img:'bic-gold',price:319000,stock:3,sku:'BIC-ET3-GD'}
      ]},
    {id:'p3',name:'Oxímetro Fingertip Digital',cat:'Oxímetros',short:'SpO2 y pulso con display OLED.',desc:'Oxímetro de dedo compacto con pantalla OLED, lectura de saturación de oxígeno y frecuencia de pulso en segundos. Apagado automático y correa incluida.',price:129000,promo:99000,stock:2,sku:'OXI-FT01',img:'oximetro',rating:4.8,reviews:27,active:true,freeShip:false,featured:true,tags:['OFERTA'],
      features:['Lectura de SpO2 y pulso en 5 segundos','Display OLED de alto contraste','Apagado automático','Correa y pilas incluidas'],includes:['Oxímetro','Correa','2 pilas AAA','Manual'],specs:{'Rango SpO2':'70–99%',Pulso:'30–250 bpm',Pantalla:'OLED',SKU:'OXI-FT01'}},
    {id:'p4',name:'Esfigmomanómetro Aneroide Pro',cat:'Presión arterial',short:'Brazalete adulto + estuche.',desc:'Esfigmomanómetro aneroide de precisión con manómetro de aguja, brazalete de nailon ajustable, pera de goma y válvula de liberación. Ideal para consultorio.',price:245000,promo:null,stock:12,sku:'ESF-AN01',img:'esfigmo',rating:4.7,reviews:19,active:true,freeShip:true,featured:true,tags:[],
      features:['Manómetro aneroide de alta precisión','Brazalete adulto ajustable','Pera y válvula de metal','Estuche de transporte'],includes:['Manómetro + brazalete','Pera de insuflado','Estuche'],specs:{Rango:'0–300 mmHg',Precisión:'±3 mmHg',Brazalete:'Adulto 22–32 cm',SKU:'ESF-AN01'}},
    {id:'p5',name:'Termómetro Digital Clínico',cat:'Termómetros',short:'Lectura rápida, punta flexible.',desc:'Termómetro digital de uso clínico y domiciliario, con punta flexible, lectura en 30 segundos, memoria de la última medición y alerta de fiebre.',price:39000,promo:null,stock:46,sku:'TER-DG01',img:'termometro',rating:4.8,reviews:41,active:true,freeShip:false,featured:true,tags:[],
      features:['Lectura en 30 segundos','Punta flexible','Memoria de última medición','Apagado automático'],includes:['Termómetro','Estuche protector','Manual'],specs:{Rango:'32–42,9 °C',Precisión:'±0,1 °C',Batería:'LR41',SKU:'TER-DG01'}},
    {id:'p6',name:'Glucómetro + 50 Tiras',cat:'Glucómetros',short:'Kit completo para control de glucosa.',desc:'Kit de glucometría con medidor digital, 50 tiras reactivas, lancetas y dispositivo de punción. Resultados en 5 segundos con memoria de 500 registros.',price:219000,promo:189000,stock:9,sku:'GLU-KT50',img:'glucometro',rating:4.7,reviews:16,active:true,freeShip:true,featured:true,tags:['OFERTA'],
      features:['Resultado en 5 segundos','Memoria de 500 mediciones','50 tiras y lancetas incluidas','Pantalla amplia retroiluminada'],includes:['Glucómetro','50 tiras reactivas','Lancetero + lancetas','Estuche'],specs:{Muestra:'0,5 µL',Memoria:'500 registros',Tiras:'50 unidades',SKU:'GLU-KT50'}},
    {id:'p7',name:'Estetoscopio Cardiology InMed Pro',cat:'Estetoscopios',short:'Acabado gold / rainbow, alta sensibilidad.',desc:'Estetoscopio de línea premium con campana de acero inoxidable con terminación Rainbow, tubo negro de doble lumen y olivas de silicona. Para auscultación exigente.',price:359000,promo:null,stock:7,sku:'EST-PRO-GD',img:'bic-gold',rating:5.0,reviews:11,active:true,freeShip:true,featured:true,tags:['NUEVO'],
      features:['Campana Rainbow de alta sensibilidad','Tubo doble lumen','Olivas de silicona hipoalergénicas','Incluye estuche rígido'],includes:['Estetoscopio','Olivas de repuesto','Estuche rígido'],specs:{Campana:'Acero inoxidable Rainbow',Tubo:'Doble lumen',Garantía:'24 meses',SKU:'EST-PRO-GD'}},
    {id:'p8',name:'Kit de Sutura Avanzado — 32 piezas',cat:'Sutura',short:'Más hilos, más instrumentos, más práctica.',desc:'Versión ampliada del kit de sutura con 32 piezas, pad de tres capas, instrumental adicional y mayor variedad de hilos para entrenamiento avanzado de nudos y técnicas.',price:349000,promo:null,stock:14,sku:'KIT-SUT-32',img:'sutura',rating:4.8,reviews:23,active:true,freeShip:true,featured:false,tags:[],
      features:['32 piezas','Pad de silicona de 3 capas','Mayor variedad de hilos','Instrumental adicional'],includes:['Estuche completo','Pad de sutura','Instrumental','Hilos y agujas'],specs:{Piezas:'32',Nivel:'Avanzado',SKU:'KIT-SUT-32'}},
    {id:'p9',name:'Monitor de Presión Digital',cat:'Presión arterial',short:'Pantalla amplia, detección de arritmia.',desc:'Monitor digital de presión arterial de brazo con pantalla amplia, detección de latido irregular, memoria para 2 usuarios y brazalete universal.',price:289000,promo:259000,stock:6,sku:'ESF-DG02',img:'esfigmo',rating:4.6,reviews:14,active:true,freeShip:true,featured:false,tags:['OFERTA'],
      features:['Pantalla LCD amplia','Memoria 2 × 120 lecturas','Detección de arritmia','Brazalete universal'],includes:['Monitor','Brazalete','4 pilas AA','Manual'],specs:{Método:'Oscilométrico',Memoria:'240 lecturas',Brazalete:'22–42 cm',SKU:'ESF-DG02'}},
    {id:'p10',name:'Oxímetro Profesional OLED',cat:'Oxímetros',short:'Pletismografía y alarmas configurables.',desc:'Oxímetro profesional con display OLED giratorio, pletismograma, alarmas de SpO2 y pulso configurables, y batería recargable.',price:159000,promo:null,stock:11,sku:'OXI-PR02',img:'oximetro',rating:4.9,reviews:9,active:true,freeShip:false,featured:false,tags:[],
      features:['Pletismograma en pantalla','Alarmas configurables','Batería recargable USB-C','4 direcciones de lectura'],includes:['Oxímetro','Cable USB-C','Correa','Manual'],specs:{'Rango SpO2':'70–100%',Batería:'Recargable',Pantalla:'OLED giratoria',SKU:'OXI-PR02'}},
    {id:'p11',name:'Termómetro Infrarrojo Sin Contacto',cat:'Termómetros',short:'Medición higiénica a distancia.',desc:'Termómetro infrarrojo sin contacto con lectura en 1 segundo, modo objeto y corporal, pantalla retroiluminada y memoria de 32 registros.',price:149000,promo:null,stock:0,sku:'TER-IR03',img:'termometro',rating:4.7,reviews:12,active:true,freeShip:false,featured:false,tags:[],
      features:['Lectura en 1 segundo','Sin contacto','Memoria de 32 registros','Alarma de fiebre'],includes:['Termómetro','Manual','2 pilas AAA'],specs:{Distancia:'1–5 cm',Precisión:'±0,2 °C',Memoria:'32',SKU:'TER-IR03'}},
    {id:'p12',name:'Kit Glucometría Completo',cat:'Glucómetros',short:'Medidor + 100 tiras + estuche.',desc:'Set completo de control glucémico con medidor, 100 tiras, 100 lancetas, lancetero, soluciones de control y estuche organizador.',price:269000,promo:null,stock:8,sku:'GLU-KT100',img:'glucometro',rating:4.8,reviews:8,active:true,freeShip:true,featured:false,tags:[],
      features:['100 tiras y 100 lancetas','Solución de control','Estuche organizador','Conexión a app'],includes:['Glucómetro','100 tiras','100 lancetas','Estuche'],specs:{Tiras:'100 unidades',Memoria:'800 registros',SKU:'GLU-KT100'}}
  ],
  combos:[
    {id:'c1',name:'Kit Semiología',desc:'Estetoscopio + esfigmomanómetro + oxímetro. Lo esencial para la evaluación clínica.',imgs:['bic-black','esfigmo','oximetro'],price:629000,old:727000,sku:'COM-SEM',items:['Estetoscopio BIC Eternity III · Total Black','Esfigmomanómetro Aneroide Pro','Oxímetro Fingertip Digital'],stock:6},
    {id:'c2',name:'Kit Prácticas Clínicas',desc:'Pensado para estudiantes: auscultación, temperatura y saturación en un solo pedido.',imgs:['bic-rosa','termometro','oximetro'],price:469000,old:537000,sku:'COM-PRA',items:['Estetoscopio BIC Eternity III · Rosa / Rainbow','Termómetro Digital Clínico','Oxímetro Fingertip Digital'],stock:9},
    {id:'c3',name:'Kit Sutura Completo',desc:'Kit avanzado de 32 piezas con hilos adicionales para práctica intensiva.',imgs:['sutura','sutura','sutura'],price:389000,old:449000,sku:'COM-SUT',items:['Kit de Sutura Avanzado — 32 piezas','Set adicional de hilos de entrenamiento'],stock:5}
  ],
  promotions:[
    {id:'pr1',name:'Semana InMed',percent:15,start:'2026-11-01',end:'2026-11-10',productIds:['p1','p2','p3'],active:true}
  ],
  posts:[
    {id:'b1',title:'Cómo elegir tu primer estetoscopio',cat:'Estetoscopios',img:'bic-rosa',summary:'Doble o simple campana, largo del tubo, olivas y sensibilidad: qué mirar antes de comprar.',date:'2026-10-28',active:true,slug:'como-elegir-estetoscopio'},
    {id:'b2',title:'Cómo medir correctamente la presión arterial',cat:'Presión arterial',img:'esfigmo',summary:'Posición, brazalete, reposo y errores frecuentes que alteran la lectura.',date:'2026-10-21',active:true,slug:'medir-presion-arterial'},
    {id:'b3',title:'Valores normales de SpO2 y cuándo consultar',cat:'Oxímetros',img:'oximetro',summary:'Guía práctica de interpretación y limitaciones del oxímetro de dedo.',date:'2026-10-14',active:true,slug:'valores-normales-spo2'},
    {id:'b4',title:'Tipos de hilos de sutura y sus usos',cat:'Sutura',img:'sutura',summary:'Absorbibles, no absorbibles, calibres y agujas: la guía para tus prácticas.',date:'2026-10-07',active:true,slug:'tipos-de-hilos-de-sutura'},
    {id:'b5',title:'Cómo utilizar un glucómetro en casa',cat:'Glucómetros',img:'glucometro',summary:'Paso a paso para una medición confiable y cuidado de las tiras.',date:'2026-09-30',active:true,slug:'como-usar-un-glucometro'},
    {id:'b6',title:'Tipos de termómetros clínicos',cat:'Termómetros',img:'termometro',summary:'Digital, infrarrojo y de contacto: ventajas y cuándo conviene cada uno.',date:'2026-09-23',active:true,slug:'tipos-de-termometros'}
  ],
  leads:[
    {id:'l1',type:'Pedido WhatsApp',contact:'Cliente demo',items:'1x Kit de Sutura InMed — 19 piezas',total:249000,date:'2026-11-02T10:20:00',status:'Nuevo'},
    {id:'l2',type:'Newsletter',contact:'ana@correo.com',items:'Suscripción al newsletter',total:0,date:'2026-11-02T09:05:00',status:'Nuevo'}
  ]
});

const FAQ=[
  {q:'¿Hacen envíos a todo Paraguay?',a:'Sí. Despachamos a todo el país. Coordinamos la entrega por WhatsApp y te confirmamos plazo y costo antes de cerrar el pedido.'},
  {q:'¿Cómo finalizo una compra?',a:'Agregá los productos al carrito, revisá el total y presioná “Finalizar por WhatsApp”. Se abre un mensaje ya armado con tu pedido para que lo confirmemos juntos.'},
  {q:'¿Los productos tienen garantía?',a:'Todos los productos son originales y cuentan con garantía del fabricante. El plazo específico figura en la ficha de cada producto.'},
  {q:'¿Puedo pedir una variante de color específica?',a:'Sí. En el BIC Eternity podés elegir el color dentro de la ficha del producto; el stock se muestra por variante.'},
  {q:'¿El envío tiene costo?',a:'Muchos productos tienen envío gratis y, además, pedidos desde el mínimo configurado acceden a envío sin cargo. Consultá siempre al coordinar.'}
];

/* ---------- estado ---------- */
function loadDB(){
  try{ const raw=ST.get('inmed_db_v1'); if(raw){ const d=JSON.parse(raw); if(d && d.products && d.settings) return d; } }catch(e){}
  return DEFAULT();
}
let DB = loadDB();
Object.assign(IMG, DB.customImages||{});   // fotos subidas desde el admin
const saveDB = () => ST.set('inmed_db_v1', JSON.stringify(DB));
const todayStr = () => { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
const nowStr   = () => { const d=new Date(); return todayStr()+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':00'; };
function loadCart(){ try{const c=JSON.parse(ST.get('inmed_cart_v1')||'[]'); return Array.isArray(c)?c:[];}catch(e){return [];} }
let cart=loadCart();
const saveCart=()=>ST.set('inmed_cart_v1',JSON.stringify(cart));


const S={filter:'all',visible:8,query:'',bic:0,allPosts:false,pdp:null,adminTab:'dashboard',adminAuth:false,mode:null,favs:[],catalogReady:false,checkoutBusy:false};

/* ---------- catálogo remoto Supabase ---------- */
async function syncRemoteStore(){
  const cfg=window.INMED_SUPABASE||{};
  if(!cfg.url||!cfg.key) return false;
  try{
    const r=await fetch(cfg.url+'/rest/v1/store_state?id=eq.main&select=data',{
      headers:{apikey:cfg.key,Accept:'application/json'}
    });
    if(!r.ok) return false;
    const rows=await r.json();
    const remote=rows&&rows[0]&&rows[0].data;
    if(!remote||!Array.isArray(remote.products)||!remote.settings) return false;
    const localLeads=Array.isArray(DB.leads)?DB.leads:[];
    DB=Object.assign({},remote,{leads:localLeads});
    Object.assign(IMG,DB.customImages||{});
    return true;
  }catch(e){ return false; }
}

/* ---------- utilidades de negocio ---------- */
function activePromoFor(p){
  const today=todayStr();
  return (DB.promotions||[]).find(pr=>pr.active && pr.productIds.indexOf(p.id)>-1 && (!pr.start||pr.start<=today) && (!pr.end||pr.end>=today)) || null;
}
function priceOf(p,v){
  const regular=Number(p.price), base=v?Number(v.price):regular;
  if(!Number.isFinite(base)||base<0)return {cur:0,old:null,off:null};
  const candidates=[base],promo=activePromoFor(p);
  if(promo&&Number.isFinite(Number(promo.percent))&&Number(promo.percent)>0&&Number(promo.percent)<=100){
    candidates.push(Math.round(base*(1-Number(promo.percent)/100)));
  }
  // Compare the individual price and the campaign: never replace a lower offer with a higher price.
  if(!v&&p.promo!==null&&p.promo!==undefined&&Number.isFinite(Number(p.promo))
    &&Number(p.promo)>=0&&Number(p.promo)<base)candidates.push(Number(p.promo));
  const cur=Math.min(...candidates);
  const original=(v&&regular>base)?regular:base;
  const old=cur<original?original:null;
  const off=old&&old>0?Math.round((1-cur/old)*100):null;
  return {cur,old,off,name:promo?.name||null};
}
function publicCategoryName(id){
  return (DB.categories||[]).find(c=>c.id===id)?.name||id||'Equipamiento médico';
}
function activeCampaign(){
  const today=todayStr();
  return (DB.promotions||[]).find(pr=>pr.active
    && Number(pr.percent)>0&&Number(pr.percent)<=100
    && Array.isArray(pr.productIds)
    && pr.productIds.some(id=>DB.products.some(p=>p.id===id&&p.active!==false))
    && (!pr.start||pr.start<=today)&&(!pr.end||pr.end>=today))||null;
}
// Cada estetoscopio del catálogo es un producto independiente, no una variante del demo.
const saleVariants=p=>p.cat==='Estetoscopios'?[]:(Array.isArray(p.variants)?p.variants:[]);
const stockOf=(p,v)=> v? Number(v.stock) : Number(p.stock);
function cartAvailability(it){
  if(!S.catalogReady||!it||typeof it.id!=='string')return {ok:false,reason:'Catálogo no disponible'};
  if(it.kind==='combo'){
    const combo=(DB.combos||[]).find(x=>x.id===it.id&&x.active!==false);
    const max=Math.floor(Number(combo?.stock));
    return combo&&Number.isFinite(max)&&max>0?{ok:true,max}:{ok:false,reason:'Combo agotado o no disponible'};
  }
  const p=DB.products.find(x=>x.id===it.id&&x.active!==false);
  if(!p)return {ok:false,reason:'Producto no disponible'};
  const variants=saleVariants(p);
  const v=variants.length?variants.find(x=>x.name===it.variant):null;
  if(variants.length&&!v)return {ok:false,reason:'Seleccioná una variante válida'};
  const max=Math.floor(stockOf(p,v));
  if(!Number.isFinite(max)||max<=0)return {ok:false,reason:'Sin stock'};
  return {ok:true,max};
}
function reconcileCart(){
 const original=JSON.stringify(cart),normalized=[];
 for(const it of cart){
  const available=cartAvailability(it);
  if(!available.ok)continue;
  const qty=Math.min(available.max,Math.max(1,Math.floor(Number(it.qty)||1)));
  const kind=it.kind==='combo'?'combo':'product';
  const key=it.id+'::'+(it.variant||'')+'::'+kind;
  const existing=normalized.find(x=>x.id+'::'+(x.variant||'')+'::'+x.kind===key);
  if(existing)existing.qty=Math.min(available.max,existing.qty+qty);
  else normalized.push({id:it.id,variant:it.variant||'',qty,kind});
 }
 cart=normalized;
 if(JSON.stringify(cart)!==original)saveCart();
 return JSON.stringify(cart)!==original;
}
const activeProducts=()=>DB.products.filter(p=>p.active!==false);
function waUrl(text){
 const digits=String(DB.settings?.whatsapp||'').replace(/\D/g,'');
 if(!/^\d{8,15}$/.test(digits))return null;
 return 'https://wa.me/'+digits+'?text='+encodeURIComponent(text);
}
function openWA(text,log){
 const url=waUrl(text);
 if(!url){toast('El WhatsApp de la tienda no está configurado.');return false;}
 // This only opens WhatsApp. The buyer must press Send; opening is not a completed order.
 if(log)addLead('Apertura WhatsApp','Cliente web',log.text,log.total);
 const a=document.createElement('a');
 a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 document.body.appendChild(a);a.click();a.remove();
 return true;
}
function addLead(type,contact,items,total){
  DB.leads.unshift({id:uid(),type,contact,items,total:Number(total)||0,date:nowStr(),status:'Nuevo'});
  saveDB(); if(S.mode==='admin') renderAdminContent();
}
function toast(msg){
  const el=document.createElement('div'); el.className='toast'; el.innerHTML='<span class="tdot"></span>'+esc(msg);
  $('#toastWrap').appendChild(el); setTimeout(()=>el.remove(),3200);
}
function stars(r){ return `<div class="stars"><i>★★★★★</i> ${Number(r).toFixed(1)}</div>`; }

/* ==========================================================================
   TIENDA
   ========================================================================== */
function renderStore(){
  const B=DB.banners, C=DB.settings;
  // Do not advertise a non-functional coupon; WhatsApp checkout has no coupon redemption.
  const announcement=String(B.announcement||'');
  const unsupportedCoupon=/\\bINMED5\\b|cup[oó]n/iu.test(announcement);
  $('#topAnnounce').innerHTML=B.showAnnouncement&&!unsupportedCoupon?safeRich(announcement,['b']):'Envíos a todo Paraguay · Atención por WhatsApp';
  $('#heroTitle').innerHTML=safeRich(B.heroTitle,['em']);
  $('#heroSub').textContent=B.heroSub;
  const heroCampaign=B.showOffer?activeCampaign():null;
  $('#heroBadge').textContent=heroCampaign?'HASTA '+Number(heroCampaign.percent)+'% OFF · PRODUCTOS SELECCIONADOS':'';
  $('#heroBadge').hidden=!B.showHeroBadge||!heroCampaign;
  renderHeroGallery();
  $('#floatBText').innerHTML='Envío gratis*<small>Desde '+gs(C.freeShipMin)+'</small>';
  const campaign=B.showOffer?activeCampaign():null;
  const cats=campaign?[...new Set((campaign.productIds||[]).map(id=>
    DB.products.find(p=>p.id===id)?.cat).filter(Boolean).map(publicCategoryName))]:[];
  $('#offerTitle').textContent=campaign?(campaign.name+' · '+Number(campaign.percent)+'% OFF'):'';
  $('#offerText').textContent=campaign?
    ('En '+(cats.join(' y ')||'productos')+' seleccionados. Se muestra siempre el mejor precio disponible. Consultá el stock antes de comprar.'):'';
  $('#offerEyebrow').textContent=campaign?'Promoción vigente en productos seleccionados':'';
  $('.offer-wrap').hidden=!campaign;
  $('#newsText').textContent='Si querés recibir consejos clínicos y novedades, solicitá tu inscripción por WhatsApp.';
  $('#footerAbout').textContent=C.footer;
  $('#footerPhone').textContent=C.phone;
  $('#footerMail').textContent=C.email||'';
  $('#footerMail').closest('li').hidden=!String(C.email||'').trim();
  $('#footerCopy').textContent=C.copy;
  $('#footerCats').innerHTML=DB.categories.map(c=>`<li><a href="#productos" data-act="filter" data-val="${esc(c.id)}">${esc(c.name)}</a></li>`).join('');
  document.title=(C.storeName||'InMed')+' Paraguay | Kits de Sutura y Equipamiento Médico';
  // Render each merchandising section independently so a broken optional widget
  // cannot erase categories, combos or the editorial grid.
  const sections=[
    ['navegación',renderNavigation],['categorías',renderCategories],['filtros',renderFilters],
    ['productos',renderProducts],['destacado',renderBIC],['combos',renderCombos],
    ['artículos',renderPosts],['preguntas',renderFAQ],['ofertas',renderCountdown],['carrito',renderCart]
  ];
  for(const [name,render] of sections){
    try{render()}catch(error){
      console.error('[InMed] Error al mostrar '+name,error);
      if(name==='destacado')$('#bic').hidden=true;
      if(name==='combos')$('#combos').hidden=true;
    }
  }
}
function renderNavigation(){
  // Categories come from the active catalog: no permanently hardcoded demo navigation.
  const categories=(DB.categories||[]).filter(cat=>activeProducts().some(p=>p.cat===cat.id));
  $('#navLinks').innerHTML=
    '<a href="#inicio" data-cat="all">Inicio</a>'+
    categories.map(cat=>'<a href="#productos" data-cat="'+esc(cat.id)+'">'+esc(cat.name)+'</a>').join('')+
    ((DB.combos||[]).some(c=>c.active!==false&&Number(c.stock)>0)?'<a href="#combos">Combos</a>':'')+
    '<a href="#ofertas" class="nav-offer" data-cat="ofertas">Ofertas</a>'+
    '<a href="#blog">Blog</a><span class="nav-spacer"></span>'+
    '<span class="nav-note"><b>●</b> Envíos a todo Paraguay</span>';
  $('#navLinks a[data-cat]').forEach(a=>a.classList.toggle('active',a.dataset.cat===S.filter));
}
function renderHeroGallery(){
 const custom=DB.customImages?.hero;
 const photo=$('#heroImg'),gallery=$('#heroProductGallery');
 if(custom){
   photo.src=img(custom);photo.hidden=false;gallery.hidden=true;
   return;
 }
 photo.hidden=true;gallery.hidden=false;
 const pick=(category)=>activeProducts().find(p=>p.cat===category&&p.img);
 const selection=[pick('Sutura'),pick('Estetoscopios'),pick('Termómetros')].filter(Boolean);
 const unique=selection.filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i);
 gallery.innerHTML=unique.map((p,i)=>`<div class="hero-product-card hero-product-${i+1}">
  <img src="${img(p.img)}" alt="${esc(p.name)}" loading="${i===0?'eager':'lazy'}">
  <span>${esc(publicCategoryName(p.cat))}</span>
 </div>`).join('');
 gallery.hidden=!unique.length;
}
function renderCategories(){
  $('#catGrid').innerHTML=DB.categories.map(c=>{
    const originalCover=['Oxímetros','Glucómetros'].includes(c.id);
    const chosen=originalCover?null:activeProducts().find(p=>p.cat===c.id&&p.img);
    const cover=chosen?.img||c.img;
    return `
    <div class="cat-card" data-act="filter" data-val="${esc(c.id)}" role="button" tabindex="0">
      <div class="cat-img"><img src="${img(cover)}" alt="${esc(c.name)}" loading="lazy"></div>
      <strong>${esc(c.name)}</strong><small>${esc(c.desc)}</small>
    </div>`;
  }).join('');
}
function renderFilters(){
  const chips=[{id:'all',name:'Todos'},{id:'ofertas',name:'Ofertas'},...DB.categories.map(c=>({id:c.id,name:c.name}))];
  const searchChip=S.filter==='search'?`<button class="chip active" data-act="filter" data-val="all">“${esc(S.query)}” ✕ Limpiar</button>`:'';
  $('#filterBar').innerHTML=chips.map(c=>`<button class="chip ${S.filter===c.id?'active':''}" data-act="filter" data-val="${esc(c.id)}">${esc(c.name)}</button>`).join('')+searchChip+
    `<span class="filter-count" id="filterCount"></span>`;
}
function filteredProducts(){
  let list=activeProducts();
  if(S.filter==='ofertas') list=list.filter(p=>priceOf(p).off);
  else if(S.filter==='search') list=list.filter(p=>norm(p.name+' '+p.cat+' '+p.short).indexOf(S.query)>-1);
  else if(S.filter!=='all') list=list.filter(p=>p.cat===S.filter);
  return list;
}
function productCard(p){
  const variants=saleVariants(p),pr=priceOf(p),st=variants.length?variants.reduce((sum,v)=>sum+Math.max(0,Number(v.stock)||0),0):Math.max(0,Number(p.stock)||0),out=st<=0,low=st>0&&st<=3;
  const tagList=(p.tags||[]).filter(t=>t!=='OFERTA'&&t!=='MÁS VENDIDO');if(pr.off)tagList.push('OFERTA');
  const badges=tagList.slice(0,2).map(t=>`<span class="badge ${t==='OFERTA'?'badge-red':'badge-dark'}">${esc(t)}</span>`).join('');
  const fav=S.favs.indexOf(p.id)>-1;
  return `<article class="prod-card">
    <div class="prod-media" data-act="open-pdp" data-id="${p.id}">
      <div class="prod-badges">${badges}</div>
      <button class="prod-fav ${fav?'on':''}" data-act="fav" data-id="${p.id}" aria-label="Favorito">${ic('heart','width:16px;height:16px')}</button>
      <img src="${img(p.img)}" alt="${esc(p.name)}" loading="lazy" decoding="async">
    </div>
    <div class="prod-body">
      <div class="prod-cat">${esc(publicCategoryName(p.cat))}</div>
      <div class="prod-title" data-act="open-pdp" data-id="${p.id}">${esc(p.name)}</div>
      <div class="prod-desc">${esc(p.short)}</div>
      <div style="font-size:11px;color:var(--gray);margin:6px 0">Código: ${esc(p.sku||'Consultar')}</div>
      <div class="price-row">${pr.old?`<div class="price-old">${gs(pr.old)}</div>`:''}<span class="price"><span class="cur">Gs.</span> ${Math.round(pr.cur).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')}</span>${pr.off?`<span class="price-off">-${pr.off}%</span>`:''}</div>
      <div class="prod-meta">
        ${out?'<span class="tag-amber">Agotado</span>':low?'<span class="tag-amber">Últimas '+st+' unidades</span>':'<span class="tag-green">En stock</span>'}
        ${p.freeShip?'<span class="tag-green">Envío gratis</span>':'<span class="tag-muted">Envío a todo el país</span>'}
      </div>
      <div class="prod-actions">
        <button class="btn btn-outline" data-act="open-pdp" data-id="${p.id}">VER PRODUCTO</button>
        <button class="btn-add" data-act="${out?'consult':(variants.length?'open-pdp':'add')}" data-id="${p.id}" aria-label="Agregar al pedido">${ic(out?'chat':variants.length?'arrow':'plus','width:18px;height:18px')}</button>
      </div>
    </div>
  </article>`;
}
function renderProducts(){
  const list=filteredProducts(), shown=list.slice(0,S.visible);
  $('#prodGrid').innerHTML=shown.length?shown.map(productCard).join(''):'<div class="empty-state">No encontramos productos con ese criterio. Probá con otra categoría o escribinos por WhatsApp.</div>';
  const fc=$('#filterCount'); if(fc) fc.textContent=list.length+' producto'+(list.length===1?'':'s');
  $('#loadMore').hidden=list.length<=S.visible;
  $('#seeAll').innerHTML='Ver todos los productos '+ic('arrow','width:16px;height:16px');
}
function setFilter(f,scroll){
  S.filter=f; S.visible=8;
  if(f!=='search'){ S.query=''; $('#searchInput').value=''; }
  renderFilters(); renderProducts();
  $$('#navLinks a').forEach(a=>a.classList.toggle('active',a.dataset.cat===f));
  if(scroll) scrollTo('productos');
}
function scrollTo(id){ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }

/* ---------- Destaque comercial: dados reais do catálogo ---------- */
function featuredProducts(){
 const configured=DB.settings?.featuredProductId;
 if(configured==='__none__')return [];
 const chosen=DB.products.find(p=>p.id===configured&&p.active!==false)
   ||DB.products.find(p=>p.active!==false&&p.cat==='Estetoscopios')
   ||DB.products.find(p=>p.active!==false);
 if(!chosen)return [];
 const group=DB.products.filter(p=>p.active!==false&&p.cat===chosen.cat&&Number.isFinite(Number(p.price)));
 return [chosen,...group.filter(p=>p.id!==chosen.id)].slice(0,12);
}
function featuredProduct(){
 const group=featuredProducts();
 return group[S.bic]||group[0]||null;
}
function renderBIC(){
 const group=featuredProducts();
 if(!group.length){$('#bic').hidden=true;return}
 if(!group[S.bic]||!group[S.bic].id)S.bic=0;
 const p=featuredProduct(),pr=priceOf(p),st=Math.max(0,Number(p.stock)||0);
 $('#bic').hidden=false;
 const title=$('#featuredTitle'),desc=$('#featuredDescription'),eyebrow=$('#featuredEyebrow'),tag=$('#featuredTag');
 if(title)title.textContent=p.name;
 if(desc)desc.textContent=p.short||p.desc||'';
 if(eyebrow)eyebrow.textContent=publicCategoryName(p.cat);
 if(tag)tag.textContent=publicCategoryName(p.cat).toUpperCase();
 $('#bicImg').src=img(p.img);
 $('#bicImg').alt=p.name;
 $('#bicDiscount').textContent=pr.off?'-'+pr.off+'%':(st>0?'DISPONIBLE':'SIN STOCK');
 $('#bicSwatches').innerHTML=group.map((x,i)=>`
 <button type="button" class="featured-option ${x.id===p.id?'active':''}" data-act="bic" data-val="${i}" aria-label="Seleccionar ${esc(x.name)}" aria-pressed="${x.id===p.id}">
   <img src="${img(x.img)}" alt="" loading="lazy">
   <span class="featured-option-label">${esc(x.name)}</span>
 </button>`).join('');
 $('#bicVariantBox').innerHTML=`
   <div><small>Producto seleccionado</small><b>${esc(p.name)}</b></div>
   <div><small>Precio actual</small><b>${gs(pr.cur)}</b></div>
   <div class="vb-${st>0?'green':'amber'}"><small>${st>0?'Disponible':'Sin stock'}</small><b>${st>0?st+' unidades':'Agotado'}</b></div>
   <div><small>SKU</small><b class="mono" style="font-size:14px">${esc(p.sku||'—')}</b></div>`;
 $('#bicAdd').disabled=false;
 $('#bicAdd').textContent='CONSULTAR DISPONIBILIDAD';
 $('#bicVariantStrip').innerHTML='';
}
/* ---------- combos ---------- */
function renderCombos(){
  const available=(DB.combos||[]).filter(c=>c.active!==false&&Number(c.stock)>0&&Number(c.price)>=0);
  $('#combos').hidden=!available.length;
  $('#comboGrid').innerHTML=available.map(c=>`
    <div class="combo-card">
      <div class="combo-top"><div class="combo-imgs">${(Array.isArray(c.imgs)?c.imgs:[]).filter(Boolean).slice(0,3).map(k=>`<img src="${img(k)}" alt="${esc(c.name)}">`).join('')}</div></div>
      <div class="combo-body">
        <h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p>
        <div class="combo-price"><span class="price"><span class="cur">Gs.</span> ${Math.round(c.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')}</span>${Number(c.old)>Number(c.price)?`<span class="price-old">${gs(c.old)}</span><span class="combo-save">Ahorrás ${gs(c.old-c.price)}</span>`:''}</div>
        <button class="btn btn-primary btn-block" data-act="combo-add" data-id="${c.id}">AGREGAR COMBO ${ic('plus','width:15px;height:15px')}</button>
      </div>
    </div>`).join('');
}
function renderPosts(){
  const list=(DB.posts||[]).filter(p=>p.active!==false), shown=S.allPosts?list:list.slice(0,3);
  $('#postGrid').innerHTML=shown.map(p=>`
    <article class="post" data-act="post" data-id="${p.id}">
      <div class="post-img"><img src="${img(p.img)}" alt="${esc(p.title)}"><span class="badge badge-red post-tag">${esc(p.cat)}</span></div>
      <div class="post-body"><small>${p.date?new Date(p.date).toLocaleDateString('es-PY')+' · ':''}Blog InMed</small><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div>
    </article>`).join('');
  $('#blogAll').innerHTML=(S.allPosts?'Ver menos':'Ver todos los artículos')+' '+ic('arrow','width:16px;height:16px');
}
function renderFAQ(){
  $('#faqList').innerHTML=FAQ.map((f,i)=>`<div class="faq-item ${i===0?'open':''}"><button class="faq-q" data-act="faq"><span>${esc(f.q)}</span><span class="plus">+</span></button><div class="faq-a">${esc(f.a)}</div></div>`).join('');
}
function renderCountdown(){
  const campaign=DB.banners.showOffer?activeCampaign():null;
  if(!campaign){
    $('.offer-wrap').hidden=true;
    return;
  }
  const end=campaign.end?new Date(campaign.end+'T23:59:59').getTime():NaN;
  const diff=end-Date.now();
  if(!Number.isFinite(end)){
    $('#countdown').innerHTML='';
    return;
  }
  if(diff<=0){
    $('.offer-wrap').hidden=true;
    return;
  }
  const d=Math.floor(diff/86400000),h=Math.floor(diff/3600000)%24,m=Math.floor(diff/60000)%60,z=Math.floor(diff/1000)%60;
  const boxes=[[String(d).padStart(2,'0'),'Días'],[String(h).padStart(2,'0'),'Horas'],[String(m).padStart(2,'0'),'Min'],[String(z).padStart(2,'0'),'Seg']];
  $('#countdown').innerHTML=boxes.map(b=>'<div class="cd-box"><b>'+b[0]+'</b><small>'+b[1]+'</small></div>').join('');
}

/* ---------- carrito ---------- */
function lineInfo(it){
  if(it.kind==='combo'){ const c=(DB.combos||[]).find(x=>x.id===it.id)||{}; return {name:c.name||'Combo',img:c.imgs?c.imgs[0]:'sutura',price:Number(c.price)||0,sku:c.sku||''}; }
  const p=DB.products.find(x=>x.id===it.id); if(!p) return null;
  const v=saleVariants(p).find(x=>x.name===it.variant);
  const pr=priceOf(p,v);
  return {name:p.name+(v?' · '+v.name:''),img:v?v.img:p.img,price:pr.cur,sku:v?v.sku:p.sku,stock:stockOf(p,v)};
}
function renderCart(){
  if(!S.catalogReady){
    $('#cartCount').textContent=0;$('#drawerCount').textContent='(sin confirmar)';
    $('#cartBody').innerHTML='<div class="cart-empty"><h3>Estamos verificando el catálogo</h3><p>Los precios y las existencias no están disponibles por el momento. Conservamos tu selección para volver a comprobarla cuando el catálogo esté disponible.</p></div>';
    $('#cartFoot').innerHTML='<button class="btn btn-outline btn-block" data-close>VOLVER A LA TIENDA</button>';
    return;
  }
  const n=cart.reduce((a,b)=>a+b.qty,0);
  $('#cartCount').textContent=n; $('#drawerCount').textContent='('+n+')';
  if(!cart.length){
    $('#cartBody').innerHTML='<div class="cart-empty">'+ic('cart','width:46px;height:46px')+'<h3 style="font-size:16px;margin-bottom:6px">Tu pedido está vacío</h3><p style="font-size:13px">Agregá productos y cerrá tu compra por WhatsApp.</p></div>';
    $('#cartFoot').innerHTML='<button class="btn btn-outline btn-block" data-close>SEGUIR COMPRANDO</button>'; return;
  }
  $('#cartBody').innerHTML=cart.map((it,i)=>{
    const x=lineInfo(it); if(!x) return '';
    return `<div class="cart-item"><img src="${img(x.img)}" alt="${esc(x.name)}"><div class="cart-info">
      <strong>${esc(x.name)}</strong><small>${gs(x.price)} c/u</small>
      <div class="qty"><button data-act="qty" data-i="${i}" data-val="-1">−</button><span>${it.qty}</span><button data-act="qty" data-i="${i}" data-val="1">+</button></div>
      <span class="cart-remove" data-act="remove" data-i="${i}">Quitar</span>
    </div><div style="text-align:right"><b style="font-family:var(--f-title);font-size:12.5px">${gs(x.price*it.qty)}</b></div></div>`;
  }).join('');
  const sub=cart.reduce((a,it)=>{const x=lineInfo(it);return a+(x?x.price*it.qty:0)},0);
  const free=sub>=Number(DB.settings.freeShipMin);
  const ship=free?0:25000, total=sub+ship;
  $('#cartFoot').innerHTML=`<div class="cart-total-row"><span>Subtotal</span><b>${gs(sub)}</b></div>
    <div class="cart-total-row"><span>Envío estimado</span><b style="color:${free?'#17786d':'inherit'}">${free?'Gratis':gs(ship)}</b></div>
    ${!free?`<div style="font-size:11px;color:var(--gray);margin-bottom:6px">Te faltan ${gs(DB.settings.freeShipMin-sub)} para envío gratis</div>`:''}
    <div class="cart-total-row grand"><span>Total estimado</span><span>${gs(total)}</span></div><p style="font-size:11px;color:var(--gray);line-height:1.4">Envío estimado: ${free?"sin cargo según el mínimo de compra":gs(ship)}. InMed confirmará disponibilidad, costo y plazo de entrega por WhatsApp.</p>
    <button class="btn btn-primary btn-block" style="margin-top:14px" data-act="checkout">FINALIZAR POR WHATSAPP ${ic('arrow','width:16px;height:16px')}</button>
    <button class="btn btn-outline btn-block btn-sm" style="margin-top:8px" data-close>SEGUIR COMPRANDO</button>`;
}
function addToCart(id,variant,qty,kind){
 if(!S.catalogReady){toast('No podemos confirmar el catálogo ahora. Reintentá en unos instantes.');return false;}
 const requested=Math.max(1,Math.floor(Number(qty)||1));
 const type=kind==='combo'?'combo':'product';
 const item={id,variant:variant||'',qty:requested,kind:type};
 const available=cartAvailability(item);
 if(!available.ok){toast(available.reason+'. Consultá por WhatsApp.');return false;}
 const key=id+'::'+item.variant+'::'+type;
 const found=cart.find(c=>(c.id+'::'+(c.variant||'')+'::'+(c.kind||'product'))===key);
 const previous=found?found.qty:0;
 const next=Math.min(available.max,previous+requested);
 if(next<=previous){toast('Ya agregaste el máximo disponible de este producto.');return false;}
 if(found)found.qty=next;else cart.push({id,variant:item.variant,qty:next,kind:type});
 saveCart();renderCart();
 toast(next<previous+requested?'Cantidad ajustada al stock disponible.':'Producto agregado al pedido');
 return true;
}
function cartMessage(){
  const lines=cart.map(it=>{const x=lineInfo(it);return '• '+it.qty+'x '+(x?x.name:'Producto')+' — '+gs(x?x.price*it.qty:0)});
  const sub=cart.reduce((a,it)=>{const x=lineInfo(it);return a+(x?x.price*it.qty:0)},0);
  const free=sub>=Number(DB.settings.freeShipMin), ship=free?0:25000;
  return 'Hola InMed 👋, quiero solicitar estos productos:\n\n'+lines.join('\n')+'\n\nSubtotal: '+gs(sub)+'\nEnvío estimado: '+(free?'Gratis según el mínimo de compra':gs(ship))+'\nTotal estimado: '+gs(sub+ship)+'\n\n¿Podés confirmar disponibilidad, costo definitivo de envío, total y plazo de entrega? ¡Gracias!';
}
function openCart(){ closeInfo(); $('#overlay').classList.add('show'); $('#cartDrawer').classList.add('show'); $('#productModal').classList.remove('show'); }
function closeAll(){ $('#overlay').classList.remove('show'); $('#cartDrawer').classList.remove('show'); $('#productModal').classList.remove('show'); $('#searchDrop').hidden=true; closeInfo(); }

/* ---------- ficha de producto ---------- */
function openPDP(id,variant){
  const p=DB.products.find(x=>x.id===id); if(!p) return;
  S.pdp={id,variant:variant||((saleVariants(p)[0]||{}).name||''),qty:1,tab:'features'};
  renderPDP(); closeAll(); $('#overlay').classList.add('show'); $('#productModal').classList.add('show');
}
function renderPDP(){
  if(!S.pdp) return;
  const p=DB.products.find(x=>x.id===S.pdp.id); if(!p) return;
  const vs=saleVariants(p),v=vs.find(x=>x.name===S.pdp.variant),pr=priceOf(p,v),st=stockOf(p,v);
  const gallery=[...(v?.img?[v.img]:[]),p.img,...(Array.isArray(p.imgs)?p.imgs:[])].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,5);
  const main=v?v.img:p.img;
  $('#pdpBreadcrumb').innerHTML='Inicio <span>›</span> '+esc(publicCategoryName(p.cat))+' <span>›</span> <b>'+esc(p.name)+'</b>';
  const tabs=[['features','Características'],['shipping','Envío']];
   if(!tabs.some(t=>t[0]===S.pdp.tab)) S.pdp.tab='features';
  let body='';
  if(S.pdp.tab==='features') body='<div class="product-description">'+esc(p.desc||p.short||'Información del producto no disponible.').replace(/\n/g,'<br>')+'</div>';
  
  
  if(S.pdp.tab==='shipping') body='<p>Despachamos a todo Paraguay. Coordinamos el retiro o envío por WhatsApp y te confirmamos plazo y costo antes de cerrar el pedido.</p><ul><li>Envío gratis en productos seleccionados</li><li>Envío gratis en pedidos desde '+gs(DB.settings.freeShipMin)+'</li><li>Entrega coordinada con el cliente</li></ul>';
  const related=activeProducts().filter(x=>x.id!==p.id&&x.cat===p.cat).slice(0,3);
  $('#pdpContent').innerHTML=`
    <div class="pdp-grid">
      <div>
        <div class="pdp-main-img"><img src="${img(main)}" alt="${esc(p.name)}"></div>
        <div class="pdp-thumbs">${gallery.map((k,i)=>`<button class="${k===main?'active':''}" data-act="pdp-img" data-val="${esc(k)}" data-i="${i}"><img src="${img(k)}" alt="Vista ${i+1}"></button>`).join('')}</div>
      </div>
      <div>
        <div class="prod-cat">${esc(publicCategoryName(p.cat))}${pr.off?' · <span style="color:var(--red)">OFERTA -'+pr.off+'%</span>':''}</div>
        <h2 class="pdp-title">${esc(p.name)}</h2>
        <span style="font-size:12px;color:var(--gray)">SKU: ${esc(v?v.sku:(p.sku||'Consultar'))}</span>
        <div class="pdp-price">${pr.old?`<div class="price-old" style="font-size:14px">${gs(pr.old)}</div>`:''}<span class="price"><span class="cur">Gs.</span> ${Math.round(pr.cur).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')}</span>${pr.off?`<span class="price-off">-${pr.off}%</span>`:''}</div>
        <p class="pdp-short">${esc(p.desc)}</p>
        ${vs.length?`<div style="margin-top:18px"><div style="font-size:12px;font-weight:700;margin-bottom:9px">Color: <span style="color:var(--gray);font-weight:500">${esc(v?v.name:'')}</span></div>
          <div class="swatches" style="margin:0">${vs.map(x=>`<button class="swatch ${x.name===S.pdp.variant?'active':''}" data-act="pdp-variant" data-val="${esc(x.name)}" title="${esc(x.name)}"><span style="background:${esc(x.color)}"></span></button>`).join('')}</div></div>`:''}
        <div class="pdp-stock">
          ${st>0?`<span class="tag-green">En stock · ${st<=3?'últimas '+st+' unidades':st+' disponibles'}</span>`:'<span class="tag-amber">Agotado · consultar disponibilidad</span>'}
          ${p.freeShip?'<span class="tag-green">Envío gratis</span>':''}<span class="tag-muted">Envíos a todo Paraguay</span>
        </div>
        <div class="pdp-qty"><span style="font-size:12px;font-weight:700">Cantidad</span><div class="qty"><button data-act="pdp-qty" data-val="-1">−</button><span>${S.pdp.qty}</span><button data-act="pdp-qty" data-val="1">+</button></div><span class="mono">${esc(v?v.sku:p.sku)}</span></div>
        <div class="pdp-buttons">
          <button class="btn btn-primary" data-act="pdp-add" ${st<=0?'disabled':''}>${st>0?'AGREGAR AL PEDIDO':'AGOTADO'}</button>
          <button class="btn btn-outline" data-act="pdp-wa" ${st<=0?'disabled':''}>PEDIR POR WHATSAPP</button>
        </div>
        <div class="pdp-perks"><div>${ic('truck','width:15px;height:15px')} Envíos a todo el país</div><div>${ic('shield','width:15px;height:15px')} Producto original</div><div>${ic('chat','width:15px;height:15px')} Asesoría por WhatsApp</div></div>
      </div>
    </div>
    <div class="tabs">${tabs.map(t=>`<button class="tab ${S.pdp.tab===t[0]?'active':''}" data-act="pdp-tab" data-val="${t[0]}">${t[1]}</button>`).join('')}</div>
    <div class="tab-body">${body}</div>
    <div class="related"><h3 style="font-size:15px">Productos relacionados</h3><div class="related-grid">${related.map(r=>`<div class="related-item" data-act="open-pdp" data-id="${r.id}"><img src="${img(r.img)}" alt=""><div><strong>${esc(r.name)}</strong><small>${gs(priceOf(r).cur)}</small></div></div>`).join('')}</div></div>`;
}
function pdpAdd(){
  if(!S.pdp)return;
  if(addToCart(S.pdp.id,S.pdp.variant,S.pdp.qty,'product')){closeAll();openCart();}
}

/* ---------- modal informativo (blog / nosotros) ---------- */
function openInfo(title,html){
  $('#adminModalBox').innerHTML=`<div class="card-head"><h2>${esc(title)}</h2><button class="close-btn" data-act="close-info">${ic('x')}</button></div><div style="font-size:13.5px;color:var(--gray);line-height:1.8">${html}</div>`;
  $('#adminModal').classList.add('show');
}
function closeInfo(){ $('#adminModal').classList.remove('show'); }

/* ==========================================================================
   ADMIN
   ========================================================================== */
const ADMIN_TABS=[
  {k:'dashboard',n:'Dashboard',i:'chart',sub:'Resumen general de la tienda'},
  {k:'products',n:'Productos',i:'box',sub:'Catálogo, precios y variaciones'},
  {k:'categories',n:'Categorías',i:'grid',sub:'Organización del catálogo'},
  {k:'inventory',n:'Inventario',i:'sliders',sub:'Stock por producto y variante'},
  {k:'promotions',n:'Promociones',i:'tag',sub:'Descuentos con fecha de inicio y fin'},
  {k:'leads',n:'Pedidos / Leads',i:'file',sub:'Consultas y pedidos por WhatsApp'},
  {k:'blog',n:'Blog',i:'edit',sub:'Artículos y contenido'},
  {k:'banners',n:'Banners',i:'image',sub:'Textos y bloques de la home'},
  {k:'settings',n:'Configuración',i:'settings',sub:'Datos de la tienda'}
];
function renderAdmin(){
  $('#adminLogin').hidden=S.adminAuth; $('#adminShell').hidden=!S.adminAuth;
  if(!S.adminAuth) return;
  $('#adminNav').innerHTML=ADMIN_TABS.map(t=>`<button class="${S.adminTab===t.k?'active':''}" data-act="admin-tab" data-val="${t.k}">${ic(t.i,'width:16px;height:16px')} ${t.n}</button>`).join('');
  const t=ADMIN_TABS.find(x=>x.k===S.adminTab)||ADMIN_TABS[0];
  $('#adminTitle').textContent=t.n; $('#adminSubtitle').textContent=t.sub;
  renderAdminContent();
}
function renderAdminContent(){
  const map={dashboard:panelDashboard,products:panelProducts,categories:panelCategories,inventory:panelInventory,promotions:panelPromotions,leads:panelLeads,blog:panelBlog,banners:panelBanners,settings:panelSettings};
  $('#adminContent').innerHTML='<div class="admin-panel">'+(map[S.adminTab]||panelDashboard)()+'</div>';
}
function statCard(label,value,note,icon,green){ return `<div class="stat ${green?'green':''}"><div class="s-icon">${ic(icon,'width:18px;height:18px')}</div><div class="s-label">${label}</div><div class="s-value">${value}</div><div class="s-note">${note}</div></div>`; }
function panelDashboard(){
  const act=activeProducts(), low=DB.products.filter(p=>p.active!==false&&Number(p.stock)<=3), promo=act.filter(p=>priceOf(p).off);
  const leadsToday=(DB.leads||[]).filter(l=>l.date&&l.date.slice(0,10)===todayStr());
  const val=DB.products.reduce((a,p)=>a+Number(p.price)*Number(p.stock),0);
  return `<div class="admin-note"><b>V1 funcional.</b> Los cambios que hagas acá se reflejan al instante en la tienda. Los datos se guardan en este navegador (localStorage); en producción irían en Supabase con RLS y autenticación de administradores.</div>
  <div class="stat-grid">
    ${statCard('Productos activos',act.length,'de '+DB.products.length+' en catálogo','box')}
    ${statCard('Stock bajo',low.length,'productos con 3 o menos','sliders')}
    ${statCard('En promoción',promo.length,'ofertas vigentes','tag')}
    ${statCard('Leads hoy',leadsToday.length,(DB.leads||[]).length+' en total','file',true)}
  </div>
  <div class="two-col">
    <div class="card"><div class="card-head"><div><h2>Últimos pedidos y contactos</h2><p>Generados desde la tienda</p></div><button class="mini-btn" data-act="admin-tab" data-val="leads">Ver todos</button></div>
      <ul class="quick-list">${(DB.leads||[]).slice(0,5).map(l=>`<li><span><b>${esc(l.type)}</b> · ${esc(l.contact)}<br><small class="mono">${esc(String(l.items).slice(0,64))}</small></span><span><b>${l.total?gs(l.total):'—'}</b><br><span class="pill ${l.status==='Nuevo'?'warn':'on'}">${esc(l.status)}</span></span></li>`).join('')||'<li>Sin registros todavía</li>'}</ul></div>
    <div class="card"><div class="card-head"><div><h2>Atención requerida</h2><p>Stock y catálogo</p></div></div>
      <ul class="quick-list">${low.length?low.map(p=>`<li><span>${esc(p.name)}</span><span class="pill ${Number(p.stock)<=0?'red':'warn'}">${Number(p.stock)<=0?'AGOTADO':p.stock+' uds'}</span></li>`).join(''):'<li>Todo el catálogo con stock saludable</li>'}<li><span>Valor estimado de inventario</span><b>${gs(val)}</b></li><li><span>Categorías</span><b>${DB.categories.length}</b></li><li><span>Combos activos</span><b>${(DB.combos||[]).length}</b></li></ul>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px"><button class="btn btn-primary btn-sm" data-act="product-new">+ NUEVO PRODUCTO</button><button class="btn btn-outline btn-sm" data-act="promo-new">+ PROMOCIÓN</button></div>
    </div>
  </div>`;
}
function panelProducts(){
  return `<div class="card"><div class="card-head"><div><h2>Productos <span style="color:var(--gray);font-weight:500">(${DB.products.length})</span></h2><p>Editá precios, stock, variaciones y estado sin tocar código.</p></div><button class="btn btn-primary btn-sm" data-act="product-new">+ NUEVO PRODUCTO</button></div>
  <div class="table-wrap"><table class="admin-table"><thead><tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Oferta</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
  ${DB.products.map(p=>{const pr=priceOf(p);return `<tr><td><img class="thumb" src="${img(p.img)}" alt=""></td>
    <td><strong>${esc(p.name)}</strong><br><span class="mono">${esc(p.sku)}${p.variants?' · '+(p.variants.length+' variantes'):''}</span></td>
    <td>${esc(p.cat)}</td><td><b>${gs(p.price)}</b></td><td>${pr.off?`<span class="pill red">-${pr.off}%</span><br><span class="mono">${gs(pr.cur)}</span>`:'—'}</td>
    <td><span class="pill ${Number(p.stock)<=0?'red':Number(p.stock)<=3?'warn':'on'}">${Number(p.stock)<=0?'Agotado':p.stock+' uds'}</span></td>
    <td><span class="pill ${p.active!==false?'on':'off'}">${p.active!==false?'Activo':'Inactivo'}</span></td>
    <td><div class="row-actions"><button class="mini-btn" data-act="product-edit" data-id="${p.id}">Editar</button><button class="mini-btn" data-act="product-toggle" data-id="${p.id}">${p.active!==false?'Ocultar':'Activar'}</button><button class="mini-btn danger" data-act="product-del" data-id="${p.id}">✕</button></div></td></tr>`}).join('')}
  </tbody></table></div></div>`;
}
function panelCategories(){
  return `<div class="card"><div class="card-head"><div><h2>Categorías</h2><p>Las tarjetas de la home y los filtros del catálogo se actualizan automáticamente.</p></div><button class="btn btn-primary btn-sm" data-act="cat-new">+ NUEVA CATEGORÍA</button></div>
  <div class="table-wrap"><table class="admin-table"><thead><tr><th></th><th>Nombre</th><th>ID</th><th>Descripción</th><th>Productos</th><th>Acciones</th></tr></thead><tbody>
  ${DB.categories.map(c=>`<tr><td><img class="thumb" src="${img(c.img)}" alt=""></td><td><strong>${esc(c.name)}</strong></td><td class="mono">${esc(c.id)}</td><td>${esc(c.desc)}</td><td>${DB.products.filter(p=>p.cat===c.id).length}</td><td><div class="row-actions"><button class="mini-btn" data-act="cat-edit" data-id="${esc(c.id)}">Editar</button><button class="mini-btn danger" data-act="cat-del" data-id="${esc(c.id)}">✕</button></div></td></tr>`).join('')}
  </tbody></table></div></div>`;
}
function panelInventory(){
  const rows=[];
  DB.products.forEach(p=>{
    rows.push(`<tr><td><img class="thumb" src="${img(p.img)}" alt=""></td><td><strong>${esc(p.name)}</strong><br><span class="mono">${esc(p.sku)}</span></td><td>—</td><td><input class="status-select" type="number" min="0" style="width:90px" data-stock="${p.id}" value="${Number(p.stock)}"></td><td><span class="pill ${Number(p.stock)<=0?'red':Number(p.stock)<=3?'warn':'on'}">${Number(p.stock)<=0?'AGOTADO':Number(p.stock)<=3?'Bajo stock':'OK'}</span></td></tr>`);
    (p.variants||[]).forEach((v,i)=>rows.push(`<tr style="background:#FBFCFE"><td></td><td style="padding-left:26px">↳ ${esc(v.name)}</td><td class="mono">${esc(v.sku)}</td><td><input class="status-select" type="number" min="0" style="width:90px" data-stock="${p.id}" data-variant="${i}" value="${Number(v.stock)}"></td><td><span class="pill ${Number(v.stock)<=0?'red':Number(v.stock)<=3?'warn':'on'}">${Number(v.stock)<=0?'AGOTADO':Number(v.stock)<=3?'Bajo stock':'OK'}</span></td></tr>`));
  });
  return `<div class="card"><div class="card-head"><div><h2>Inventario en tiempo real</h2><p>Al llegar a 0, la tienda muestra “Agotado” y cambia el botón de compra.</p></div><button class="btn btn-primary btn-sm" data-act="inventory-save">GUARDAR CAMBIOS</button></div>
  <div class="table-wrap"><table class="admin-table"><thead><tr><th></th><th>Producto / variante</th><th>SKU</th><th>Stock</th><th>Estado</th></tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`;
}
function panelPromotions(){
  return `<div class="card"><div class="card-head"><div><h2>Promociones</h2><p>Definí el descuento, las fechas y los productos. La tienda calcula el precio y el sello OFERTA sola.</p></div><button class="btn btn-primary btn-sm" data-act="promo-new">+ NUEVA PROMOCIÓN</button></div>
  <div class="table-wrap"><table class="admin-table"><thead><tr><th>Nombre</th><th>Descuento</th><th>Vigencia</th><th>Productos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
  ${(DB.promotions||[]).map(pr=>`<tr><td><strong>${esc(pr.name)}</strong></td><td><span class="pill red">-${pr.percent}%</span></td><td class="mono">${esc(pr.start||'—')} → ${esc(pr.end||'—')}</td><td>${pr.productIds.length} productos</td><td><span class="pill ${pr.active?'on':'off'}">${pr.active?'Activa':'Pausada'}</span></td><td><div class="row-actions"><button class="mini-btn" data-act="promo-edit" data-id="${pr.id}">Editar</button><button class="mini-btn" data-act="promo-toggle" data-id="${pr.id}">${pr.active?'Pausar':'Activar'}</button><button class="mini-btn danger" data-act="promo-del" data-id="${pr.id}">✕</button></div></td></tr>`).join('')}
  </tbody></table></div></div>
  <div class="card"><div class="card-head"><h2>Vista previa de precios</h2></div><ul class="quick-list">${activeProducts().filter(p=>priceOf(p).off).slice(0,8).map(p=>{const pr=priceOf(p);return `<li><span>${esc(p.name)} <span class="pill red">-${pr.off}%</span></span><span><s class="mono">${gs(pr.old)}</s> <b>${gs(pr.cur)}</b></span></li>`}).join('')||'<li>No hay ofertas vigentes</li>'}</ul></div>`;
}
function panelLeads(){
  return `<div class="card"><div class="card-head"><div><h2>Pedidos / Leads <span style="color:var(--gray);font-weight:500">(${(DB.leads||[]).length})</span></h2><p>Cada “Finalizar por WhatsApp” y cada suscripción queda registrada acá.</p></div></div>
  <div class="table-wrap"><table class="admin-table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Contacto</th><th>Detalle</th><th>Total</th><th>Estado</th></tr></thead><tbody>
  ${(DB.leads||[]).map(l=>`<tr><td class="mono">${esc(String(l.date).replace('T',' ').slice(0,16))}</td><td><strong>${esc(l.type)}</strong></td><td>${esc(l.contact)}</td><td style="max-width:280px">${esc(String(l.items).slice(0,110))}</td><td><b>${l.total?gs(l.total):'—'}</b></td><td><select class="status-select" data-lead-status="${l.id}">${['Nuevo','Contactado','Cerrado','Descartado'].map(s=>`<option ${l.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="6">Sin registros</td></tr>'}
  </tbody></table></div></div>`;
}
function panelBlog(){
  return `<div class="card"><div class="card-head"><div><h2>Artículos del blog</h2><p>Las URLs se preservan: el slug se mantiene al editar.</p></div><button class="btn btn-primary btn-sm" data-act="post-new">+ NUEVO ARTÍCULO</button></div>
  <div class="table-wrap"><table class="admin-table"><thead><tr><th></th><th>Título</th><th>Categoría</th><th>Slug</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
  ${(DB.posts||[]).map(p=>`<tr><td><img class="thumb" src="${img(p.img)}" alt=""></td><td><strong>${esc(p.title)}</strong><br><span class="mono">${esc(p.date)}</span></td><td>${esc(p.cat)}</td><td class="mono">/${esc(p.slug)}</td><td><span class="pill ${p.active!==false?'on':'off'}">${p.active!==false?'Publicado':'Borrador'}</span></td><td><div class="row-actions"><button class="mini-btn" data-act="post-edit" data-id="${p.id}">Editar</button><button class="mini-btn" data-act="post-toggle" data-id="${p.id}">${p.active!==false?'Ocultar':'Publicar'}</button><button class="mini-btn danger" data-act="post-del" data-id="${p.id}">✕</button></div></td></tr>`).join('')}
  </tbody></table></div></div>`;
}
function imageOptions(sel){ return Object.keys(IMG).map(k=>`<option value="${esc(k)}" ${sel===k?'selected':''}>${esc(k)}</option>`).join(''); }
function panelBanners(){
  const B=DB.banners;
  return `<div class="card"><div class="card-head"><div><h2>Banners y textos de la home</h2><p>Editá el contenido visible de la tienda y guardá.</p></div></div>
  <form data-form="banners"><div class="form-grid">
    <div class="field full"><label>Frase de la barra superior (acepta HTML simple)</label><input name="announcement" value="${esc(B.announcement)}"></div>
    <div class="field full"><label class="checkbox-row"><input type="checkbox" name="showAnnouncement" ${B.showAnnouncement?'checked':''}> Mostrar barra de anuncio</label></div>
    <div class="field full"><label>Título del hero (usá &lt;em&gt; para el texto en rojo)</label><input name="heroTitle" value="${esc(B.heroTitle)}"></div>
    <div class="field"><label>Subtítulo del hero</label><input name="heroSub" value="${esc(B.heroSub)}"></div>
    <div class="field"><label>Sello circular del hero</label><input name="heroBadge" value="${esc(B.heroBadge)}"></div>
    <div class="field full"><label>Imagen principal del hero / banner</label><input type="file" name="heroUpload" accept="image/jpeg,image/png,image/webp"><small>Recomendado desktop: <b>1920 × 720 px · 8:3</b>. El panel convierte automáticamente a <b>WebP</b> y reduce imágenes excesivamente grandes sin deformarlas.</small><div data-media-result="hero"></div></div>
    <div class="field"><label class="checkbox-row"><input type="checkbox" name="showHeroBadge" ${B.showHeroBadge?'checked':''}> Mostrar sello del hero</label></div>
    <div class="field"><label class="checkbox-row"><input type="checkbox" name="showOffer" ${B.showOffer?'checked':''}> Mostrar banner de oferta</label></div>
    <div class="field full"><label>Título del banner de oferta</label><input name="offerTitle" value="${esc(B.offerTitle)}"></div>
    <div class="field full"><label>Texto del banner de oferta</label><textarea name="offerText">${esc(B.offerText)}</textarea></div>
    <div class="field"><label>Fin de la oferta</label><input type="datetime-local" name="offerEnd" value="${esc(B.offerEnd)}"></div>
    <div class="field full"><label>Texto del newsletter</label><textarea name="newsText">${esc(B.newsText)}</textarea></div>
  </div><div class="form-actions"><button class="btn btn-primary" type="submit">GUARDAR CAMBIOS</button></div></form></div>`;
}
function panelSettings(){
  const C=DB.settings;
  return `<div class="card"><div class="card-head"><div><h2>Configuración de la tienda</h2><p>Datos que usa la tienda para contacto, envíos y textos legales.</p></div></div>
  <form data-form="settings"><div class="form-grid">
    <div class="field"><label>Nombre de la tienda</label><input name="storeName" value="${esc(C.storeName)}"></div>
    <div class="field"><label>WhatsApp (código de país + número, solo dígitos)</label><input name="whatsapp" value="${esc(C.whatsapp)}"><small>Ej.: 595981000000 → se usa en todos los botones de compra.</small></div>
    <div class="field"><label>Teléfono visible</label><input name="phone" value="${esc(C.phone)}"></div>
    <div class="field"><label>Correo de contacto</label><input name="email" value="${esc(C.email)}"></div>
    <div class="field"><label>Mínimo para envío gratis (Gs.)</label><input type="number" name="freeShipMin" value="${Number(C.freeShipMin)}"></div>
    <div class="field"><label>Texto del pie de página</label><textarea name="footer">${esc(C.footer)}</textarea></div>
    <div class="field full"><label>Descripción de la empresa</label><textarea name="copy">${esc(C.copy)}</textarea></div>
  </div><div class="form-actions"><button class="btn btn-outline" type="button" data-act="reset-demo">RESTAURAR DATOS DEMO</button><button class="btn btn-primary" type="submit">GUARDAR CONFIGURACIÓN</button></div></form></div>
  <div class="card"><div class="card-head"><h2>Arquitectura sugerida para producción</h2></div>
  <div class="tab-body" style="padding-top:0"><ul>
    <li><b>Vercel + Next.js</b> para la aplicación y renderizado del catálogo.</li>
    <li><b>Supabase Postgres</b> para productos, categorías, variantes, precios, promociones, stock, leads y usuarios admin.</li>
    <li><b>Supabase Storage</b> para las fotos, con políticas de acceso.</li>
    <li><b>Supabase Auth + RLS</b> para proteger <span class="mono">/admin</span> y las operaciones de escritura.</li>
    <li>Preservar URLs actuales del blog, GA4 y Search Console durante la transición.</li>
  </ul></div></div>`;
}

/* ---------- modales de formularios admin ---------- */
function showAdminModal(html){ $('#adminModalBox').innerHTML=html; $('#adminModal').classList.add('show'); }
function variantRowHTML(v){
  v=v||{}; return `<div class="variant-row">
    <input name="v_name" placeholder="Variante (Rosa / Rainbow)" value="${esc(v.name||'')}">
    <input name="v_color" placeholder="Color #E8A0B8" value="${esc(v.color||'#D90429')}">
    <select name="v_img">${imageOptions(v.img||'bic-rosa')}</select>
    <input name="v_price" type="number" placeholder="Precio" value="${esc(v.price||'')}">
    <input name="v_stock" type="number" placeholder="Stock" value="${esc(v.stock||'')}">
    <input name="v_sku" placeholder="SKU" value="${esc(v.sku||'')}">
    <button type="button" class="mini-btn danger" data-act="variant-del">✕</button>
  </div>`;
}
function productForm(p){
  p=p||{}; const vs=p.variants||[];
  return `<div class="card-head"><h2>${p.id?'Editar producto':'Nuevo producto'}</h2><button class="close-btn" data-act="close-info">${ic('x')}</button></div>
  <p>${p.id?'Los cambios se aplican de inmediato en la tienda.':'Completá los datos. El producto aparecerá en el catálogo al guardar.'}</p>
  <form data-form="product" data-id="${esc(p.id||'')}"><div class="form-grid">
    <div class="field full"><label>Nombre <span>*</span></label><input name="name" required value="${esc(p.name||'')}" placeholder="Kit de Sutura InMed"></div>
    <div class="field"><label>Categoría</label><select name="cat">${DB.categories.map(c=>`<option ${p.cat===c.id?'selected':''}>${esc(c.id)}</option>`).join('')}</select></div>
    <div class="field"><label>SKU</label><input name="sku" value="${esc(p.sku||'')}" placeholder="KIT-SUT-25"></div>
    <div class="field full"><label>Descripción corta</label><input name="short" value="${esc(p.short||'')}" placeholder="25 piezas · Pad de silicona"></div>
    <div class="field full"><label>Descripción completa</label><textarea name="desc">${esc(p.desc||'')}</textarea></div>
    <div class="field"><label>Precio normal (Gs.) <span>*</span></label><input type="number" name="price" required value="${esc(p.price||'')}"></div>
    <div class="field"><label>Precio promocional (Gs.)</label><input type="number" name="promo" value="${esc(p.promo||'')}" placeholder="Opcional"></div>
    <div class="field"><label>Stock</label><input type="number" name="stock" value="${esc(p.stock||'')}"></div>
    <div class="field"><label>Estado</label><select name="active"><option value="1" ${p.active!==false?'selected':''}>● Activo</option><option value="0" ${p.active===false?'selected':''}>○ Inactivo</option></select></div>
    <div class="field"><label>Foto principal</label><select name="img">${imageOptions(p.img||'sutura')}</select></div>
    <div class="field"><label>Envío gratis</label><label class="checkbox-row" style="height:40px"><input type="checkbox" name="freeShip" ${p.freeShip?'checked':''}> Sí, este producto tiene envío gratis</label></div>
    <div class="field full"><label>Subir foto propia (opcional)</label><input type="file" name="upload" accept="image/jpeg,image/png,image/webp"><small>Recomendado: <b>1600 × 1600 px · 1:1</b>. JPG/PNG se convierte automáticamente a <b>WebP</b> antes de guardar. No se agranda una imagen pequeña.</small><div data-media-result="product"></div></div>
    <div class="field full"><label>Variaciones <button type="button" class="mini-btn" data-act="variant-add" style="margin-left:8px">+ AGREGAR VARIACIÓN</button></label>
      <div id="variantRows" style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--bg-soft)">
        ${vs.length?vs.map(variantRowHTML).join(''):'<small style="color:var(--gray)">Sin variaciones. Podés agregar color, precio, stock y SKU por variante.</small>'}
      </div></div>
    <div class="field"><label>SEO · Título</label><input name="seoTitle" value="${esc((p.seo||{}).title||p.name||'')}"></div>
    <div class="field"><label>SEO · Slug</label><input name="slug" value="${esc((p.seo||{}).slug||slug(p.name))}"></div>
    <div class="field full"><label>SEO · Descripción</label><input name="seoDesc" value="${esc((p.seo||{}).desc||p.short||'')}"></div>
  </div><div class="form-actions"><button type="button" class="btn btn-outline" data-act="close-info">CANCELAR</button><button class="btn btn-primary" type="submit">GUARDAR PRODUCTO</button></div></form>`;
}
function categoryForm(c){
  c=c||{}; return `<div class="card-head"><h2>${c.id?'Editar categoría':'Nueva categoría'}</h2><button class="close-btn" data-act="close-info">${ic('x')}</button></div>
  <form data-form="category" data-id="${esc(c.id||'')}"><div class="form-grid">
    <div class="field"><label>Nombre</label><input name="name" required value="${esc(c.name||'')}" placeholder="Oxímetros"></div>
    <div class="field"><label>ID interno</label><input name="id" required value="${esc(c.id||'')}" placeholder="Oxímetros"></div>
    <div class="field full"><label>Descripción corta</label><input name="desc" value="${esc(c.desc||'')}"></div>
    <div class="field full"><label>Imagen</label><select name="img">${imageOptions(c.img||'oximetro')}</select></div>
  </div><div class="form-actions"><button type="button" class="btn btn-outline" data-act="close-info">CANCELAR</button><button class="btn btn-primary" type="submit">GUARDAR</button></div></form>`;
}
function promoForm(pr){
  pr=pr||{}; const ids=pr.productIds||[];
  return `<div class="card-head"><h2>${pr.id?'Editar promoción':'Nueva promoción'}</h2><button class="close-btn" data-act="close-info">${ic('x')}</button></div>
  <p>El descuento se aplica automáticamente a los productos seleccionados mientras la promoción esté vigente.</p>
  <form data-form="promotion" data-id="${esc(pr.id||'')}"><div class="form-grid">
    <div class="field"><label>Nombre</label><input name="name" required value="${esc(pr.name||'')}" placeholder="Semana InMed"></div>
    <div class="field"><label>Descuento (%)</label><input type="number" name="percent" min="1" max="90" required value="${esc(pr.percent||'15')}"></div>
    <div class="field"><label>Inicio</label><input type="date" name="start" value="${esc(pr.start||'2026-11-01')}"></div>
    <div class="field"><label>Fin</label><input type="date" name="end" value="${esc(pr.end||'2026-11-10')}"></div>
    <div class="field full"><label>Productos incluidos</label><div class="check-list">${DB.products.map(p=>`<label><input type="checkbox" name="pid" value="${p.id}" ${ids.indexOf(p.id)>-1?'checked':''}> ${esc(p.name)}</label>`).join('')}</div></div>
    <div class="field full"><label class="checkbox-row"><input type="checkbox" name="active" ${pr.active!==false?'checked':''}> Promoción activa</label></div>
  </div><div class="form-actions"><button type="button" class="btn btn-outline" data-act="close-info">CANCELAR</button><button class="btn btn-primary" type="submit">GUARDAR PROMOCIÓN</button></div></form>`;
}
function postForm(p){
  p=p||{}; return `<div class="card-head"><h2>${p.id?'Editar artículo':'Nuevo artículo'}</h2><button class="close-btn" data-act="close-info">${ic('x')}</button></div>
  <form data-form="post" data-id="${esc(p.id||'')}"><div class="form-grid">
    <div class="field full"><label>Título</label><input name="title" required value="${esc(p.title||'')}"></div>
    <div class="field"><label>Categoría</label><input name="cat" value="${esc(p.cat||'')}"></div>
    <div class="field"><label>Slug / URL</label><input name="slug" value="${esc(p.slug||'')}"></div>
    <div class="field full"><label>Resumen</label><textarea name="summary">${esc(p.summary||'')}</textarea></div>
    <div class="field"><label>Imagen</label><select name="img">${imageOptions(p.img||'bic-rosa')}</select></div>
    <div class="field"><label class="checkbox-row" style="height:40px"><input type="checkbox" name="active" ${p.active!==false?'checked':''}> Publicado</label></div>
  </div><div class="form-actions"><button type="button" class="btn btn-outline" data-act="close-info">CANCELAR</button><button class="btn btn-primary" type="submit">GUARDAR ARTÍCULO</button></div></form>`;
}

/* ==========================================================================
   EVENTOS
   ========================================================================== */
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-act]');
  const closeEl=e.target.closest('[data-close]');
  if(closeEl && !el){ closeAll(); return; }
  if(!el) return;
  const act=el.dataset.act, id=el.dataset.id, val=el.dataset.val, i=Number(el.dataset.i);
  if(el.tagName==='A' && (act==='filter'||act==='post')) e.preventDefault();
  switch(act){
    /* tienda */
    case 'filter': setFilter(val,true); break;
    case 'open-pdp': openPDP(id); break;
    case 'add': addToCart(id,'',1,'product'); break;
    case 'consult': { const p=DB.products.find(x=>x.id===id); openWA('Hola InMed 👋, quiero consultar disponibilidad de: '+p.name+' ('+p.sku+'). ¿Cuándo vuelve a estar disponible?'); break; }
    case 'fav': { const k=S.favs.indexOf(id); if(k>-1)S.favs.splice(k,1);else S.favs.push(id); renderProducts(); break; }
    case 'bic': S.bic=Number(val); renderBIC(); break;
    case 'combo-add': addToCart(id,'',1,'combo'); break;
    case 'post': { const p=(DB.posts||[]).find(x=>x.id===id); if(p&&p.slug) window.location.href='/blog/'+p.slug; break; }
    case 'faq': el.parentElement.classList.toggle('open'); break;
    case 'close-info': closeAll(); break;
    case 'qty': { const it=cart[i];if(!it)break;const available=cartAvailability(it);
      if(!available.ok){cart.splice(i,1);toast('El artículo ya no está disponible.');}
      else {const next=it.qty+Number(val);if(next<=0)cart.splice(i,1);
      else if(next>available.max)toast('Cantidad máxima disponible: '+available.max);
      else it.qty=next;}
      saveCart();renderCart();break;}
    case 'remove': cart.splice(i,1); saveCart(); renderCart(); toast('Producto quitado'); break;
    case 'checkout': {
      if(S.checkoutBusy)break;
      if(!S.catalogReady||!cart.length){toast('El catálogo no está disponible para realizar pedidos.');break;}
      S.checkoutBusy=true;el.disabled=true;
      // Open a tab inside the click, before awaiting the stock check, to avoid popup blockers.
      const pending=window.open('about:blank','_blank');
      if(pending){pending.opener=null;try{pending.document.body.textContent='InMed: verificando disponibilidad y precios…';}catch(e){}}
      const summary=()=>JSON.stringify(cart.map(it=>{
        const x=lineInfo(it);
        return {id:it.id,variant:it.variant,qty:it.qty,name:x?.name,price:x?.price,stock:cartAvailability(it).max};
      }));
      const before=summary();
      try{
        const updated=await syncRemoteStore();
        if(!updated){
          S.catalogReady=false;
          if(pending)pending.close();
          renderCart();toast('No se pudo verificar el catálogo. No se abrió ningún pedido.');break;
        }
        S.catalogReady=true;
        const adjusted=reconcileCart();
        const after=summary();
        if(adjusted||after!==before||!cart.length){
          if(pending)pending.close();
          renderStore();
          toast('Actualizamos precios o existencias. Revisá el pedido y pulsá finalizar nuevamente.');
          break;
        }
        if(cart.some(it=>!cartAvailability(it).ok||it.qty>cartAvailability(it).max)){
          if(pending)pending.close();
          reconcileCart();renderStore();
          toast('El stock cambió. Revisá el pedido nuevamente.');break;
        }
        const msg=cartMessage(),url=waUrl(msg);
        if(!url){if(pending)pending.close();toast('WhatsApp no configurado.');break;}
        const sub=cart.reduce((sum,it)=>{const x=lineInfo(it);return sum+(x?x.price*it.qty:0);},0);
        addLead('Apertura WhatsApp','Cliente web',msg,sub);
        if(pending){pending.location.replace(url);}
        else {
          const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';
          document.body.appendChild(link);link.click();link.remove();
        }
        toast('WhatsApp abierto. Revisá y enviá el mensaje para solicitar tu pedido.');
      }catch(err){
        if(pending)pending.close();
        toast('No pudimos verificar el pedido. Reintentá cuando el catálogo esté disponible.');
      }finally{
        S.checkoutBusy=false;el.disabled=false;
      }
      break;
    }
    case 'pdp-img': { const modal=$('#productModal'); const main=$('.pdp-main-img img'); if(main)main.src=img(val); $$('.pdp-thumbs button').forEach(b=>b.classList.toggle('active',b.dataset.val===val)); break; }
    case 'pdp-variant': if(S.pdp){S.pdp.variant=val;renderPDP();} break;
    case 'pdp-tab': if(S.pdp){S.pdp.tab=val;renderPDP();} break;
    case 'pdp-qty': if(S.pdp){
      const available=cartAvailability({id:S.pdp.id,variant:S.pdp.variant,kind:'product'});
      S.pdp.qty=Math.max(1,Math.min(available.ok?available.max:1,S.pdp.qty+Number(val)));
      renderPDP();
    }break;
    case 'pdp-add': pdpAdd(); break;
    case 'pdp-wa': { if(!S.pdp)break; const p=DB.products.find(x=>x.id===S.pdp.id);if(!p)break;const item={id:p.id,variant:S.pdp.variant,kind:'product'};const available=cartAvailability(item);if(!available.ok){toast(available.reason);break;}if(addToCart(p.id,S.pdp.variant,S.pdp.qty,'product')){closeAll();openCart();toast('Revisá el pedido y finalizá por WhatsApp para verificar precios y existencias.');}break; }
    /* admin */
    case 'admin-tab': S.adminTab=val; renderAdmin(); break;
    case 'product-new': showAdminModal(productForm(null)); break;
    case 'product-edit': showAdminModal(productForm(DB.products.find(p=>p.id===id))); break;
    case 'product-toggle': { const p=DB.products.find(x=>x.id===id); p.active=p.active===false; saveDB(); renderAdminContent(); renderStore(); toast(p.active?'Producto activado':'Producto ocultado'); break; }
    case 'product-del': { if(el.dataset.confirmed!=='1'){el.dataset.confirmed='1';el.textContent='¿Confirmar?';return;} DB.products=DB.products.filter(p=>p.id!==id); cart=cart.filter(c=>c.id!==id);saveCart();saveDB();renderAdminContent();renderStore();toast('Producto eliminado');break; }
    case 'cat-new': showAdminModal(categoryForm(null)); break;
    case 'cat-edit': showAdminModal(categoryForm(DB.categories.find(c=>c.id===id))); break;
    case 'cat-del': { if(el.dataset.confirmed!=='1'){el.dataset.confirmed='1';el.textContent='¿Confirmar?';return;} DB.categories=DB.categories.filter(c=>c.id!==id);saveDB();renderAdminContent();renderStore();toast('Categoría eliminada');break; }
    case 'inventory-save': { $$('[data-stock]').forEach(inp=>{ const p=DB.products.find(x=>x.id===inp.dataset.stock); if(!p)return; const n=Math.max(0,Number(inp.value)||0); if(inp.dataset.variant!==undefined){const v=p.variants[Number(inp.dataset.variant)];if(v)v.stock=n;} else p.stock=n; }); const bic=DB.products.find(p=>p.id==='p2'); if(bic&&bic.variants)bic.stock=bic.variants.reduce((a,v)=>a+Number(v.stock),0); saveDB();renderAdminContent();renderAdmin();renderStore();toast('Inventario actualizado');break; }
    case 'promo-new': showAdminModal(promoForm(null)); break;
    case 'promo-edit': showAdminModal(promoForm((DB.promotions||[]).find(p=>p.id===id))); break;
    case 'promo-toggle': { const p=DB.promotions.find(x=>x.id===id);p.active=!p.active;saveDB();renderAdminContent();renderStore();toast(p.active?'Promoción activada':'Promoción pausada');break; }
    case 'promo-del': { DB.promotions=DB.promotions.filter(p=>p.id!==id);saveDB();renderAdminContent();renderStore();toast('Promoción eliminada');break; }
    case 'post-new': showAdminModal(postForm(null)); break;
    case 'post-edit': showAdminModal(postForm((DB.posts||[]).find(p=>p.id===id))); break;
    case 'post-toggle': { const p=DB.posts.find(x=>x.id===id);p.active=p.active===false;saveDB();renderAdminContent();renderStore();break; }
    case 'post-del': { DB.posts=DB.posts.filter(p=>p.id!==id);saveDB();renderAdminContent();renderStore();toast('Artículo eliminado');break; }
    case 'variant-add': { const box=$('#variantRows'); if(!box)break; if(box.querySelector('small'))box.innerHTML=''; box.insertAdjacentHTML('beforeend',variantRowHTML(null)); break; }
    case 'variant-del': el.closest('.variant-row').remove(); break;
    case 'reset-demo': { if(el.dataset.confirmed!=='1'){el.dataset.confirmed='1';el.textContent='¿CONFIRMAR RESTAURACIÓN?';return;} DB=DEFAULT();saveDB();ST.del('inmed_cart_v1');cart=[];renderAdminContent();renderStore();toast('Datos demo restaurados');break; }
  }
});


/* --- optimizador de imágenes: JPG/PNG/WebP -> WebP --- */
async function optimizeImageToWebP(file, opts={}){
  if(!file || !/^image\//i.test(file.type||'')) throw new Error('Archivo de imagen inválido');
  const maxW=Number(opts.maxW)||1600, maxH=Number(opts.maxH)||1600, quality=Number(opts.quality)||0.88;
  const url=URL.createObjectURL(file);
  try{
    const source=await new Promise((resolve,reject)=>{
      const im=new Image();
      im.onload=()=>resolve(im);
      im.onerror=()=>reject(new Error('No se pudo leer la imagen'));
      im.src=url;
    });
    const ow=source.naturalWidth||source.width, oh=source.naturalHeight||source.height;
    const scale=Math.min(1,maxW/ow,maxH/oh);
    const w=Math.max(1,Math.round(ow*scale)), h=Math.max(1,Math.round(oh*scale));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext('2d',{alpha:true});
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(source,0,0,w,h);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('El navegador no pudo generar WebP')),'image/webp',quality));
    const dataUrl=await new Promise((resolve,reject)=>{
      const rd=new FileReader(); rd.onload=()=>resolve(rd.result); rd.onerror=reject; rd.readAsDataURL(blob);
    });
    const saved=Math.max(0,Math.round((1-blob.size/Math.max(1,file.size))*100));
    return {dataUrl,blob,width:w,height:h,originalWidth:ow,originalHeight:oh,originalBytes:file.size,webpBytes:blob.size,saved};
  } finally { URL.revokeObjectURL(url); }
}
const fmtBytes=n=>{n=Number(n)||0;if(n<1024)return n+' B';if(n<1048576)return (n/1024).toFixed(0)+' KB';return (n/1048576).toFixed(2)+' MB';};
function mediaResultHTML(r,label){
  return '<div style="margin-top:8px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);font-size:12px;line-height:1.5">'+
    '<b>'+esc(label||'Imagen optimizada')+'</b><br>'+
    r.originalWidth+'×'+r.originalHeight+' px · '+fmtBytes(r.originalBytes)+' → <b>WebP '+r.width+'×'+r.height+' px · '+fmtBytes(r.webpBytes)+'</b>'+
    (r.saved>0?' · <span style="color:#2A9D8F;font-weight:700">'+r.saved+'% menos</span>':'')+
    '</div>';
}
let pendingProductWebP=null, pendingHeroWebP=null;

/* --- formularios --- */
document.addEventListener('submit',async e=>{
  const f=e.target;
  if(f.id==='loginForm'){
    e.preventDefault();
    toast('Panel administrativo deshabilitado en el build público.');
    return;
  }
  if(f.id==='newsForm'){
    e.preventDefault();
    const email=$('#newsEmail').value.trim();
    if(!email)return;
    const request='Hola InMed, quiero solicitar la suscripción a las novedades y consejos clínicos por correo electrónico. Mi email es: '+email+'. ¿Podés confirmar la inscripción y cómo solicitar la baja?';
    if(openWA(request)){f.reset();toast('Se abrió WhatsApp. Enviá el mensaje para solicitar tu inscripción.');}
    return;
  }
  const kind=f.dataset.form; if(!kind) return;
  e.preventDefault();
  const d=new FormData(f), g=k=>(d.get(k)||'').toString().trim();
  if(kind==='product'){
    const pid=g('id'), ex=pid?DB.products.find(p=>p.id===pid):null;
    const rows=$$('.variant-row',f).map(r=>({name:r.querySelector('[name=v_name]').value.trim(),color:r.querySelector('[name=v_color]').value.trim(),img:r.querySelector('[name=v_img]').value,price:Number(r.querySelector('[name=v_price]').value)||0,stock:Number(r.querySelector('[name=v_stock]').value)||0,sku:r.querySelector('[name=v_sku]').value.trim()})).filter(v=>v.name);
    const upload=f.querySelector('[name=upload]').files[0];
    const base={name:g('name'),cat:g('cat'),sku:g('sku'),short:g('short'),desc:g('desc'),price:Number(g('price'))||0,promo:g('promo')?Number(g('promo')):null,stock:Number(g('stock'))||0,active:d.get('active')==='1',freeShip:!!d.get('freeShip'),img:g('img'),variants:rows,seo:{title:g('seoTitle'),slug:g('slug'),desc:g('seoDesc')}};
    const apply=()=>{
      if(ex) Object.assign(ex,base); else DB.products.push(Object.assign({id:uid(),rating:5,reviews:0,tags:[],featured:false,features:base.desc?[base.short||'Producto InMed']:[],includes:[],specs:{SKU:base.sku}},base));
      if(rows.length&&ex){ex.stock=rows.reduce((a,v)=>a+v.stock,0);}
      saveDB();closeAll();renderAdminContent();renderStore();toast(ex?'Producto actualizado':'Producto creado');
    };
    if(upload){
      try{
        const r=pendingProductWebP&&pendingProductWebP.file===upload?pendingProductWebP.result:await optimizeImageToWebP(upload,{maxW:1600,maxH:1600,quality:.88});
        const key='custom_'+Date.now(); IMG[key]=r.dataUrl; DB.customImages=DB.customImages||{}; DB.customImages[key]=r.dataUrl; base.img=key;
        toast('Imagen WebP optimizada: '+fmtBytes(r.originalBytes)+' → '+fmtBytes(r.webpBytes));
        pendingProductWebP=null; apply();
      }catch(err){ toast('No se pudo optimizar la imagen: '+err.message); }
    } else apply();
  }
  if(kind==='category'){
    const old=g('id'), ex=DB.categories.find(c=>c.id===old);
    const obj={id:g('id'),name:g('name'),desc:g('desc'),img:g('img')};
    if(ex){ const prev=ex.id; Object.assign(ex,obj); DB.products.forEach(p=>{if(p.cat===prev)p.cat=obj.id;}); }
    else DB.categories.push(obj);
    saveDB();closeAll();renderAdminContent();renderStore();toast('Categoría guardada');
  }
  if(kind==='promotion'){
    const pid=g('id'), ex=(DB.promotions||[]).find(p=>p.id===pid);
    const obj={id:pid||uid(),name:g('name'),percent:Number(g('percent'))||0,start:g('start'),end:g('end'),productIds:d.getAll('pid').map(String),active:!!d.get('active')};
    if(ex) Object.assign(ex,obj); else DB.promotions.push(obj);
    saveDB();closeAll();renderAdminContent();renderStore();toast('Promoción guardada · precios actualizados');
  }
  if(kind==='post'){
    const pid=g('id'), ex=(DB.posts||[]).find(p=>p.id===pid);
    const obj={title:g('title'),cat:g('cat'),slug:g('slug')||slug(g('title')),summary:g('summary'),img:g('img'),active:!!d.get('active'),date:ex?ex.date:todayStr()};
    if(ex) Object.assign(ex,obj); else DB.posts.unshift(Object.assign({id:uid()},obj));
    saveDB();closeAll();renderAdminContent();renderStore();toast('Artículo guardado');
  }
  if(kind==='banners'){
    Object.assign(DB.banners,{announcement:g('announcement'),showAnnouncement:!!d.get('showAnnouncement'),heroTitle:g('heroTitle'),heroSub:g('heroSub'),heroBadge:g('heroBadge'),showHeroBadge:!!d.get('showHeroBadge'),showOffer:!!d.get('showOffer'),offerTitle:g('offerTitle'),offerText:g('offerText'),offerEnd:g('offerEnd'),newsText:g('newsText')});
    const heroUpload=f.querySelector('[name=heroUpload]')&&f.querySelector('[name=heroUpload]').files[0];
    if(heroUpload){
      try{
        const r=pendingHeroWebP&&pendingHeroWebP.file===heroUpload?pendingHeroWebP.result:await optimizeImageToWebP(heroUpload,{maxW:1920,maxH:720,quality:.88});
        DB.customImages=DB.customImages||{}; DB.customImages.hero=r.dataUrl; IMG.hero=r.dataUrl; pendingHeroWebP=null;
        toast('Banner WebP optimizado: '+fmtBytes(r.originalBytes)+' → '+fmtBytes(r.webpBytes));
      }catch(err){ toast('No se pudo optimizar el banner: '+err.message); }
    }
    saveDB();renderAdminContent();renderStore();toast('Banners actualizados');
  }
  if(kind==='settings'){
    Object.assign(DB.settings,{storeName:g('storeName'),whatsapp:g('whatsapp'),phone:g('phone'),email:g('email'),freeShipMin:Number(g('freeShipMin'))||0,footer:g('footer'),copy:g('copy')});
    saveDB();renderAdminContent();renderStore();toast('Configuración guardada');
  }
});
document.addEventListener('change',async e=>{
  const t=e.target;
  if(t.matches('[name="upload"]') && t.files && t.files[0]){
    const box=t.parentElement.querySelector('[data-media-result="product"]');
    if(box) box.innerHTML='<small>Optimizando a WebP…</small>';
    try{
      const r=await optimizeImageToWebP(t.files[0],{maxW:1600,maxH:1600,quality:.88});
      pendingProductWebP={file:t.files[0],result:r};
      if(box) box.innerHTML=mediaResultHTML(r,'Foto de producto');
      if(Math.abs((r.originalWidth/r.originalHeight)-1)>.08) toast('La foto no es 1:1; se conservará sin deformar.');
    }catch(err){ if(box) box.innerHTML='<small style="color:#D90429">'+esc(err.message)+'</small>'; }
  }
  if(t.matches('[name="heroUpload"]') && t.files && t.files[0]){
    const box=t.parentElement.querySelector('[data-media-result="hero"]');
    if(box) box.innerHTML='<small>Optimizando a WebP…</small>';
    try{
      const r=await optimizeImageToWebP(t.files[0],{maxW:1920,maxH:720,quality:.88});
      pendingHeroWebP={file:t.files[0],result:r};
      if(box) box.innerHTML=mediaResultHTML(r,'Hero / banner');
      if(Math.abs((r.originalWidth/r.originalHeight)-(8/3))>.15) toast('La proporción no es 8:3; el panel no deformará la imagen.');
    }catch(err){ if(box) box.innerHTML='<small style="color:#D90429">'+esc(err.message)+'</small>'; }
  }
  if(t.dataset.leadStatus){ const l=(DB.leads||[]).find(x=>x.id===t.dataset.leadStatus); if(l){l.status=t.value;saveDB();toast('Estado actualizado');} }
});
document.addEventListener('input',e=>{
  if(e.target.id==='searchInput'){
    const q=norm(e.target.value.trim()), drop=$('#searchDrop');
    if(!q){drop.hidden=true;return;}
    const hits=activeProducts().filter(p=>norm(p.name+' '+p.cat+' '+p.short).indexOf(q)>-1).slice(0,6);
    drop.innerHTML=hits.length?hits.map(p=>`<div class="search-item" data-act="open-pdp" data-id="${p.id}"><img src="${img(p.img)}" alt=""><div><strong>${esc(p.name)}</strong><small>${esc(p.cat)} · ${gs(priceOf(p).cur)}</small></div></div>`).join(''):'<div class="search-empty">Sin resultados. Probá con otra palabra.</div>';
    drop.hidden=false;
  }
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeAll();$('#searchDrop').hidden=true;}
  if(e.key==='Enter'&&e.target.id==='searchInput'){
    e.preventDefault(); S.query=norm(e.target.value.trim()); S.filter='search';S.visible=8;
    $('#searchDrop').hidden=true; renderFilters();renderProducts();scrollTo('productos');
  }
});
document.addEventListener('click',e=>{
  if(!e.target.closest('.search-wrap')) $('#searchDrop').hidden=true;
  if(e.target.id==='overlay') closeAll();
  if(e.target.id==='adminModal'&&S.mode!=='admin') closeInfo();
  if(e.target.id==='adminModal'&&S.mode==='admin') closeInfo();
});

/* --- enlaces y navegación --- */
$('#btnCart').addEventListener('click',openCart);
$('#heroWhats').addEventListener('click',()=>openWA('Hola InMed 👋, quiero ver el catálogo y recibir asesoría para elegir mi equipamiento médico.'));
$('#faqWhats').addEventListener('click',()=>openWA('Hola InMed 👋, tengo una consulta sobre los productos y los envíos. ¿Podés ayudarme?'));
$('#waFloat').addEventListener('click',e=>{e.preventDefault();openWA('Hola InMed 👋, quiero hacer una consulta sobre el catálogo.');});
$('#footerWa').addEventListener('click',e=>{e.preventDefault();openWA('Hola InMed 👋, quiero hacer una consulta.');});
$('#footerContacto').addEventListener('click',e=>{e.preventDefault();openInfo('Contacto InMed','<p>WhatsApp: <b>'+esc(DB.settings.phone)+'</b></p><p>Correo: <b>'+esc(DB.settings.email)+'</b></p><p>Asunción, Paraguay · Lunes a viernes de 08:00 a 18:00.</p><p>Envíos a todo el país.</p>');});
$('#footerNosotros').addEventListener('click',e=>{e.preventDefault();openInfo('Sobre InMed','<p>'+esc(DB.settings.footer)+'</p><p>Trabajamos con equipamiento original para estudiantes, profesionales y cuidado en casa. Nuestra propuesta combina catálogo curado, contenido educativo y atención cercana por WhatsApp.</p>');});
$('#bicAdd').addEventListener('click',()=>{const p=featuredProduct();if(!p)return;openWA('Hola InMed, quiero consultar por '+p.name+' (SKU '+(p.sku||'')+') a '+gs(priceOf(p).cur)+'. ¿Podés confirmar disponibilidad y entrega?');});
$('#bicWhats').addEventListener('click',()=>{const p=featuredProduct();if(!p)return;openWA('Hola InMed, quiero consultar por '+p.name+' (SKU '+(p.sku||'')+') a '+gs(priceOf(p).cur)+'. ¿Podés confirmar precio y disponibilidad?',{text:p.name,total:priceOf(p).cur});});
$('#loadMore').addEventListener('click',()=>{S.visible+=4;renderProducts();});
$('#seeAll').addEventListener('click',e=>{e.preventDefault();setFilter('all',true);});
$('#blogAll').addEventListener('click',e=>{e.preventDefault();S.allPosts=!S.allPosts;renderPosts();});
$('#offerBtn').addEventListener('click',e=>{e.preventDefault();setFilter('ofertas',true);});
$$('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();scrollTo(a.dataset.scroll);}));
$('#navLinks').addEventListener('click',e=>{
  const a=e.target.closest('a[data-cat]');if(!a)return;
  e.preventDefault();
  if(a.dataset.cat==='all'){setFilter('all',false);window.scrollTo({top:0,behavior:'smooth'});}
  else setFilter(a.dataset.cat,true);
});
$('#adminLogout').addEventListener('click',()=>{S.adminAuth=false;renderAdmin();});
$('#adminExit').addEventListener('click',()=>{location.hash='#/';});

/* --- router --- */
function route(){
  const mode='store';
  if(location.hash.indexOf('#/admin')===0){ history.replaceState(null,'',location.pathname+location.search+'#/'); }
  if(mode===S.mode) return;
  S.mode=mode;
  $('#store').hidden=false; $('#admin').hidden=true;
  $('#waFloat').style.display='';
  closeAll();
  renderStore();window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
async function boot(){
 const ok=await syncRemoteStore();
 S.catalogReady=ok;
 let cartAdjusted=false;
 if(ok){cartAdjusted=reconcileCart();}
 else {
  // Never sell from hardcoded or locally cached demonstration prices when the source of truth is offline.
  DB.products=[];DB.categories=[];DB.combos=[];DB.promotions=[];DB.posts=[];
  if(DB.banners){DB.banners.showOffer=false;DB.banners.showHeroBadge=false;}
 }
 route();
 if(!ok){
  const notice=document.createElement('div');
  notice.setAttribute('role','alert');
  notice.style.cssText='padding:14px 18px;background:#fff7ed;color:#7c2d12;text-align:center;font-weight:700;border-bottom:1px solid #fed7aa;';
  notice.textContent='Catálogo temporalmente indisponible. No mostramos precios ni existencias sin confirmación. ';
  const button=document.createElement('button');
  button.type='button';button.textContent='REINTENTAR';button.style.cssText='margin-left:10px;padding:7px 12px;border:1px solid #7c2d12;border-radius:8px;background:white;cursor:pointer';
  button.addEventListener('click',()=>location.reload());
  notice.appendChild(button);$('#store').prepend(notice);
 }else if(cartAdjusted){toast('Actualizamos el pedido según el stock disponible.');}
 setInterval(renderCountdown,1000);
}
boot();
})();
