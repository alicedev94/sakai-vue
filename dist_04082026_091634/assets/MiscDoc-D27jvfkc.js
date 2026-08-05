import{G as $,H as x,a as h,b as w,I as c,aM as E,ac as g,ad as y,d as r,Q as L,Z as M,an as Y,s as D,O as A,g as S,v as f,n as q,R as H,f as _,C as K,aI as k,j as n,m as V,o as W,J as O,F as G}from"./index-18hazH2F.js";import{s as N}from"./index-BALkdk34.js";import{s as j}from"./index-6pec7lG5.js";import{s as J}from"./index-zxBbmuXX.js";import{s as Z}from"./index-pi2420j4.js";import{s as Q}from"./index-noPe2e-C.js";var ee=({dt:t})=>`
.p-skeleton {
    overflow: hidden;
    background: ${t("skeleton.background")};
    border-radius: ${t("skeleton.border.radius")};
}

.p-skeleton::after {
    content: "";
    animation: p-skeleton-animation 1.2s infinite;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 1;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), ${t("skeleton.animation.background")}, rgba(255, 255, 255, 0));
}

[dir='rtl'] .p-skeleton::after {
    animation-name: p-skeleton-animation-rtl;
}

.p-skeleton-circle {
    border-radius: 50%;
}

.p-skeleton-animation-none::after {
    animation: none;
}

@keyframes p-skeleton-animation {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}

@keyframes p-skeleton-animation-rtl {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(-100%);
    }
}
`,te={root:{position:"relative"}},ne={root:function(e){var o=e.props;return["p-skeleton p-component",{"p-skeleton-circle":o.shape==="circle","p-skeleton-animation-none":o.animation==="none"}]}},se=$.extend({name:"skeleton",style:ee,classes:ne,inlineStyles:te}),re={name:"BaseSkeleton",extends:x,props:{shape:{type:String,default:"rectangle"},size:{type:String,default:null},width:{type:String,default:"100%"},height:{type:String,default:"1rem"},borderRadius:{type:String,default:null},animation:{type:String,default:"wave"}},style:se,provide:function(){return{$pcSkeleton:this,$parentInstance:this}}},T={name:"Skeleton",extends:re,inheritAttrs:!1,computed:{containerStyle:function(){return this.size?{width:this.size,height:this.size,borderRadius:this.borderRadius}:{width:this.width,height:this.height,borderRadius:this.borderRadius}}}};function ie(t,e,o,a,u,i){return h(),w("div",c({class:t.cx("root"),style:[t.sx("root"),i.containerStyle],"aria-hidden":"true"},t.ptmi("root")),null,16)}T.render=ie;var oe=({dt:t})=>`
.p-scrollpanel-content-container {
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 1;
    float: left;
}

.p-scrollpanel-content {
    height: calc(100% + calc(2 * ${t("scrollpanel.bar.size")}));
    width: calc(100% + calc(2 * ${t("scrollpanel.bar.size")}));
    padding-inline: 0 calc(2 * ${t("scrollpanel.bar.size")});
    padding-block: 0 calc(2 * ${t("scrollpanel.bar.size")});
    position: relative;
    overflow: auto;
    box-sizing: border-box;
    scrollbar-width: none;
}

.p-scrollpanel-content::-webkit-scrollbar {
    display: none;
}

.p-scrollpanel-bar {
    position: relative;
    border-radius: ${t("scrollpanel.bar.border.radius")};
    z-index: 2;
    cursor: pointer;
    opacity: 0;
    outline-color: transparent;
    background: ${t("scrollpanel.bar.background")};
    border: 0 none;
    transition: outline-color ${t("scrollpanel.transition.duration")}, opacity ${t("scrollpanel.transition.duration")};
}

.p-scrollpanel-bar:focus-visible {
    box-shadow: ${t("scrollpanel.bar.focus.ring.shadow")};
    outline: ${t("scrollpanel.barfocus.ring.width")} ${t("scrollpanel.bar.focus.ring.style")} ${t("scrollpanel.bar.focus.ring.color")};
    outline-offset: ${t("scrollpanel.barfocus.ring.offset")};
}

.p-scrollpanel-bar-y {
    width: ${t("scrollpanel.bar.size")};
    inset-block-start: 0;
}

.p-scrollpanel-bar-x {
    height: ${t("scrollpanel.bar.size")};
    inset-block-end: 0;
}

.p-scrollpanel-hidden {
    visibility: hidden;
}

.p-scrollpanel:hover .p-scrollpanel-bar,
.p-scrollpanel:active .p-scrollpanel-bar {
    opacity: 1;
}

.p-scrollpanel-grabbed {
    user-select: none;
}
`,ae={root:"p-scrollpanel p-component",contentContainer:"p-scrollpanel-content-container",content:"p-scrollpanel-content",barX:"p-scrollpanel-bar p-scrollpanel-bar-x",barY:"p-scrollpanel-bar p-scrollpanel-bar-y"},le=$.extend({name:"scrollpanel",style:oe,classes:ae}),ce={name:"BaseScrollPanel",extends:x,props:{step:{type:Number,default:5}},style:le,provide:function(){return{$pcScrollPanel:this,$parentInstance:this}}},C={name:"ScrollPanel",extends:ce,inheritAttrs:!1,initialized:!1,documentResizeListener:null,documentMouseMoveListener:null,documentMouseUpListener:null,frame:null,scrollXRatio:null,scrollYRatio:null,isXBarClicked:!1,isYBarClicked:!1,lastPageX:null,lastPageY:null,timer:null,outsideClickListener:null,data:function(){return{orientation:"vertical",lastScrollTop:0,lastScrollLeft:0}},mounted:function(){this.$el.offsetParent&&this.initialize()},updated:function(){!this.initialized&&this.$el.offsetParent&&this.initialize()},beforeUnmount:function(){this.unbindDocumentResizeListener(),this.frame&&window.cancelAnimationFrame(this.frame)},methods:{initialize:function(){this.moveBar(),this.bindDocumentResizeListener(),this.calculateContainerHeight()},calculateContainerHeight:function(){var e=getComputedStyle(this.$el),o=getComputedStyle(this.$refs.xBar),a=E(this.$el)-parseInt(o.height,10);e["max-height"]!=="none"&&a===0&&(this.$refs.content.offsetHeight+parseInt(o.height,10)>parseInt(e["max-height"],10)?this.$el.style.height=e["max-height"]:this.$el.style.height=this.$refs.content.offsetHeight+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)+"px")},moveBar:function(){var e=this;if(this.$refs.content){var o=this.$refs.content.scrollWidth,a=this.$refs.content.clientWidth,u=(this.$el.clientHeight-this.$refs.xBar.clientHeight)*-1;this.scrollXRatio=a/o;var i=this.$refs.content.scrollHeight,s=this.$refs.content.clientHeight,b=(this.$el.clientWidth-this.$refs.yBar.clientWidth)*-1;this.scrollYRatio=s/i,this.frame=this.requestAnimationFrame(function(){e.$refs.xBar&&(e.scrollXRatio>=1?(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&g(e.$refs.xBar,"p-scrollpanel-hidden")):(e.$refs.xBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&y(e.$refs.xBar,"p-scrollpanel-hidden"),e.$refs.xBar.style.cssText="width:"+Math.max(e.scrollXRatio*100,10)+"%; inset-inline-start:"+Math.abs(e.$refs.content.scrollLeft)/o*100+"%;bottom:"+u+"px;")),e.$refs.yBar&&(e.scrollYRatio>=1?(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","true"),!e.isUnstyled&&g(e.$refs.yBar,"p-scrollpanel-hidden")):(e.$refs.yBar.setAttribute("data-p-scrollpanel-hidden","false"),!e.isUnstyled&&y(e.$refs.yBar,"p-scrollpanel-hidden"),e.$refs.yBar.style.cssText="height:"+Math.max(e.scrollYRatio*100,10)+"%; top: calc("+e.$refs.content.scrollTop/i*100+"% - "+e.$refs.xBar.clientHeight+"px); inset-inline-end:"+b+"px;"))})}},onYBarMouseDown:function(e){this.isYBarClicked=!0,this.$refs.yBar.focus(),this.lastPageY=e.pageY,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&g(this.$refs.yBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","true"),!this.isUnstyled&&g(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onXBarMouseDown:function(e){this.isXBarClicked=!0,this.$refs.xBar.focus(),this.lastPageX=e.pageX,this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&g(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&g(document.body,"p-scrollpanel-grabbed"),this.bindDocumentMouseListeners(),e.preventDefault()},onScroll:function(e){this.lastScrollLeft!==e.target.scrollLeft?(this.lastScrollLeft=e.target.scrollLeft,this.orientation="horizontal"):this.lastScrollTop!==e.target.scrollTop&&(this.lastScrollTop=e.target.scrollTop,this.orientation="vertical"),this.moveBar()},onKeyDown:function(e){if(this.orientation==="vertical")switch(e.code){case"ArrowDown":{this.setTimer("scrollTop",this.step),e.preventDefault();break}case"ArrowUp":{this.setTimer("scrollTop",this.step*-1),e.preventDefault();break}case"ArrowLeft":case"ArrowRight":{e.preventDefault();break}}else if(this.orientation==="horizontal")switch(e.code){case"ArrowRight":{this.setTimer("scrollLeft",this.step),e.preventDefault();break}case"ArrowLeft":{this.setTimer("scrollLeft",this.step*-1),e.preventDefault();break}case"ArrowDown":case"ArrowUp":{e.preventDefault();break}}},onKeyUp:function(){this.clearTimer()},repeat:function(e,o){this.$refs.content[e]+=o,this.moveBar()},setTimer:function(e,o){var a=this;this.clearTimer(),this.timer=setTimeout(function(){a.repeat(e,o)},40)},clearTimer:function(){this.timer&&clearTimeout(this.timer)},onDocumentMouseMove:function(e){this.isXBarClicked?this.onMouseMoveForXBar(e):this.isYBarClicked?this.onMouseMoveForYBar(e):(this.onMouseMoveForXBar(e),this.onMouseMoveForYBar(e))},onMouseMoveForXBar:function(e){var o=this,a=e.pageX-this.lastPageX;this.lastPageX=e.pageX,this.frame=this.requestAnimationFrame(function(){o.$refs.content.scrollLeft+=a/o.scrollXRatio})},onMouseMoveForYBar:function(e){var o=this,a=e.pageY-this.lastPageY;this.lastPageY=e.pageY,this.frame=this.requestAnimationFrame(function(){o.$refs.content.scrollTop+=a/o.scrollYRatio})},onFocus:function(e){this.$refs.xBar.isSameNode(e.target)?this.orientation="horizontal":this.$refs.yBar.isSameNode(e.target)&&(this.orientation="vertical")},onBlur:function(){this.orientation==="horizontal"&&(this.orientation="vertical")},onDocumentMouseUp:function(){this.$refs.yBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&y(this.$refs.yBar,"p-scrollpanel-grabbed"),this.$refs.xBar.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&y(this.$refs.xBar,"p-scrollpanel-grabbed"),document.body.setAttribute("data-p-scrollpanel-grabbed","false"),!this.isUnstyled&&y(document.body,"p-scrollpanel-grabbed"),this.unbindDocumentMouseListeners(),this.isXBarClicked=!1,this.isYBarClicked=!1},requestAnimationFrame:function(e){var o=window.requestAnimationFrame||this.timeoutFrame;return o(e)},refresh:function(){this.moveBar()},scrollTop:function(e){var o=this.$refs.content.scrollHeight-this.$refs.content.clientHeight;e=e>o?o:e>0?e:0,this.$refs.content.scrollTop=e},timeoutFrame:function(e){setTimeout(e,0)},bindDocumentMouseListeners:function(){var e=this;this.documentMouseMoveListener||(this.documentMouseMoveListener=function(o){e.onDocumentMouseMove(o)},document.addEventListener("mousemove",this.documentMouseMoveListener)),this.documentMouseUpListener||(this.documentMouseUpListener=function(o){e.onDocumentMouseUp(o)},document.addEventListener("mouseup",this.documentMouseUpListener))},unbindDocumentMouseListeners:function(){this.documentMouseMoveListener&&(document.removeEventListener("mousemove",this.documentMouseMoveListener),this.documentMouseMoveListener=null),this.documentMouseUpListener&&(document.removeEventListener("mouseup",this.documentMouseUpListener),this.documentMouseUpListener=null)},bindDocumentResizeListener:function(){var e=this;this.documentResizeListener||(this.documentResizeListener=function(){e.moveBar()},window.addEventListener("resize",this.documentResizeListener))},unbindDocumentResizeListener:function(){this.documentResizeListener&&(window.removeEventListener("resize",this.documentResizeListener),this.documentResizeListener=null)}},computed:{contentId:function(){return this.$id+"_content"}}},ue=["id"],de=["aria-controls","aria-valuenow"],pe=["aria-controls","aria-valuenow"];function me(t,e,o,a,u,i){return h(),w("div",c({class:t.cx("root")},t.ptmi("root")),[r("div",c({class:t.cx("contentContainer")},t.ptm("contentContainer")),[r("div",c({ref:"content",id:i.contentId,class:t.cx("content"),onScroll:e[0]||(e[0]=function(){return i.onScroll&&i.onScroll.apply(i,arguments)}),onMouseenter:e[1]||(e[1]=function(){return i.moveBar&&i.moveBar.apply(i,arguments)})},t.ptm("content")),[L(t.$slots,"default")],16,ue)],16),r("div",c({ref:"xBar",class:t.cx("barx"),tabindex:"0",role:"scrollbar","aria-orientation":"horizontal","aria-controls":i.contentId,"aria-valuenow":u.lastScrollLeft,onMousedown:e[2]||(e[2]=function(){return i.onXBarMouseDown&&i.onXBarMouseDown.apply(i,arguments)}),onKeydown:e[3]||(e[3]=function(s){return i.onKeyDown(s)}),onKeyup:e[4]||(e[4]=function(){return i.onKeyUp&&i.onKeyUp.apply(i,arguments)}),onFocus:e[5]||(e[5]=function(){return i.onFocus&&i.onFocus.apply(i,arguments)}),onBlur:e[6]||(e[6]=function(){return i.onBlur&&i.onBlur.apply(i,arguments)})},t.ptm("barx"),{"data-pc-group-section":"bar"}),null,16,de),r("div",c({ref:"yBar",class:t.cx("bary"),tabindex:"0",role:"scrollbar","aria-orientation":"vertical","aria-controls":i.contentId,"aria-valuenow":u.lastScrollTop,onMousedown:e[7]||(e[7]=function(){return i.onYBarMouseDown&&i.onYBarMouseDown.apply(i,arguments)}),onKeydown:e[8]||(e[8]=function(s){return i.onKeyDown(s)}),onKeyup:e[9]||(e[9]=function(){return i.onKeyUp&&i.onKeyUp.apply(i,arguments)}),onFocus:e[10]||(e[10]=function(){return i.onFocus&&i.onFocus.apply(i,arguments)})},t.ptm("bary"),{"data-pc-group-section":"bar"}),null,16,pe)],16)}C.render=me;var fe=`
.p-scrolltop.p-button {
    position: fixed !important;
    inset-block-end: 20px;
    inset-inline-end: 20px;
}

.p-scrolltop-sticky.p-button {
    position: sticky !important;
    display: flex;
    margin-inline-start: auto;
}

.p-scrolltop-enter-from {
    opacity: 0;
}

.p-scrolltop-enter-active {
    transition: opacity 0.15s;
}

.p-scrolltop.p-scrolltop-leave-to {
    opacity: 0;
}

.p-scrolltop-leave-active {
    transition: opacity 0.15s;
}
`,he={root:function(e){var o=e.props;return["p-scrolltop",{"p-scrolltop-sticky":o.target!=="window"}]},icon:"p-scrolltop-icon"},ve=$.extend({name:"scrolltop",style:fe,classes:he}),be={name:"BaseScrollTop",extends:x,props:{target:{type:String,default:"window"},threshold:{type:Number,default:400},icon:{type:String,default:void 0},behavior:{type:String,default:"smooth"},buttonProps:{type:Object,default:function(){return{rounded:!0}}}},style:ve,provide:function(){return{$pcScrollTop:this,$parentInstance:this}}},U={name:"ScrollTop",extends:be,inheritAttrs:!1,scrollListener:null,container:null,data:function(){return{visible:!1}},mounted:function(){this.target==="window"?this.bindDocumentScrollListener():this.target==="parent"&&this.bindParentScrollListener()},beforeUnmount:function(){this.target==="window"?this.unbindDocumentScrollListener():this.target==="parent"&&this.unbindParentScrollListener(),this.container&&(M.clear(this.container),this.overlay=null)},methods:{onClick:function(){var e=this.target==="window"?window:this.$el.parentElement;e.scroll({top:0,behavior:this.behavior})},checkVisibility:function(e){e>this.threshold?this.visible=!0:this.visible=!1},bindParentScrollListener:function(){var e=this;this.scrollListener=function(){e.checkVisibility(e.$el.parentElement.scrollTop)},this.$el.parentElement.addEventListener("scroll",this.scrollListener)},bindDocumentScrollListener:function(){var e=this;this.scrollListener=function(){e.checkVisibility(Y())},window.addEventListener("scroll",this.scrollListener)},unbindParentScrollListener:function(){this.scrollListener&&(this.$el.parentElement.removeEventListener("scroll",this.scrollListener),this.scrollListener=null)},unbindDocumentScrollListener:function(){this.scrollListener&&(window.removeEventListener("scroll",this.scrollListener),this.scrollListener=null)},onEnter:function(e){M.set("overlay",e,this.$primevue.config.zIndex.overlay)},onAfterLeave:function(e){M.clear(e)},containerRef:function(e){this.container=e?e.$el:void 0}},computed:{scrollTopAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.scrollTop:void 0}},components:{ChevronUpIcon:J,Button:D}};function ge(t,e,o,a,u,i){var s=A("Button");return h(),S(K,c({name:"p-scrolltop",appear:"",onEnter:i.onEnter,onAfterLeave:i.onAfterLeave},t.ptm("transition")),{default:f(function(){return[u.visible?(h(),S(s,c({key:0,ref:i.containerRef,class:t.cx("root"),onClick:i.onClick,"aria-label":i.scrollTopAriaLabel,unstyled:t.unstyled},t.buttonProps,{pt:t.pt}),{icon:f(function(b){return[L(t.$slots,"icon",{class:q(t.cx("icon"))},function(){return[(h(),S(H(t.icon?"span":"ChevronUpIcon"),c({class:[t.cx("icon"),t.icon,b.class]},t.ptm("icon")),null,16,["class"]))]})]}),_:3},16,["class","onClick","aria-label","unstyled","pt"])):_("",!0)]}),_:3},16,["onEnter","onAfterLeave"])}U.render=ge;var ye={root:"p-avatar-group p-component"},$e=$.extend({name:"avatargroup",classes:ye}),we={name:"BaseAvatarGroup",extends:x,style:$e,provide:function(){return{$pcAvatarGroup:this,$parentInstance:this}}},F={name:"AvatarGroup",extends:we,inheritAttrs:!1};function Be(t,e,o,a,u,i){return h(),w("div",c({class:t.cx("root")},t.ptmi("root")),[L(t.$slots,"default")],16)}F.render=Be;var xe=({dt:t})=>`
.p-overlaybadge {
    position: relative;
}

.p-overlaybadge .p-badge {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    transform: translate(50%, -50%);
    transform-origin: 100% 0;
    margin: 0;
    outline-width: ${t("overlaybadge.outline.width")};
    outline-style: solid;
    outline-color: ${t("overlaybadge.outline.color")};
}

.p-overlaybadge .p-badge:dir(rtl) {
    transform: translate(-50%, -50%);
}
`,Le={root:"p-overlaybadge"},Me=$.extend({name:"overlaybadge",style:xe,classes:Le}),Se={name:"OverlayBadge",extends:k,style:Me,provide:function(){return{$pcOverlayBadge:this,$parentInstance:this}}},P={name:"OverlayBadge",extends:Se,inheritAttrs:!1,components:{Badge:k}};function ke(t,e,o,a,u,i){var s=A("Badge");return h(),w("div",c({class:t.cx("root")},t.ptmi("root")),[L(t.$slots,"default"),n(s,c(t.$props,{pt:t.ptm("pcBadge")}),null,16,["pt"])],16)}P.render=ke;const ze={class:"card"},De={class:"flex flex-col md:flex-row gap-4"},Ae={class:"md:w-1/2"},Te={class:"md:w-1/2"},Ce={class:"flex flex-col md:flex-row gap-8"},Ue={class:"md:w-1/2"},Fe={class:"card"},Pe={class:"flex gap-2"},Re={class:"flex gap-6"},Xe={class:"flex gap-2"},Ie={class:"flex items-start gap-2"},Ee={class:"card"},Ye={class:"card"},qe={class:"md:w-1/2"},He={class:"card"},_e={class:"flex gap-2"},Ke={class:"flex gap-2"},Ve={class:"flex gap-2"},We={class:"card"},Oe={class:"flex items-center flex-col sm:flex-row"},Ge={class:"flex items-center flex-col sm:flex-row"},Ne={class:"flex items-center flex-col sm:flex-row"},je={class:"card"},Je={class:"rounded-border border border-surface p-6"},Ze={class:"flex mb-4"},Qe={class:"flex justify-between mt-4"},ot={__name:"MiscDoc",setup(t){const e=V(0);let o=null;function a(){o=setInterval(()=>{let i=e.value+Math.floor(Math.random()*10)+1;i>=100&&(i=100),e.value=i},2e3)}function u(){clearInterval(o),o=null}return W(()=>{a()}),O(()=>{u()}),(i,s)=>{const b=Q,m=k,B=P,z=D,p=Z,R=F,X=U,I=C,l=j,d=N,v=T;return h(),w(G,null,[r("div",ze,[s[0]||(s[0]=r("div",{class:"font-semibold text-xl mb-4"},"ProgressBar",-1)),r("div",De,[r("div",Ae,[n(b,{value:e.value},null,8,["value"])]),r("div",Te,[n(b,{value:50,showValue:!1})])])]),r("div",Ce,[r("div",Ue,[r("div",Fe,[s[4]||(s[4]=r("div",{class:"font-semibold text-xl mb-4"},"Badge",-1)),r("div",Pe,[n(m,{value:2}),n(m,{value:8,severity:"success"}),n(m,{value:4,severity:"info"}),n(m,{value:12,severity:"Warn"}),n(m,{value:3,severity:"danger"})]),s[5]||(s[5]=r("div",{class:"font-semibold my-4"},"Overlay",-1)),r("div",Re,[n(B,{value:"2"},{default:f(()=>s[1]||(s[1]=[r("i",{class:"pi pi-bell",style:{"font-size":"2rem"}},null,-1)])),_:1}),n(B,{value:"4",severity:"danger"},{default:f(()=>s[2]||(s[2]=[r("i",{class:"pi pi-calendar",style:{"font-size":"2rem"}},null,-1)])),_:1}),n(B,{severity:"danger"},{default:f(()=>s[3]||(s[3]=[r("i",{class:"pi pi-envelope",style:{"font-size":"2rem"}},null,-1)])),_:1})]),s[6]||(s[6]=r("div",{class:"font-semibold my-4"},"Button",-1)),r("div",Xe,[n(z,{label:"Emails",badge:"8",class:"mr-2"}),n(z,{label:"Messages",icon:"pi pi-users",severity:"warn",badge:"8",badgeClass:"p-badge-danger"})]),s[7]||(s[7]=r("div",{class:"font-semibold my-4"},"Sizes",-1)),r("div",Ie,[n(m,{value:2}),n(m,{value:4,size:"large",severity:"warn"}),n(m,{value:6,size:"xlarge",severity:"success"})])]),r("div",Ee,[s[8]||(s[8]=r("div",{class:"font-semibold text-xl mb-4"},"Avatar",-1)),s[9]||(s[9]=r("div",{class:"font-semibold mb-4"},"Group",-1)),n(R,null,{default:f(()=>[n(p,{image:"https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png",size:"large",shape:"circle"}),n(p,{image:"https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png",size:"large",shape:"circle"}),n(p,{image:"https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png",size:"large",shape:"circle"}),n(p,{image:"https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png",size:"large",shape:"circle"}),n(p,{image:"https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png",size:"large",shape:"circle"}),n(p,{label:"+2",shape:"circle",size:"large",style:{"background-color":"#9c27b0",color:"#ffffff"}})]),_:1}),s[10]||(s[10]=r("div",{class:"font-semibold my-4"},"Label - Circle",-1)),n(p,{label:"P",class:"mr-2",size:"xlarge",shape:"circle"}),n(p,{label:"V",class:"mr-2",size:"large",style:{"background-color":"#2196F3",color:"#ffffff"},shape:"circle"}),n(p,{label:"U",class:"mr-2",style:{"background-color":"#9c27b0",color:"#ffffff"},shape:"circle"}),s[11]||(s[11]=r("div",{class:"font-semibold my-4"},"Icon - Badge",-1)),n(B,{value:"4",severity:"danger",class:"inline-flex"},{default:f(()=>[n(p,{label:"U",size:"xlarge"})]),_:1})]),r("div",Ye,[s[13]||(s[13]=r("div",{class:"font-semibold text-xl mb-4"},"ScrollTop",-1)),n(I,{style:{width:"250px",height:"200px"}},{default:f(()=>[s[12]||(s[12]=r("p",null," Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vitae et leo duis ut diam. Ultricies mi quis hendrerit dolor magna eget est lorem. Amet consectetur adipiscing elit ut. Nam libero justo laoreet sit amet. Pharetra massa massa ultricies mi quis hendrerit dolor magna. Est ultricies integer quis auctor elit sed vulputate. Consequat ac felis donec et. Tellus orci ac auctor augue mauris. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus a. Tincidunt arcu non sodales neque sodales. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Sodales ut etiam sit amet nisl purus. Cursus sit amet dictum sit amet. Tristique senectus et netus et malesuada fames ac turpis egestas. Et tortor consequat id porta nibh venenatis cras sed. Diam maecenas ultricies mi eget mauris. Eget egestas purus viverra accumsan in nisl nisi. Suscipit adipiscing bibendum est ultricies integer. Mattis aliquam faucibus purus in massa tempor nec. ",-1)),n(X,{target:"parent",threshold:100,icon:"pi pi-arrow-up"})]),_:1})])]),r("div",qe,[r("div",He,[s[14]||(s[14]=r("div",{class:"font-semibold text-xl mb-4"},"Tag",-1)),s[15]||(s[15]=r("div",{class:"font-semibold mb-4"},"Default",-1)),r("div",_e,[n(l,{value:"Primary"}),n(l,{severity:"success",value:"Success"}),n(l,{severity:"info",value:"Info"}),n(l,{severity:"warn",value:"Warn"}),n(l,{severity:"danger",value:"Danger"})]),s[16]||(s[16]=r("div",{class:"font-semibold my-4"},"Pills",-1)),r("div",Ke,[n(l,{value:"Primary",rounded:!0}),n(l,{severity:"success",value:"Success",rounded:!0}),n(l,{severity:"info",value:"Info",rounded:!0}),n(l,{severity:"warn",value:"Warn",rounded:!0}),n(l,{severity:"danger",value:"Danger",rounded:!0})]),s[17]||(s[17]=r("div",{class:"font-semibold my-4"},"Icons",-1)),r("div",Ve,[n(l,{icon:"pi pi-user",value:"Primary"}),n(l,{icon:"pi pi-check",severity:"success",value:"Success"}),n(l,{icon:"pi pi-info-circle",severity:"info",value:"Info"}),n(l,{con:"pi pi-exclamation-triangle",severity:"warn",value:"Warn"}),n(l,{icon:"pi pi-times",severity:"danger",value:"Danger"})])]),r("div",We,[s[18]||(s[18]=r("div",{class:"font-semibold text-xl mb-4"},"Chip",-1)),s[19]||(s[19]=r("div",{class:"font-semibold mb-4"},"Basic",-1)),r("div",Oe,[n(d,{label:"Action",class:"mr-2 mb-2"}),n(d,{label:"Comedy",class:"mr-2 mb-2"}),n(d,{label:"Mystery",class:"mr-2 mb-2"}),n(d,{label:"Thriller",removable:!0,class:"mb-2"})]),s[20]||(s[20]=r("div",{class:"font-semibold my-4"},"Icon",-1)),r("div",Ge,[n(d,{label:"Apple",icon:"pi pi-apple",class:"mr-2 mb-2"}),n(d,{label:"Facebook",icon:"pi pi-facebook",class:"mr-2 mb-2"}),n(d,{label:"Google",icon:"pi pi-google",class:"mr-2 mb-2"}),n(d,{label:"Microsoft",icon:"pi pi-microsoft",removable:!0,class:"mb-2"})]),s[21]||(s[21]=r("div",{class:"font-semibold my-4"},"Image",-1)),r("div",Ne,[n(d,{label:"Amy Elsner",image:"https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png",class:"mr-2 mb-2"}),n(d,{label:"Asiya Javayant",image:"https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png",class:"mr-2 mb-2"}),n(d,{label:"Onyama Limba",image:"https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png",class:"mr-2 mb-2"})])]),r("div",je,[s[22]||(s[22]=r("div",{class:"font-semibold text-xl mb-4"},"Skeleton",-1)),r("div",Je,[r("div",Ze,[n(v,{shape:"circle",size:"4rem",class:"mr-2"}),r("div",null,[n(v,{width:"10rem",class:"mb-2"}),n(v,{width:"5rem",class:"mb-2"}),n(v,{height:".5rem"})])]),n(v,{width:"100%",height:"150px"}),r("div",Qe,[n(v,{width:"4rem",height:"2rem"}),n(v,{width:"4rem",height:"2rem"})])])])])])],64)}}};export{ot as default};
