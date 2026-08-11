import{H as C,Z as A,U as k,X as I,a6 as L,$ as U,a2 as Z,a1 as O,a3 as j,a4 as q,a5 as G,a9 as J,I as w,aW as X,J as r,ab as E,aj as N,a as o,b as u,d as v,w as B,g as h,n as D,S as $,f,t as R,P as z,y as K,m as Q,D as Y,R as m,F as y,r as V,l as _,aM as S,ap as M,aO as ee,aG as x,aN as te,aq as T,ag as ne}from"./index-CwxAHeh0.js";import{s as ie}from"./index-BVosuIeG.js";import{s as ae}from"./index-D3_VH-6C.js";var se=({dt:e})=>`
.p-menu {
    background: ${e("menu.background")};
    color: ${e("menu.color")};
    border: 1px solid ${e("menu.border.color")};
    border-radius: ${e("menu.border.radius")};
    min-width: 12.5rem;
}

.p-menu-list {
    margin: 0;
    padding: ${e("menu.list.padding")};
    outline: 0 none;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: ${e("menu.list.gap")};
}

.p-menu-item-content {
    transition: background ${e("menu.transition.duration")}, color ${e("menu.transition.duration")};
    border-radius: ${e("menu.item.border.radius")};
    color: ${e("menu.item.color")};
}

.p-menu-item-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
    overflow: hidden;
    position: relative;
    color: inherit;
    padding: ${e("menu.item.padding")};
    gap: ${e("menu.item.gap")};
    user-select: none;
    outline: 0 none;
}

.p-menu-item-label {
    line-height: 1;
}

.p-menu-item-icon {
    color: ${e("menu.item.icon.color")};
}

.p-menu-item.p-focus .p-menu-item-content {
    color: ${e("menu.item.focus.color")};
    background: ${e("menu.item.focus.background")};
}

.p-menu-item.p-focus .p-menu-item-icon {
    color: ${e("menu.item.icon.focus.color")};
}

.p-menu-item:not(.p-disabled) .p-menu-item-content:hover {
    color: ${e("menu.item.focus.color")};
    background: ${e("menu.item.focus.background")};
}

.p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {
    color: ${e("menu.item.icon.focus.color")};
}

.p-menu-overlay {
    box-shadow: ${e("menu.shadow")};
}

.p-menu-submenu-label {
    background: ${e("menu.submenu.label.background")};
    padding: ${e("menu.submenu.label.padding")};
    color: ${e("menu.submenu.label.color")};
    font-weight: ${e("menu.submenu.label.font.weight")};
}

.p-menu-separator {
    border-block-start: 1px solid ${e("menu.separator.border.color")};
}
`,re={root:function(t){var n=t.props;return["p-menu p-component",{"p-menu-overlay":n.popup}]},start:"p-menu-start",list:"p-menu-list",submenuLabel:"p-menu-submenu-label",separator:"p-menu-separator",end:"p-menu-end",item:function(t){var n=t.instance;return["p-menu-item",{"p-focus":n.id===n.focusedOptionId,"p-disabled":n.disabled()}]},itemContent:"p-menu-item-content",itemLink:"p-menu-item-link",itemIcon:"p-menu-item-icon",itemLabel:"p-menu-item-label"},oe=C.extend({name:"menu",style:se,classes:re}),le={name:"BaseMenu",extends:w,props:{popup:{type:Boolean,default:!1},model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},tabindex:{type:Number,default:0},ariaLabel:{type:String,default:null},ariaLabelledby:{type:String,default:null}},style:oe,provide:function(){return{$pcMenu:this,$parentInstance:this}}},H={name:"Menuitem",hostName:"Menu",extends:w,inheritAttrs:!1,emits:["item-click","item-mousemove"],props:{item:null,templates:null,id:null,focusedOptionId:null,index:null},methods:{getItemProp:function(t,n){return t&&t.item?X(t.item[n]):void 0},getPTOptions:function(t){return this.ptm(t,{context:{item:this.item,index:this.index,focused:this.isItemFocused(),disabled:this.disabled()}})},isItemFocused:function(){return this.focusedOptionId===this.id},onItemClick:function(t){var n=this.getItemProp(this.item,"command");n&&n({originalEvent:t,item:this.item.item}),this.$emit("item-click",{originalEvent:t,item:this.item,id:this.id})},onItemMouseMove:function(t){this.$emit("item-mousemove",{originalEvent:t,item:this.item,id:this.id})},visible:function(){return typeof this.item.visible=="function"?this.item.visible():this.item.visible!==!1},disabled:function(){return typeof this.item.disabled=="function"?this.item.disabled():this.item.disabled},label:function(){return typeof this.item.label=="function"?this.item.label():this.item.label},getMenuItemProps:function(t){return{action:r({class:this.cx("itemLink"),tabindex:"-1"},this.getPTOptions("itemLink")),icon:r({class:[this.cx("itemIcon"),t.icon]},this.getPTOptions("itemIcon")),label:r({class:this.cx("itemLabel")},this.getPTOptions("itemLabel"))}}},directives:{ripple:E}},ue=["id","aria-label","aria-disabled","data-p-focused","data-p-disabled"],de=["href","target"];function ce(e,t,n,a,s,i){var d=N("ripple");return i.visible()?(o(),u("li",r({key:0,id:n.id,class:[e.cx("item"),n.item.class],role:"menuitem",style:n.item.style,"aria-label":i.label(),"aria-disabled":i.disabled()},i.getPTOptions("item"),{"data-p-focused":i.isItemFocused(),"data-p-disabled":i.disabled()||!1}),[v("div",r({class:e.cx("itemContent"),onClick:t[0]||(t[0]=function(c){return i.onItemClick(c)}),onMousemove:t[1]||(t[1]=function(c){return i.onItemMouseMove(c)})},i.getPTOptions("itemContent")),[n.templates.item?n.templates.item?(o(),h($(n.templates.item),{key:1,item:n.item,label:i.label(),props:i.getMenuItemProps(n.item)},null,8,["item","label","props"])):f("",!0):B((o(),u("a",r({key:0,href:n.item.url,class:e.cx("itemLink"),target:n.item.target,tabindex:"-1"},i.getPTOptions("itemLink")),[n.templates.itemicon?(o(),h($(n.templates.itemicon),{key:0,item:n.item,class:D(e.cx("itemIcon"))},null,8,["item","class"])):n.item.icon?(o(),u("span",r({key:1,class:[e.cx("itemIcon"),n.item.icon]},i.getPTOptions("itemIcon")),null,16)):f("",!0),v("span",r({class:e.cx("itemLabel")},i.getPTOptions("itemLabel")),R(i.label()),17)],16,de)),[[d]])],16)],16,ue)):f("",!0)}H.render=ce;function F(e){return he(e)||fe(e)||pe(e)||be()}function be(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function pe(e,t){if(e){if(typeof e=="string")return P(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?P(e,t):void 0}}function fe(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function he(e){if(Array.isArray(e))return P(e)}function P(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,a=Array(t);n<t;n++)a[n]=e[n];return a}var me={name:"Menu",extends:le,inheritAttrs:!1,emits:["show","hide","focus","blur"],data:function(){return{overlayVisible:!1,focused:!1,focusedOptionIndex:-1,selectedOptionIndex:-1}},target:null,outsideClickListener:null,scrollHandler:null,resizeListener:null,container:null,list:null,mounted:function(){this.popup||(this.bindResizeListener(),this.bindOutsideClickListener())},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.target=null,this.container&&this.autoZIndex&&A.clear(this.container),this.container=null},methods:{itemClick:function(t){var n=t.item;this.disabled(n)||(n.command&&n.command(t),this.overlayVisible&&this.hide(),!this.popup&&this.focusedOptionIndex!==t.id&&(this.focusedOptionIndex=t.id))},itemMouseMove:function(t){this.focused&&(this.focusedOptionIndex=t.id)},onListFocus:function(t){this.focused=!0,!this.popup&&this.changeFocusedOptionIndex(0),this.$emit("focus",t)},onListBlur:function(t){this.focused=!1,this.focusedOptionIndex=-1,this.$emit("blur",t)},onListKeyDown:function(t){switch(t.code){case"ArrowDown":this.onArrowDownKey(t);break;case"ArrowUp":this.onArrowUpKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"Enter":case"NumpadEnter":this.onEnterKey(t);break;case"Space":this.onSpaceKey(t);break;case"Escape":this.popup&&(k(this.target),this.hide());case"Tab":this.overlayVisible&&this.hide();break}},onArrowDownKey:function(t){var n=this.findNextOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(n),t.preventDefault()},onArrowUpKey:function(t){if(t.altKey&&this.popup)k(this.target),this.hide(),t.preventDefault();else{var n=this.findPrevOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(n),t.preventDefault()}},onHomeKey:function(t){this.changeFocusedOptionIndex(0),t.preventDefault()},onEndKey:function(t){this.changeFocusedOptionIndex(I(this.container,'li[data-pc-section="item"][data-p-disabled="false"]').length-1),t.preventDefault()},onEnterKey:function(t){var n=L(this.list,'li[id="'.concat("".concat(this.focusedOptionIndex),'"]')),a=n&&L(n,'a[data-pc-section="itemlink"]');this.popup&&k(this.target),a?a.click():n&&n.click(),t.preventDefault()},onSpaceKey:function(t){this.onEnterKey(t)},findNextOptionIndex:function(t){var n=I(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),a=F(n).findIndex(function(s){return s.id===t});return a>-1?a+1:0},findPrevOptionIndex:function(t){var n=I(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),a=F(n).findIndex(function(s){return s.id===t});return a>-1?a-1:0},changeFocusedOptionIndex:function(t){var n=I(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),a=t>=n.length?n.length-1:t<0?0:t;a>-1&&(this.focusedOptionIndex=n[a].getAttribute("id"))},toggle:function(t){this.overlayVisible?this.hide():this.show(t)},show:function(t){this.overlayVisible=!0,this.target=t.currentTarget},hide:function(){this.overlayVisible=!1,this.target=null},onEnter:function(t){U(t,{position:"absolute",top:"0",left:"0"}),this.alignOverlay(),this.bindOutsideClickListener(),this.bindResizeListener(),this.bindScrollListener(),this.autoZIndex&&A.set("menu",t,this.baseZIndex+this.$primevue.config.zIndex.menu),this.popup&&k(this.list),this.$emit("show")},onLeave:function(){this.unbindOutsideClickListener(),this.unbindResizeListener(),this.unbindScrollListener(),this.$emit("hide")},onAfterLeave:function(t){this.autoZIndex&&A.clear(t)},alignOverlay:function(){Z(this.container,this.target);var t=O(this.target);t>O(this.container)&&(this.container.style.minWidth=O(this.target)+"px")},bindOutsideClickListener:function(){var t=this;this.outsideClickListener||(this.outsideClickListener=function(n){var a=t.container&&!t.container.contains(n.target),s=!(t.target&&(t.target===n.target||t.target.contains(n.target)));t.overlayVisible&&a&&s?t.hide():!t.popup&&a&&s&&(t.focusedOptionIndex=-1)},document.addEventListener("click",this.outsideClickListener,!0))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener,!0),this.outsideClickListener=null)},bindScrollListener:function(){var t=this;this.scrollHandler||(this.scrollHandler=new j(this.target,function(){t.overlayVisible&&t.hide()})),this.scrollHandler.bindScrollListener()},unbindScrollListener:function(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()},bindResizeListener:function(){var t=this;this.resizeListener||(this.resizeListener=function(){t.overlayVisible&&!q()&&t.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},visible:function(t){return typeof t.visible=="function"?t.visible():t.visible!==!1},disabled:function(t){return typeof t.disabled=="function"?t.disabled():t.disabled},label:function(t){return typeof t.label=="function"?t.label():t.label},onOverlayClick:function(t){G.emit("overlay-click",{originalEvent:t,target:this.target})},containerRef:function(t){this.container=t},listRef:function(t){this.list=t}},computed:{focusedOptionId:function(){return this.focusedOptionIndex!==-1?this.focusedOptionIndex:null}},components:{PVMenuitem:H,Portal:J}},ve=["id"],ge=["id","tabindex","aria-activedescendant","aria-label","aria-labelledby"],ye=["id"];function ke(e,t,n,a,s,i){var d=z("PVMenuitem"),c=z("Portal");return o(),h(c,{appendTo:e.appendTo,disabled:!e.popup},{default:K(function(){return[Q(Y,r({name:"p-connected-overlay",onEnter:i.onEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},e.ptm("transition")),{default:K(function(){return[!e.popup||s.overlayVisible?(o(),u("div",r({key:0,ref:i.containerRef,id:e.$id,class:e.cx("root"),onClick:t[3]||(t[3]=function(){return i.onOverlayClick&&i.onOverlayClick.apply(i,arguments)})},e.ptmi("root")),[e.$slots.start?(o(),u("div",r({key:0,class:e.cx("start")},e.ptm("start")),[m(e.$slots,"start")],16)):f("",!0),v("ul",r({ref:i.listRef,id:e.$id+"_list",class:e.cx("list"),role:"menu",tabindex:e.tabindex,"aria-activedescendant":s.focused?i.focusedOptionId:void 0,"aria-label":e.ariaLabel,"aria-labelledby":e.ariaLabelledby,onFocus:t[0]||(t[0]=function(){return i.onListFocus&&i.onListFocus.apply(i,arguments)}),onBlur:t[1]||(t[1]=function(){return i.onListBlur&&i.onListBlur.apply(i,arguments)}),onKeydown:t[2]||(t[2]=function(){return i.onListKeyDown&&i.onListKeyDown.apply(i,arguments)})},e.ptm("list")),[(o(!0),u(y,null,V(e.model,function(l,b){return o(),u(y,{key:i.label(l)+b.toString()},[l.items&&i.visible(l)&&!l.separator?(o(),u(y,{key:0},[l.items?(o(),u("li",r({key:0,id:e.$id+"_"+b,class:[e.cx("submenuLabel"),l.class],role:"none",ref_for:!0},e.ptm("submenuLabel")),[m(e.$slots,e.$slots.submenulabel?"submenulabel":"submenuheader",{item:l},function(){return[_(R(i.label(l)),1)]})],16,ye)):f("",!0),(o(!0),u(y,null,V(l.items,function(p,g){return o(),u(y,{key:p.label+b+"_"+g},[i.visible(p)&&!p.separator?(o(),h(d,{key:0,id:e.$id+"_"+b+"_"+g,item:p,templates:e.$slots,focusedOptionId:i.focusedOptionId,unstyled:e.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:e.pt},null,8,["id","item","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"])):i.visible(p)&&p.separator?(o(),u("li",r({key:"separator"+b+g,class:[e.cx("separator"),l.class],style:p.style,role:"separator",ref_for:!0},e.ptm("separator")),null,16)):f("",!0)],64)}),128))],64)):i.visible(l)&&l.separator?(o(),u("li",r({key:"separator"+b.toString(),class:[e.cx("separator"),l.class],style:l.style,role:"separator",ref_for:!0},e.ptm("separator")),null,16)):(o(),h(d,{key:i.label(l)+b.toString(),id:e.$id+"_"+b,item:l,index:b,templates:e.$slots,focusedOptionId:i.focusedOptionId,unstyled:e.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:e.pt},null,8,["id","item","index","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"]))],64)}),128))],16,ge),e.$slots.end?(o(),u("div",r({key:1,class:e.cx("end")},e.ptm("end")),[m(e.$slots,"end")],16)):f("",!0)],16,ve)):f("",!0)]}),_:3},16,["onEnter","onLeave","onAfterLeave"])]}),_:3},8,["appendTo","disabled"])}me.render=ke;var Le=({dt:e})=>`
.p-tabs {
    display: flex;
    flex-direction: column;
}

.p-tablist {
    display: flex;
    position: relative;
}

.p-tabs-scrollable > .p-tablist {
    overflow: hidden;
}

.p-tablist-viewport {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scrollbar-width: none;
    overscroll-behavior: contain auto;
}

.p-tablist-viewport::-webkit-scrollbar {
    display: none;
}

.p-tablist-tab-list {
    position: relative;
    display: flex;
    background: ${e("tabs.tablist.background")};
    border-style: solid;
    border-color: ${e("tabs.tablist.border.color")};
    border-width: ${e("tabs.tablist.border.width")};
}

.p-tablist-content {
    flex-grow: 1;
}

.p-tablist-nav-button {
    all: unset;
    position: absolute !important;
    flex-shrink: 0;
    inset-block-start: 0;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${e("tabs.nav.button.background")};
    color: ${e("tabs.nav.button.color")};
    width: ${e("tabs.nav.button.width")};
    transition: color ${e("tabs.transition.duration")}, outline-color ${e("tabs.transition.duration")}, box-shadow ${e("tabs.transition.duration")};
    box-shadow: ${e("tabs.nav.button.shadow")};
    outline-color: transparent;
    cursor: pointer;
}

.p-tablist-nav-button:focus-visible {
    z-index: 1;
    box-shadow: ${e("tabs.nav.button.focus.ring.shadow")};
    outline: ${e("tabs.nav.button.focus.ring.width")} ${e("tabs.nav.button.focus.ring.style")} ${e("tabs.nav.button.focus.ring.color")};
    outline-offset: ${e("tabs.nav.button.focus.ring.offset")};
}

.p-tablist-nav-button:hover {
    color: ${e("tabs.nav.button.hover.color")};
}

.p-tablist-prev-button {
    inset-inline-start: 0;
}

.p-tablist-next-button {
    inset-inline-end: 0;
}

.p-tablist-prev-button:dir(rtl),
.p-tablist-next-button:dir(rtl) {
    transform: rotate(180deg);
}


.p-tab {
    flex-shrink: 0;
    cursor: pointer;
    user-select: none;
    position: relative;
    border-style: solid;
    white-space: nowrap;
    background: ${e("tabs.tab.background")};
    border-width: ${e("tabs.tab.border.width")};
    border-color: ${e("tabs.tab.border.color")};
    color: ${e("tabs.tab.color")};
    padding: ${e("tabs.tab.padding")};
    font-weight: ${e("tabs.tab.font.weight")};
    transition: background ${e("tabs.transition.duration")}, border-color ${e("tabs.transition.duration")}, color ${e("tabs.transition.duration")}, outline-color ${e("tabs.transition.duration")}, box-shadow ${e("tabs.transition.duration")};
    margin: ${e("tabs.tab.margin")};
    outline-color: transparent;
}

.p-tab:not(.p-disabled):focus-visible {
    z-index: 1;
    box-shadow: ${e("tabs.tab.focus.ring.shadow")};
    outline: ${e("tabs.tab.focus.ring.width")} ${e("tabs.tab.focus.ring.style")} ${e("tabs.tab.focus.ring.color")};
    outline-offset: ${e("tabs.tab.focus.ring.offset")};
}

.p-tab:not(.p-tab-active):not(.p-disabled):hover {
    background: ${e("tabs.tab.hover.background")};
    border-color: ${e("tabs.tab.hover.border.color")};
    color: ${e("tabs.tab.hover.color")};
}

.p-tab-active {
    background: ${e("tabs.tab.active.background")};
    border-color: ${e("tabs.tab.active.border.color")};
    color: ${e("tabs.tab.active.color")};
}

.p-tabpanels {
    background: ${e("tabs.tabpanel.background")};
    color: ${e("tabs.tabpanel.color")};
    padding: ${e("tabs.tabpanel.padding")};
    outline: 0 none;
}

.p-tabpanel:focus-visible {
    box-shadow: ${e("tabs.tabpanel.focus.ring.shadow")};
    outline: ${e("tabs.tabpanel.focus.ring.width")} ${e("tabs.tabpanel.focus.ring.style")} ${e("tabs.tabpanel.focus.ring.color")};
    outline-offset: ${e("tabs.tabpanel.focus.ring.offset")};
}

.p-tablist-active-bar {
    z-index: 1;
    display: block;
    position: absolute;
    inset-block-end: ${e("tabs.active.bar.bottom")};
    height: ${e("tabs.active.bar.height")};
    background: ${e("tabs.active.bar.background")};
    transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
}
`,$e={root:function(t){var n=t.props;return["p-tabs p-component",{"p-tabs-scrollable":n.scrollable}]}},we=C.extend({name:"tabs",style:Le,classes:$e}),Ie={name:"BaseTabs",extends:w,props:{value:{type:[String,Number],default:void 0},lazy:{type:Boolean,default:!1},scrollable:{type:Boolean,default:!1},showNavigators:{type:Boolean,default:!0},tabindex:{type:Number,default:0},selectOnFocus:{type:Boolean,default:!1}},style:we,provide:function(){return{$pcTabs:this,$parentInstance:this}}},xe={name:"Tabs",extends:Ie,inheritAttrs:!1,emits:["update:value"],data:function(){return{d_value:this.value}},watch:{value:function(t){this.d_value=t}},methods:{updateValue:function(t){this.d_value!==t&&(this.d_value=t,this.$emit("update:value",t))},isVertical:function(){return this.orientation==="vertical"}}};function Te(e,t,n,a,s,i){return o(),u("div",r({class:e.cx("root")},e.ptmi("root")),[m(e.$slots,"default")],16)}xe.render=Te;var Oe={root:"p-tablist",content:function(t){var n=t.instance;return["p-tablist-content",{"p-tablist-viewport":n.$pcTabs.scrollable}]},tabList:"p-tablist-tab-list",activeBar:"p-tablist-active-bar",prevButton:"p-tablist-prev-button p-tablist-nav-button",nextButton:"p-tablist-next-button p-tablist-nav-button"},Be=C.extend({name:"tablist",classes:Oe}),Ce={name:"BaseTabList",extends:w,props:{},style:Be,provide:function(){return{$pcTabList:this,$parentInstance:this}}},Ae={name:"TabList",extends:Ce,inheritAttrs:!1,inject:["$pcTabs"],data:function(){return{isPrevButtonEnabled:!1,isNextButtonEnabled:!0}},resizeObserver:void 0,watch:{showNavigators:function(t){t?this.bindResizeObserver():this.unbindResizeObserver()},activeValue:{flush:"post",handler:function(){this.updateInkBar()}}},mounted:function(){var t=this;setTimeout(function(){t.updateInkBar()},150),this.showNavigators&&(this.updateButtonState(),this.bindResizeObserver())},updated:function(){this.showNavigators&&this.updateButtonState()},beforeUnmount:function(){this.unbindResizeObserver()},methods:{onScroll:function(t){this.showNavigators&&this.updateButtonState(),t.preventDefault()},onPrevButtonClick:function(){var t=this.$refs.content,n=this.getVisibleButtonWidths(),a=S(t)-n,s=Math.abs(t.scrollLeft),i=a*.8,d=s-i,c=Math.max(d,0);t.scrollLeft=M(t)?-1*c:c},onNextButtonClick:function(){var t=this.$refs.content,n=this.getVisibleButtonWidths(),a=S(t)-n,s=Math.abs(t.scrollLeft),i=a*.8,d=s+i,c=t.scrollWidth-a,l=Math.min(d,c);t.scrollLeft=M(t)?-1*l:l},bindResizeObserver:function(){var t=this;this.resizeObserver=new ResizeObserver(function(){return t.updateButtonState()}),this.resizeObserver.observe(this.$refs.list)},unbindResizeObserver:function(){var t;(t=this.resizeObserver)===null||t===void 0||t.unobserve(this.$refs.list),this.resizeObserver=void 0},updateInkBar:function(){var t=this.$refs,n=t.content,a=t.inkbar,s=t.tabs,i=L(n,'[data-pc-name="tab"][data-p-active="true"]');this.$pcTabs.isVertical()?(a.style.height=ee(i)+"px",a.style.top=x(i).top-x(s).top+"px"):(a.style.width=O(i)+"px",a.style.left=x(i).left-x(s).left+"px")},updateButtonState:function(){var t=this.$refs,n=t.list,a=t.content,s=a.scrollTop,i=a.scrollWidth,d=a.scrollHeight,c=a.offsetWidth,l=a.offsetHeight,b=Math.abs(a.scrollLeft),p=[S(a),te(a)],g=p[0],W=p[1];this.$pcTabs.isVertical()?(this.isPrevButtonEnabled=s!==0,this.isNextButtonEnabled=n.offsetHeight>=l&&parseInt(s)!==d-W):(this.isPrevButtonEnabled=b!==0,this.isNextButtonEnabled=n.offsetWidth>=c&&parseInt(b)!==i-g)},getVisibleButtonWidths:function(){var t=this.$refs,n=t.prevButton,a=t.nextButton,s=0;return this.showNavigators&&(s=((n==null?void 0:n.offsetWidth)||0)+((a==null?void 0:a.offsetWidth)||0)),s}},computed:{templates:function(){return this.$pcTabs.$slots},activeValue:function(){return this.$pcTabs.d_value},showNavigators:function(){return this.$pcTabs.scrollable&&this.$pcTabs.showNavigators},prevButtonAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.previous:void 0},nextButtonAriaLabel:function(){return this.$primevue.config.locale.aria?this.$primevue.config.locale.aria.next:void 0}},components:{ChevronLeftIcon:ie,ChevronRightIcon:ae},directives:{ripple:E}},Se=["aria-label","tabindex"],Ke=["aria-orientation"],Pe=["aria-label","tabindex"];function Ee(e,t,n,a,s,i){var d=N("ripple");return o(),u("div",r({ref:"list",class:e.cx("root")},e.ptmi("root")),[i.showNavigators&&s.isPrevButtonEnabled?B((o(),u("button",r({key:0,ref:"prevButton",class:e.cx("prevButton"),"aria-label":i.prevButtonAriaLabel,tabindex:i.$pcTabs.tabindex,onClick:t[0]||(t[0]=function(){return i.onPrevButtonClick&&i.onPrevButtonClick.apply(i,arguments)})},e.ptm("prevButton"),{"data-pc-group-section":"navigator"}),[(o(),h($(i.templates.previcon||"ChevronLeftIcon"),r({"aria-hidden":"true"},e.ptm("prevIcon")),null,16))],16,Se)),[[d]]):f("",!0),v("div",r({ref:"content",class:e.cx("content"),onScroll:t[1]||(t[1]=function(){return i.onScroll&&i.onScroll.apply(i,arguments)})},e.ptm("content")),[v("div",r({ref:"tabs",class:e.cx("tabList"),role:"tablist","aria-orientation":i.$pcTabs.orientation||"horizontal"},e.ptm("tabList")),[m(e.$slots,"default"),v("span",r({ref:"inkbar",class:e.cx("activeBar"),role:"presentation","aria-hidden":"true"},e.ptm("activeBar")),null,16)],16,Ke)],16),i.showNavigators&&s.isNextButtonEnabled?B((o(),u("button",r({key:1,ref:"nextButton",class:e.cx("nextButton"),"aria-label":i.nextButtonAriaLabel,tabindex:i.$pcTabs.tabindex,onClick:t[2]||(t[2]=function(){return i.onNextButtonClick&&i.onNextButtonClick.apply(i,arguments)})},e.ptm("nextButton"),{"data-pc-group-section":"navigator"}),[(o(),h($(i.templates.nexticon||"ChevronRightIcon"),r({"aria-hidden":"true"},e.ptm("nextIcon")),null,16))],16,Pe)),[[d]]):f("",!0)],16)}Ae.render=Ee;var Ne={root:function(t){var n=t.instance,a=t.props;return["p-tab",{"p-tab-active":n.active,"p-disabled":a.disabled}]}},ze=C.extend({name:"tab",classes:Ne}),Ve={name:"BaseTab",extends:w,props:{value:{type:[String,Number],default:void 0},disabled:{type:Boolean,default:!1},as:{type:[String,Object],default:"BUTTON"},asChild:{type:Boolean,default:!1}},style:ze,provide:function(){return{$pcTab:this,$parentInstance:this}}},Me={name:"Tab",extends:Ve,inheritAttrs:!1,inject:["$pcTabs","$pcTabList"],methods:{onFocus:function(){this.$pcTabs.selectOnFocus&&this.changeActiveValue()},onClick:function(){this.changeActiveValue()},onKeydown:function(t){switch(t.code){case"ArrowRight":this.onArrowRightKey(t);break;case"ArrowLeft":this.onArrowLeftKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"PageDown":this.onPageDownKey(t);break;case"PageUp":this.onPageUpKey(t);break;case"Enter":case"NumpadEnter":case"Space":this.onEnterKey(t);break}},onArrowRightKey:function(t){var n=this.findNextTab(t.currentTarget);n?this.changeFocusedTab(t,n):this.onHomeKey(t),t.preventDefault()},onArrowLeftKey:function(t){var n=this.findPrevTab(t.currentTarget);n?this.changeFocusedTab(t,n):this.onEndKey(t),t.preventDefault()},onHomeKey:function(t){var n=this.findFirstTab();this.changeFocusedTab(t,n),t.preventDefault()},onEndKey:function(t){var n=this.findLastTab();this.changeFocusedTab(t,n),t.preventDefault()},onPageDownKey:function(t){this.scrollInView(this.findLastTab()),t.preventDefault()},onPageUpKey:function(t){this.scrollInView(this.findFirstTab()),t.preventDefault()},onEnterKey:function(t){this.changeActiveValue(),t.preventDefault()},findNextTab:function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,a=n?t:t.nextElementSibling;return a?T(a,"data-p-disabled")||T(a,"data-pc-section")==="inkbar"?this.findNextTab(a):L(a,'[data-pc-name="tab"]'):null},findPrevTab:function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,a=n?t:t.previousElementSibling;return a?T(a,"data-p-disabled")||T(a,"data-pc-section")==="inkbar"?this.findPrevTab(a):L(a,'[data-pc-name="tab"]'):null},findFirstTab:function(){return this.findNextTab(this.$pcTabList.$refs.content.firstElementChild,!0)},findLastTab:function(){return this.findPrevTab(this.$pcTabList.$refs.content.lastElementChild,!0)},changeActiveValue:function(){this.$pcTabs.updateValue(this.value)},changeFocusedTab:function(t,n){k(n),this.scrollInView(n)},scrollInView:function(t){var n;t==null||(n=t.scrollIntoView)===null||n===void 0||n.call(t,{block:"nearest"})}},computed:{active:function(){var t;return ne((t=this.$pcTabs)===null||t===void 0?void 0:t.d_value,this.value)},id:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.$id,"_tab_").concat(this.value)},ariaControls:function(){var t;return"".concat((t=this.$pcTabs)===null||t===void 0?void 0:t.$id,"_tabpanel_").concat(this.value)},attrs:function(){return r(this.asAttrs,this.a11yAttrs,this.ptmi("root",this.ptParams))},asAttrs:function(){return this.as==="BUTTON"?{type:"button",disabled:this.disabled}:void 0},a11yAttrs:function(){return{id:this.id,tabindex:this.active?this.$pcTabs.tabindex:-1,role:"tab","aria-selected":this.active,"aria-controls":this.ariaControls,"data-pc-name":"tab","data-p-disabled":this.disabled,"data-p-active":this.active,onFocus:this.onFocus,onKeydown:this.onKeydown}},ptParams:function(){return{context:{active:this.active}}}},directives:{ripple:E}};function Fe(e,t,n,a,s,i){var d=N("ripple");return e.asChild?m(e.$slots,"default",{key:1,class:D(e.cx("root")),active:i.active,a11yAttrs:i.a11yAttrs,onClick:i.onClick}):B((o(),h($(e.as),r({key:0,class:e.cx("root"),onClick:i.onClick},i.attrs),{default:K(function(){return[m(e.$slots,"default")]}),_:3},16,["class","onClick"])),[[d]])}Me.render=Fe;export{Me as a,Ae as b,me as c,xe as s};
