import{H as t,I as n,a as s,b as l,d as a,R as o,J as r}from"./index-CwxAHeh0.js";var d=({dt:e})=>`
.p-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: ${e("toolbar.padding")};
    background: ${e("toolbar.background")};
    border: 1px solid ${e("toolbar.border.color")};
    color: ${e("toolbar.color")};
    border-radius: ${e("toolbar.border.radius")};
    gap: ${e("toolbar.gap")};
}

.p-toolbar-start,
.p-toolbar-center,
.p-toolbar-end {
    display: flex;
    align-items: center;
}
`,p={root:"p-toolbar p-component",start:"p-toolbar-start",center:"p-toolbar-center",end:"p-toolbar-end"},b=t.extend({name:"toolbar",style:d,classes:p}),i={name:"BaseToolbar",extends:n,props:{ariaLabelledby:{type:String,default:null}},style:b,provide:function(){return{$pcToolbar:this,$parentInstance:this}}},c={name:"Toolbar",extends:i,inheritAttrs:!1},$=["aria-labelledby"];function m(e,y,u,v,g,f){return s(),l("div",r({class:e.cx("root"),role:"toolbar","aria-labelledby":e.ariaLabelledby},e.ptmi("root")),[a("div",r({class:e.cx("start")},e.ptm("start")),[o(e.$slots,"start")],16),a("div",r({class:e.cx("center")},e.ptm("center")),[o(e.$slots,"center")],16),a("div",r({class:e.cx("end")},e.ptm("end")),[o(e.$slots,"end")],16)],16,$)}c.render=m;export{c as s};
