import{s as X}from"./index-CUZnih0P.js";import{H as F,I as U,a as p,b as m,J as I,d as n,_ as Y,v as ee,h as te,j as h,c as ne,K as oe,L as R,m as r,B as se,f as B,l as _,t as b,g as V,y as D,G as ae,s as re,p as ie}from"./index-CwxAHeh0.js";import{s as le}from"./index-BnlXZZ-p.js";import{s as ce}from"./index-Leh5VfIo.js";import{s as de}from"./index-DR0OeXWp.js";import{s as ue}from"./index-jlPcZyjB.js";import{H as $,a as O}from"./html5-qrcode-scanner-BpgX_mmv.js";import"./index-CG9utJNp.js";import"./index-BYqmCnGN.js";import"./index-p83LbZBz.js";import"./index-DR-2DceU.js";import"./index-CVb43-Ud.js";import"./index-dDmuHCYp.js";import"./index-DV899jIX.js";import"./index-D3_VH-6C.js";import"./index-D6wZEYqR.js";import"./index-B2BS4eAZ.js";import"./index-DOsW6FFu.js";import"./index-Cv0HLuAJ.js";import"./index-DU8ei3a8.js";var pe=F.extend({name:"columngroup"}),me={name:"BaseColumnGroup",extends:U,props:{type:{type:String,default:null}},style:pe,provide:function(){return{$pcColumnGroup:this,$parentInstance:this}}},fe={name:"ColumnGroup",extends:me,inheritAttrs:!1,inject:["$columnGroups"],mounted:function(){var a;(a=this.$columnGroups)===null||a===void 0||a.add(this.$)},unmounted:function(){var a;(a=this.$columnGroups)===null||a===void 0||a.delete(this.$)},render:function(){return null}},ge={name:"Row",extends:U,inject:["$rows"],mounted:function(){var a;(a=this.$rows)===null||a===void 0||a.add(this.$)},unmounted:function(){var a;(a=this.$rows)===null||a===void 0||a.delete(this.$)},render:function(){return null}},ve=({dt:o})=>`
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
`,he={root:"p-progressspinner",spin:"p-progressspinner-spin",circle:"p-progressspinner-circle"},ye=F.extend({name:"progressspinner",style:ve,classes:he}),_e={name:"BaseProgressSpinner",extends:U,props:{strokeWidth:{type:String,default:"2"},fill:{type:String,default:"none"},animationDuration:{type:String,default:"2s"}},style:ye,provide:function(){return{$pcProgressSpinner:this,$parentInstance:this}}},L={name:"ProgressSpinner",extends:_e,inheritAttrs:!1,computed:{svgStyle:function(){return{"animation-duration":this.animationDuration}}}},be=["fill","stroke-width"];function $e(o,a,G,g,T,i){return p(),m("div",I({class:o.cx("root"),role:"progressbar"},o.ptmi("root")),[(p(),m("svg",I({class:o.cx("spin"),viewBox:"25 25 50 50",style:i.svgStyle},o.ptm("spin")),[n("circle",I({class:o.cx("circle"),cx:"50",cy:"50",r:"20",fill:o.fill,"stroke-width":o.strokeWidth,strokeMiterlimit:"10"},o.ptm("circle")),null,16,be)],16))],16)}L.render=$e;const we={class:"escaneo-wrap"},Se={class:"escaneo-card"},ke={key:0,class:"escaneo-camera-wrap"},xe={key:0,class:"escaneo-qr-loading"},Te={class:"escaneo-upload-row"},Ce={key:0,class:"escaneo-card escaneo-loading"},Ee={style:{"margin-top":"1rem"}},Ae={key:1,class:"escaneo-card"},Ne={class:"escaneo-product-header"},Be={class:"escaneo-product-info"},De={class:"escaneo-product-title"},Pe={class:"escaneo-product-meta"},Ie={key:0},Oe={class:"escaneo-price-block"},Ue={key:0,class:"escaneo-price-offer-wrap"},Ge={class:"escaneo-price-old"},Me={class:"escaneo-price-offer"},Re={key:1,class:"escaneo-price-main"},Ve=6e3,Fe={__name:"EscaneoProducto",setup(o){const a=ee(),G=te(),g=h(""),T=h(!1),i=h(null),y=h([]),w=h({piso:0,almacen:0,cedis:0,total:0}),S=h(!1),v=h(!1),M=h(!0),H=ne(()=>`TOTAL (${y.value.length} tienda${y.value.length===1?"":"s"})`);let d=null;const q=[$.EAN_13,$.EAN_8,$.CODE_128,$.UPC_A,$.UPC_E,$.CODE_39,$.QR_CODE];function P(t){return t==null?"—":"$"+Number(t).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}function C(t){return t==null||isNaN(t)?"—":Number(t).toLocaleString("en-US",{maximumFractionDigits:2})}function f(t){a.add({severity:"error",summary:"Error",detail:t,life:4e3})}function E(t){a.add({severity:"warn",summary:"Atención",detail:t,life:4e3})}function z(t){if(!t)return"";let e=String(t).trim();return e=e.replace(/^[\[\]][A-Za-z]\d*\s*/,""),e=e.replace(/^\[[A-Za-z0-9]+\]\s*/,""),e.trim()}async function A(){if(!G.token){E("No hay sesión activa. Inicia sesión en /v1/.");return}const t=z(g.value);if(!t){E("Ingresa un código o código de barras.");return}g.value=t,i.value=null,y.value=[],w.value={piso:0,almacen:0,cedis:0,total:0},T.value=!0;try{const l=(await ie.get("/escaneo-producto/"+encodeURIComponent(t))).data;i.value=l,y.value=l.tiendas||[];let s=0,u=0,k=0,x=0;for(const c of y.value)s+=c.piso||0,u+=c.almacen||0,k+=c.cedis||0,x+=c.total||0;w.value={piso:s,almacen:u,cedis:k,total:x}}catch(e){if(e.response){const l=e.response.status;l===401||l===403?f("Sesión expirada o sin permisos. Vuelve a iniciar sesión."):l===404?E("No se encontró ningún producto con código "+t+"."):f("Error del servidor: HTTP "+l)}else f("No se pudo conectar: "+e.message)}finally{T.value=!1}}async function W(){if(S.value){await N();return}if(typeof O>"u"){f("Libreria de camara no disponible en este navegador.");return}if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){M.value=!1,f('Tu navegador no expone la API de camara (getUserMedia). Usa el boton "Subir imagen" para escanear desde un archivo.');return}v.value=!0,S.value=!0,await ae();const t="escaneo-qr-host";let e=!1;const l=setTimeout(()=>{e=!0,E('La camara tarda en inicializar. Si sigue en negro, usa el boton "Subir imagen" abajo.')},Ve);try{d=new O(t),await d.start({facingMode:"environment"},{fps:10,qrbox:250,formatsToSupport:q},s=>{g.value=s,N(),A()},()=>{}),clearTimeout(l),v.value=!1}catch(s){clearTimeout(l),await N(),v.value=!1;const u=String((s==null?void 0:s.message)||s||"");/Permission|NotAllowedError|denied/i.test(u)?f('El navegador bloqueo el acceso a la camara. Habilita los permisos de camara para este sitio y reintenta. Tambien puedes usar "Subir imagen".'):/NotFoundError|device|not.*found/i.test(u)?(M.value=!1,f('No se detecto ninguna camara en este dispositivo. Usa "Subir imagen" para escanear un barcode desde un archivo.')):f("No se pudo abrir la camara: "+(u||"error desconocido")+'. Prueba con "Subir imagen".')}finally{(!d||d&&!d.isScanning)&&(v.value=!1),e&&(v.value=!1)}}async function N(){if(d){try{await d.stop()}catch{}try{await d.clear()}catch{}d=null}S.value=!1,v.value=!1}async function j(t){var l;const e=(l=t.target.files)==null?void 0:l[0];if(e)try{d&&await N();const s="escaneo-file-temp-"+Date.now(),u=document.createElement("div");u.id=s,u.style.display="none",document.body.appendChild(u);try{const x=await new O(s).scanFile(e,!0);g.value=x,A()}finally{try{await scanner.clear()}catch{}document.body.removeChild(u)}}catch(s){f("No se pudo leer el codigo de la imagen: "+((s==null?void 0:s.message)||s))}finally{t.target.value=""}}return oe(async()=>{if(d){try{await d.stop()}catch{}try{await d.clear()}catch{}d=null}}),(t,e)=>{const l=ue,s=re,u=L,k=de,x=ce,c=le,K=ge,Q=fe,Z=X;return p(),m("div",we,[n("section",Se,[e[4]||(e[4]=n("div",{class:"escaneo-header"},[n("h2",{class:"escaneo-title"},"Escaneo de producto")],-1)),n("form",{class:"escaneo-search",onSubmit:R(A,["prevent"])},[r(l,{modelValue:g.value,"onUpdate:modelValue":e[0]||(e[0]=J=>g.value=J),placeholder:"Escanea o escribe el código (Enter para buscar)",class:"escaneo-input",onKeyup:se(R(A,["prevent"]),["enter"])},null,8,["modelValue","onKeyup"]),r(s,{type:"submit",label:"Buscar"}),r(s,{type:"button",label:S.value?"Detener cámara":"Escanear",severity:S.value?"danger":"secondary",loading:v.value,onClick:W},null,8,["label","severity","loading"])],32),S.value?(p(),m("div",ke,[v.value?(p(),m("div",xe,[r(u,{style:{width:"50px",height:"50px"},strokeWidth:"4"}),e[1]||(e[1]=n("span",null,"Inicializando camara...",-1))])):B("",!0),e[2]||(e[2]=n("div",{id:"escaneo-qr-host",class:"escaneo-qr-host"},null,-1))])):B("",!0),n("div",Te,[e[3]||(e[3]=n("label",{for:"escaneo-file",class:"escaneo-upload-label"},[n("i",{class:"pi pi-image"}),_(" Escanear desde imagen (si la camara no funciona) ")],-1)),n("input",{id:"escaneo-file",type:"file",accept:"image/*",capture:"environment",class:"escaneo-upload-input",onChange:j},null,32)])]),T.value?(p(),m("section",Ce,[r(u,{style:{width:"50px",height:"50px"},strokeWidth:"4"}),n("p",Ee,[e[5]||(e[5]=_(" Buscando ")),n("code",null,b(g.value),1),e[6]||(e[6]=_("… "))])])):i.value?(p(),m("section",Ae,[n("div",Ne,[n("div",Be,[n("h3",De,b(i.value.descripcion||"(sin descripción)"),1),n("div",Pe,[n("span",null,[e[7]||(e[7]=n("strong",null,"Código:",-1)),e[8]||(e[8]=_()),n("code",null,b(i.value.codigo||"—"),1)]),i.value.codigoBarra?(p(),m("span",Ie,[e[9]||(e[9]=n("strong",null,"Barra:",-1)),e[10]||(e[10]=_()),n("code",null,b(i.value.codigoBarra),1)])):B("",!0)])]),n("div",Oe,[i.value.enOferta&&i.value.precioOferta&&i.value.precio1?(p(),m("div",Ue,[n("div",Ge,[n("s",null,b(P(i.value.precio1)),1)]),n("div",Me,[_(b(P(i.value.precioOferta))+" ",1),e[11]||(e[11]=n("span",{class:"escaneo-badge"},"Oferta",-1))])])):(p(),m("div",Re,b(P(i.value.precio1)),1))])]),r(k),e[13]||(e[13]=n("h4",{class:"escaneo-section-title"},"Disponibilidad por tienda",-1)),y.value.length===0?(p(),V(x,{key:0,severity:"info",closable:!1},{default:D(()=>e[12]||(e[12]=[_(" El producto existe pero no se encontró inventario desglosado en la vista R3. ")])),_:1})):(p(),V(Z,{key:1,value:y.value,class:"escaneo-tiendas"},{default:D(()=>[r(c,{field:"departamento",header:"Tienda","header-style":"text-align:left"}),r(c,{field:"piso",header:"Piso","header-style":"text-align:right","body-style":"text-align:right"}),r(c,{field:"almacen",header:"Almacén","header-style":"text-align:right","body-style":"text-align:right"}),r(c,{field:"cedis",header:"Cedis","header-style":"text-align:right","body-style":"text-align:right"}),r(c,{field:"total",header:"Total","header-style":"text-align:right;font-weight:700","body-style":"text-align:right;font-weight:700"}),r(Q,{type:"footer"},{default:D(()=>[r(K,null,{default:D(()=>[r(c,{footer:H.value,"footer-style":"text-align:left;font-weight:700"},null,8,["footer"]),r(c,{footer:C(w.value.piso),"footer-style":"text-align:right"},null,8,["footer"]),r(c,{footer:C(w.value.almacen),"footer-style":"text-align:right"},null,8,["footer"]),r(c,{footer:C(w.value.cedis),"footer-style":"text-align:right"},null,8,["footer"]),r(c,{footer:C(w.value.total),"footer-style":"text-align:right;font-weight:700"},null,8,["footer"])]),_:1})]),_:1})]),_:1},8,["value"]))])):B("",!0)])}}},lt=Y(Fe,[["__scopeId","data-v-10b9eb68"]]);export{lt as default};
