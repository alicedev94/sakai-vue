import{H as o,I as l,a as t,b as r,J as d,R as a,f as s}from"./index-CwxAHeh0.js";var p=({dt:i})=>`
.p-divider-horizontal {
    display: flex;
    width: 100%;
    position: relative;
    align-items: center;
    margin: ${i("divider.horizontal.margin")};
    padding: ${i("divider.horizontal.padding")};
}

.p-divider-horizontal:before {
    position: absolute;
    display: block;
    inset-block-start: 50%;
    inset-inline-start: 0;
    width: 100%;
    content: "";
    border-block-start: 1px solid ${i("divider.border.color")};
}

.p-divider-horizontal .p-divider-content {
    padding: ${i("divider.horizontal.content.padding")};
}

.p-divider-vertical {
    min-height: 100%;
    display: flex;
    position: relative;
    justify-content: center;
    margin: ${i("divider.vertical.margin")};
    padding: ${i("divider.vertical.padding")};
}

.p-divider-vertical:before {
    position: absolute;
    display: block;
    inset-block-start: 0;
    inset-inline-start: 50%;
    height: 100%;
    content: "";
    border-inline-start: 1px solid ${i("divider.border.color")};
}

.p-divider.p-divider-vertical .p-divider-content {
    padding: ${i("divider.vertical.content.padding")};
}

.p-divider-content {
    z-index: 1;
    background: ${i("divider.content.background")};
    color: ${i("divider.content.color")};
}

.p-divider-solid.p-divider-horizontal:before {
    border-block-start-style: solid;
}

.p-divider-solid.p-divider-vertical:before {
    border-inline-start-style: solid;
}

.p-divider-dashed.p-divider-horizontal:before {
    border-block-start-style: dashed;
}

.p-divider-dashed.p-divider-vertical:before {
    border-inline-start-style: dashed;
}

.p-divider-dotted.p-divider-horizontal:before {
    border-block-start-style: dotted;
}

.p-divider-dotted.p-divider-vertical:before {
    border-inline-start-style: dotted;
}

.p-divider-left:dir(rtl),
.p-divider-right:dir(rtl) {
    flex-direction: row-reverse;
}
`,v={root:function(n){var e=n.props;return{justifyContent:e.layout==="horizontal"?e.align==="center"||e.align===null?"center":e.align==="left"?"flex-start":e.align==="right"?"flex-end":null:null,alignItems:e.layout==="vertical"?e.align==="center"||e.align===null?"center":e.align==="top"?"flex-start":e.align==="bottom"?"flex-end":null:null}}},c={root:function(n){var e=n.props;return["p-divider p-component","p-divider-"+e.layout,"p-divider-"+e.type,{"p-divider-left":e.layout==="horizontal"&&(!e.align||e.align==="left")},{"p-divider-center":e.layout==="horizontal"&&e.align==="center"},{"p-divider-right":e.layout==="horizontal"&&e.align==="right"},{"p-divider-top":e.layout==="vertical"&&e.align==="top"},{"p-divider-center":e.layout==="vertical"&&(!e.align||e.align==="center")},{"p-divider-bottom":e.layout==="vertical"&&e.align==="bottom"}]},content:"p-divider-content"},g=o.extend({name:"divider",style:p,classes:c,inlineStyles:v}),u={name:"BaseDivider",extends:l,props:{align:{type:String,default:null},layout:{type:String,default:"horizontal"},type:{type:String,default:"solid"}},style:g,provide:function(){return{$pcDivider:this,$parentInstance:this}}},y={name:"Divider",extends:u,inheritAttrs:!1},b=["aria-orientation"];function f(i,n,e,h,m,$){return t(),r("div",d({class:i.cx("root"),style:i.sx("root"),role:"separator","aria-orientation":i.layout},i.ptmi("root")),[i.$slots.default?(t(),r("div",d({key:0,class:i.cx("content")},i.ptm("content")),[a(i.$slots,"default")],16)):s("",!0)],16,b)}y.render=f;export{y as s};
