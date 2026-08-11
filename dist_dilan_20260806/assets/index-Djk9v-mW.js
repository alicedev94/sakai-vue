import{H as d,b1 as h,I as m,a as o,b as a,R as s,J as i,g as l,S as p,f as r,t as u}from"./index-CwxAHeh0.js";var g=({dt:e})=>`
.p-chip {
    display: inline-flex;
    align-items: center;
    background: ${e("chip.background")};
    color: ${e("chip.color")};
    border-radius: ${e("chip.border.radius")};
    padding-block: ${e("chip.padding.y")};
    padding-inline: ${e("chip.padding.x")};
    gap: ${e("chip.gap")};
}

.p-chip-icon {
    color: ${e("chip.icon.color")};
    font-size: ${e("chip.icon.font.size")};
    width: ${e("chip.icon.size")};
    height: ${e("chip.icon.size")};
}

.p-chip-image {
    border-radius: 50%;
    width: ${e("chip.image.width")};
    height: ${e("chip.image.height")};
    margin-inline-start: calc(-1 * ${e("chip.padding.y")});
}

.p-chip:has(.p-chip-remove-icon) {
    padding-inline-end: ${e("chip.padding.y")};
}

.p-chip:has(.p-chip-image) {
    padding-block-start: calc(${e("chip.padding.y")} / 2);
    padding-block-end: calc(${e("chip.padding.y")} / 2);
}

.p-chip-remove-icon {
    cursor: pointer;
    font-size: ${e("chip.remove.icon.size")};
    width: ${e("chip.remove.icon.size")};
    height: ${e("chip.remove.icon.size")};
    color: ${e("chip.remove.icon.color")};
    border-radius: 50%;
    transition: outline-color ${e("chip.transition.duration")}, box-shadow ${e("chip.transition.duration")};
    outline-color: transparent;
}

.p-chip-remove-icon:focus-visible {
    box-shadow: ${e("chip.remove.icon.focus.ring.shadow")};
    outline: ${e("chip.remove.icon.focus.ring.width")} ${e("chip.remove.icon.focus.ring.style")} ${e("chip.remove.icon.focus.ring.color")};
    outline-offset: ${e("chip.remove.icon.focus.ring.offset")};
}
`,v={root:"p-chip p-component",image:"p-chip-image",icon:"p-chip-icon",label:"p-chip-label",removeIcon:"p-chip-remove-icon"},$=d.extend({name:"chip",style:g,classes:v}),f={name:"BaseChip",extends:m,props:{label:{type:String,default:null},icon:{type:String,default:null},image:{type:String,default:null},removable:{type:Boolean,default:!1},removeIcon:{type:String,default:void 0}},style:$,provide:function(){return{$pcChip:this,$parentInstance:this}}},y={name:"Chip",extends:f,inheritAttrs:!1,emits:["remove"],data:function(){return{visible:!0}},methods:{onKeydown:function(n){(n.key==="Enter"||n.key==="Backspace")&&this.close(n)},close:function(n){this.visible=!1,this.$emit("remove",n)}},components:{TimesCircleIcon:h}},b=["aria-label"],k=["src"];function w(e,n,C,I,t,c){return t.visible?(o(),a("div",i({key:0,class:e.cx("root"),"aria-label":e.label},e.ptmi("root")),[s(e.$slots,"default",{},function(){return[e.image?(o(),a("img",i({key:0,src:e.image},e.ptm("image"),{class:e.cx("image")}),null,16,k)):e.$slots.icon?(o(),l(p(e.$slots.icon),i({key:1,class:e.cx("icon")},e.ptm("icon")),null,16,["class"])):e.icon?(o(),a("span",i({key:2,class:[e.cx("icon"),e.icon]},e.ptm("icon")),null,16)):r("",!0),e.label?(o(),a("div",i({key:3,class:e.cx("label")},e.ptm("label")),u(e.label),17)):r("",!0)]}),e.removable?s(e.$slots,"removeicon",{key:0,removeCallback:c.close,keydownCallback:c.onKeydown},function(){return[(o(),l(p(e.removeIcon?"span":"TimesCircleIcon"),i({class:[e.cx("removeIcon"),e.removeIcon],onClick:c.close,onKeydown:c.onKeydown},e.ptm("removeIcon")),null,16,["class","onClick","onKeydown"]))]}):r("",!0)],16,b)):r("",!0)}y.render=w;export{y as s};
