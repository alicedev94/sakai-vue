import{s as X}from"./index-CAjX1LwW.js";import{G as F,H as G,a as d,b as m,I as O,d as n,_ as Y,p as ee,h as te,m as h,c as ne,J as oe,K as R,j as r,z as se,f as B,i as b,t as w,g as V,v as D,E as ae,s as re}from"./index-18hazH2F.js";import{s as ie}from"./index-BTqLOyt3.js";import{s as le}from"./index-DHdgr4Su.js";import{s as ce}from"./index-D_xtdvlr.js";import{s as ue}from"./index-CDmBXs9u.js";import{H as $,a as U}from"./html5-qrcode-scanner-BpgX_mmv.js";import"./index-WbIaz6rM.js";import"./index-Bm5QzyoQ.js";import"./index-0h0MS2T2.js";import"./index-cUYiCtvH.js";import"./index-G52WnAtL.js";import"./index-JvqqPqKx.js";import"./index-B8WkEvHs.js";import"./index-D0jGIdaC.js";import"./index-CquWkXwB.js";import"./index-BdNnIVrv.js";import"./index-DT5JSPqZ.js";import"./index-bZv6aFxA.js";import"./index-BpfcKxUp.js";var de=F.extend({name:"columngroup"}),pe={name:"BaseColumnGroup",extends:G,props:{type:{type:String,default:null}},style:de,provide:function(){return{$pcColumnGroup:this,$parentInstance:this}}},me={name:"ColumnGroup",extends:pe,inheritAttrs:!1,inject:["$columnGroups"],mounted:function(){var a;(a=this.$columnGroups)===null||a===void 0||a.add(this.$)},unmounted:function(){var a;(a=this.$columnGroups)===null||a===void 0||a.delete(this.$)},render:function(){return null}},fe={name:"Row",extends:G,inject:["$rows"],mounted:function(){var a;(a=this.$rows)===null||a===void 0||a.add(this.$)},unmounted:function(){var a;(a=this.$rows)===null||a===void 0||a.delete(this.$)},render:function(){return null}},ge=({dt:o})=>`
.p-progressspinner {
    position: relative;
    margin: 0 auto;
    width: 100px;
    height: 100px;
    display: inline-block;
}

.p-progressspinner::before {
    content: "";
    display: block;
    padding-top: 100%;
}

.p-progressspinner-spin {
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    animation: p-progressspinner-rotate 2s linear infinite;
}

.p-progressspinner-circle {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: 0;
    stroke: ${o("progressspinner.colorOne")};
    animation: p-progressspinner-dash 1.5s ease-in-out infinite, p-progressspinner-color 6s ease-in-out infinite;
    stroke-linecap: round;
}

@keyframes p-progressspinner-rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes p-progressspinner-dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124px;
    }
}
@keyframes p-progressspinner-color {
    100%,
    0% {
        stroke: ${o("progressspinner.colorOne")};
    }
    40% {
        stroke: ${o("progressspinner.colorTwo")};
    }
    66% {
        stroke: ${o("progressspinner.colorThree")};
    }
    80%,
    90% {
        stroke: ${o("progressspinner.colorFour")};
    }
}
`,ve={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},he=F.extend({name:"progressspinner",style:ge,classes:ve}),ye={name:"BaseProgressSpinner",extends:G,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:he,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},z={name:"ProgressSpinner",extends:ye,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},_e=["fill","stroke-width"];function be(o,a,P,g,y,i){return d(),m("div",O({class:o.cx("root"),role:"progressbar"},o.ptmi("root")),[(d(),m("svg",O({class:o.cx("spin"),viewBox:"25 25 50 50",style:i.svgStyle},o.ptm("spin")),[n("circle",O({class:o.cx("circle"),cx:"50",cy:"50",r:"20",fill:o.fill,"stroke-width":o.strokeWidth,strokeMiterlimit:"10"},o.ptm("circle")),null,16,_e)],16))],16)}z.render=be;const we={class:"escaneo-wrap"},$e={class:"escaneo-card"},ke={key:0,class:"escaneo-camera-wrap"},Se={key:0,class:"escaneo-qr-loading"},xe={class:"escaneo-upload-row"},Ee={key:0,class:"escaneo-card escaneo-loading"},Te={style:{"margin-top":"1rem"}},Ce={key:1,class:"escaneo-card"},Ae={class:"escaneo-product-header"},Ne={class:"escaneo-product-info"},Be={class:"escaneo-product-title"},De={class:"escaneo-product-meta"},Pe={key:0},Ie={class:"escaneo-price-block"},Oe={key:0,class:"escaneo-price-offer-wrap"},Ue={class:"escaneo-price-old"},Ge={class:"escaneo-price-offer"},Me={key:1,class:"escaneo-price-main"},Re=6e3,Ve={__name:"EscaneoProducto",setup(o){const a=ee(),P=te(),g=h(""),y=h(!1),i=h(null),_=h([]),k=h({piso:0,almacen:0,cedis:0,total:0}),S=h(!1),v=h(!1),M=h(!0),H=ne(()=>`TOTAL (${_.value.length} tienda${_.value.length===1?"":"s"})`);let c=null;const L=[$.EAN_13,$.EAN_8,$.CODE_128,$.UPC_A,$.UPC_E,$.CODE_39,$.QR_CODE];function I(t){return t==null?"—":"$"+Number(t).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function T(t){return t==null||isNaN(t)?"—":Number(t).toLocaleString("en-US",{maximumFractionDigits:2})}function f(t){a.add({severity:"error",summary:"Error",detail:t,life:4e3})}function C(t){a.add({severity:"warn",summary:"Atención",detail:t,life:4e3})}function j(t){if(!t)return"";let e=String(t).trim();return e=e.replace(/^[\[\]][A-Za-z]\d*\s*/,""),e=e.replace(/^\[[A-Za-z0-9]+\]\s*/,""),e.trim()}async function A(){if(!P.token){C("No hay sesión activa. Inicia sesión en /v1/.");return}const t=j(g.value);if(!t){C("Ingresa un código o código de barras.");return}g.value=t,i.value=null,_.value=[],k.value={piso:0,almacen:0,cedis:0,total:0},y.value=!0;try{const e=await fetch("/api/v1/escaneo-producto/"+encodeURIComponent(t),{headers:{Authorization:"Bearer "+P.token,Accept:"application/json"}});if(e.status===401||e.status===403){f("Sesión expirada o sin permisos. Vuelve a iniciar sesión."),y.value=!1;return}if(e.status===404){C("No se encontró ningún producto con código "+t+"."),y.value=!1;return}if(!e.ok){f("Error del servidor: HTTP "+e.status),y.value=!1;return}const p=await e.json();i.value=p,_.value=p.tiendas||[];let s=0,u=0,x=0,E=0;for(const l of _.value)s+=l.piso||0,u+=l.almacen||0,x+=l.cedis||0,E+=l.total||0;k.value={piso:s,almacen:u,cedis:x,total:E}}catch(e){f("No se pudo conectar: "+e.message)}finally{y.value=!1}}async function q(){if(S.value){await N();return}if(typeof U>"u"){f("Libreria de camara no disponible en este navegador.");return}if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){M.value=!1,f('Tu navegador no expone la API de camara (getUserMedia). Usa el boton "Subir imagen" para escanear desde un archivo.');return}v.value=!0,S.value=!0,await ae();const t="escaneo-qr-host";let e=!1;const p=setTimeout(()=>{e=!0,C('La camara tarda en inicializar. Si sigue en negro, usa el boton "Subir imagen" abajo.')},Re);try{c=new U(t),await c.start({facingMode:"environment"},{fps:10,qrbox:250,formatsToSupport:L},s=>{g.value=s,N(),A()},()=>{}),clearTimeout(p),v.value=!1}catch(s){clearTimeout(p),await N(),v.value=!1;const u=String((s==null?void 0:s.message)||s||"");/Permission|NotAllowedError|denied/i.test(u)?f('El navegador bloqueo el acceso a la camara. Habilita los permisos de camara para este sitio y reintenta. Tambien puedes usar "Subir imagen".'):/NotFoundError|device|not.*found/i.test(u)?(M.value=!1,f('No se detecto ninguna camara en este dispositivo. Usa "Subir imagen" para escanear un barcode desde un archivo.')):f("No se pudo abrir la camara: "+(u||"error desconocido")+'. Prueba con "Subir imagen".')}finally{(!c||c&&!c.isScanning)&&(v.value=!1),e&&(v.value=!1)}}async function N(){if(c){try{await c.stop()}catch{}try{await c.clear()}catch{}c=null}S.value=!1,v.value=!1}async function W(t){var p;const e=(p=t.target.files)==null?void 0:p[0];if(e)try{c&&await N();const s="escaneo-file-temp-"+Date.now(),u=document.createElement("div");u.id=s,u.style.display="none",document.body.appendChild(u);try{const E=await new U(s).scanFile(e,!0);g.value=E,A()}finally{try{await scanner.clear()}catch{}document.body.removeChild(u)}}catch(s){f("No se pudo leer el codigo de la imagen: "+((s==null?void 0:s.message)||s))}finally{t.target.value=""}}return oe(async()=>{if(c){try{await c.stop()}catch{}try{await c.clear()}catch{}c=null}}),(t,e)=>{const p=ue,s=re,u=z,x=ce,E=le,l=ie,K=fe,Q=me,Z=X;return d(),m("div",we,[n("section",$e,[e[4]||(e[4]=n("div",{class:"escaneo-header"},[n("h2",{class:"escaneo-title"},"Escaneo de producto")],-1)),n("form",{class:"escaneo-search",onSubmit:R(A,["prevent"])},[r(p,{modelValue:g.value,"onUpdate:modelValue":e[0]||(e[0]=J=>g.value=J),placeholder:"Escanea o escribe el código (Enter para buscar)",class:"escaneo-input",onKeyup:se(R(A,["prevent"]),["enter"])},null,8,["modelValue","onKeyup"]),r(s,{type:"submit",label:"Buscar"}),r(s,{type:"button",label:S.value?"Detener cámara":"Escanear",severity:S.value?"danger":"secondary",loading:v.value,onClick:q},null,8,["label","severity","loading"])],32),S.value?(d(),m("div",ke,[v.value?(d(),m("div",Se,[r(u,{style:{width:"50px",height:"50px"},strokeWidth:"4"}),e[1]||(e[1]=n("span",null,"Inicializando camara...",-1))])):B("",!0),e[2]||(e[2]=n("div",{id:"escaneo-qr-host",class:"escaneo-qr-host"},null,-1))])):B("",!0),n("div",xe,[e[3]||(e[3]=n("label",{for:"escaneo-file",class:"escaneo-upload-label"},[n("i",{class:"pi pi-image"}),b(" Escanear desde imagen (si la camara no funciona) ")],-1)),n("input",{id:"escaneo-file",type:"file",accept:"image/*",capture:"environment",class:"escaneo-upload-input",onChange:W},null,32)])]),y.value?(d(),m("section",Ee,[r(u,{style:{width:"50px",height:"50px"},strokeWidth:"4"}),n("p",Te,[e[5]||(e[5]=b(" Buscando ")),n("code",null,w(g.value),1),e[6]||(e[6]=b("… "))])])):i.value?(d(),m("section",Ce,[n("div",Ae,[n("div",Ne,[n("h3",Be,w(i.value.descripcion||"(sin descripción)"),1),n("div",De,[n("span",null,[e[7]||(e[7]=n("strong",null,"Código:",-1)),e[8]||(e[8]=b()),n("code",null,w(i.value.codigo||"—"),1)]),i.value.codigoBarra?(d(),m("span",Pe,[e[9]||(e[9]=n("strong",null,"Barra:",-1)),e[10]||(e[10]=b()),n("code",null,w(i.value.codigoBarra),1)])):B("",!0)])]),n("div",Ie,[i.value.enOferta&&i.value.precioOferta&&i.value.precio1?(d(),m("div",Oe,[n("div",Ue,[n("s",null,w(I(i.value.precio1)),1)]),n("div",Ge,[b(w(I(i.value.precioOferta))+" ",1),e[11]||(e[11]=n("span",{class:"escaneo-badge"},"Oferta",-1))])])):(d(),m("div",Me,w(I(i.value.precio1)),1))])]),r(x),e[13]||(e[13]=n("h4",{class:"escaneo-section-title"},"Disponibilidad por tienda",-1)),_.value.length===0?(d(),V(E,{key:0,severity:"info",closable:!1},{default:D(()=>e[12]||(e[12]=[b(" El producto existe pero no se encontró inventario desglosado en la vista R3. ")])),_:1})):(d(),V(Z,{key:1,value:_.value,class:"escaneo-tiendas"},{default:D(()=>[r(l,{field:"departamento",header:"Tienda","header-style":"text-align:left"}),r(l,{field:"piso",header:"Piso","header-style":"text-align:right","body-style":"text-align:right"}),r(l,{field:"almacen",header:"Almacén","header-style":"text-align:right","body-style":"text-align:right"}),r(l,{field:"cedis",header:"Cedis","header-style":"text-align:right","body-style":"text-align:right"}),r(l,{field:"total",header:"Total","header-style":"text-align:right;font-weight:700","body-style":"text-align:right;font-weight:700"}),r(Q,{type:"footer"},{default:D(()=>[r(K,null,{default:D(()=>[r(l,{footer:H.value,"footer-style":"text-align:left;font-weight:700"},null,8,["footer"]),r(l,{footer:T(k.value.piso),"footer-style":"text-align:right"},null,8,["footer"]),r(l,{footer:T(k.value.almacen),"footer-style":"text-align:right"},null,8,["footer"]),r(l,{footer:T(k.value.cedis),"footer-style":"text-align:right"},null,8,["footer"]),r(l,{footer:T(k.value.total),"footer-style":"text-align:right;font-weight:700"},null,8,["footer"])]),_:1})]),_:1})]),_:1},8,["value"]))])):B("",!0)])}}},it=Y(Ve,[["__scopeId","data-v-3c1d8d9f"]]);export{it as default};
