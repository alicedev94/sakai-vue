import{H as n,I as l,a,b as r,J as t,R as o,f as s,d}from"./index-CwxAHeh0.js";var i=({dt:e})=>`
.p-card {
    background: ${e("card.background")};
    color: ${e("card.color")};
    box-shadow: ${e("card.shadow")};
    border-radius: ${e("card.border.radius")};
    display: flex;
    flex-direction: column;
}

.p-card-caption {
    display: flex;
    flex-direction: column;
    gap: ${e("card.caption.gap")};
}

.p-card-body {
    padding: ${e("card.body.padding")};
    display: flex;
    flex-direction: column;
    gap: ${e("card.body.gap")};
}

.p-card-title {
    font-size: ${e("card.title.font.size")};
    font-weight: ${e("card.title.font.weight")};
}

.p-card-subtitle {
    color: ${e("card.subtitle.color")};
}
`,c={root:"p-card p-component",header:"p-card-header",body:"p-card-body",caption:"p-card-caption",title:"p-card-title",subtitle:"p-card-subtitle",content:"p-card-content",footer:"p-card-footer"},p=n.extend({name:"card",style:i,classes:c}),$={name:"BaseCard",extends:l,style:p,provide:function(){return{$pcCard:this,$parentInstance:this}}},u={name:"Card",extends:$,inheritAttrs:!1};function b(e,f,m,y,v,h){return a(),r("div",t({class:e.cx("root")},e.ptmi("root")),[e.$slots.header?(a(),r("div",t({key:0,class:e.cx("header")},e.ptm("header")),[o(e.$slots,"header")],16)):s("",!0),d("div",t({class:e.cx("body")},e.ptm("body")),[e.$slots.title||e.$slots.subtitle?(a(),r("div",t({key:0,class:e.cx("caption")},e.ptm("caption")),[e.$slots.title?(a(),r("div",t({key:0,class:e.cx("title")},e.ptm("title")),[o(e.$slots,"title")],16)):s("",!0),e.$slots.subtitle?(a(),r("div",t({key:1,class:e.cx("subtitle")},e.ptm("subtitle")),[o(e.$slots,"subtitle")],16)):s("",!0)],16)):s("",!0),d("div",t({class:e.cx("content")},e.ptm("content")),[o(e.$slots,"content")],16),e.$slots.footer?(a(),r("div",t({key:1,class:e.cx("footer")},e.ptm("footer")),[o(e.$slots,"footer")],16)):s("",!0)],16)],16)}u.render=b;export{u as s};
