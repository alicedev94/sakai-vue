import{G as c,H as g,a as e,b as t,g as i,I as o,R as l,f as s,Q as d,d as p,t as u}from"./index-18hazH2F.js";var $=({dt:a})=>`
.p-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${a("tag.primary.background")};
    color: ${a("tag.primary.color")};
    font-size: ${a("tag.font.size")};
    font-weight: ${a("tag.font.weight")};
    padding: ${a("tag.padding")};
    border-radius: ${a("tag.border.radius")};
    gap: ${a("tag.gap")};
}

.p-tag-icon {
    font-size: ${a("tag.icon.size")};
    width: ${a("tag.icon.size")};
    height:${a("tag.icon.size")};
}

.p-tag-rounded {
    border-radius: ${a("tag.rounded.border.radius")};
}

.p-tag-success {
    background: ${a("tag.success.background")};
    color: ${a("tag.success.color")};
}

.p-tag-info {
    background: ${a("tag.info.background")};
    color: ${a("tag.info.color")};
}

.p-tag-warn {
    background: ${a("tag.warn.background")};
    color: ${a("tag.warn.color")};
}

.p-tag-danger {
    background: ${a("tag.danger.background")};
    color: ${a("tag.danger.color")};
}

.p-tag-secondary {
    background: ${a("tag.secondary.background")};
    color: ${a("tag.secondary.color")};
}

.p-tag-contrast {
    background: ${a("tag.contrast.background")};
    color: ${a("tag.contrast.color")};
}
`,y={root:function(r){var n=r.props;return["p-tag p-component",{"p-tag-info":n.severity==="info","p-tag-success":n.severity==="success","p-tag-warn":n.severity==="warn","p-tag-danger":n.severity==="danger","p-tag-secondary":n.severity==="secondary","p-tag-contrast":n.severity==="contrast","p-tag-rounded":n.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},b=c.extend({name:"tag",style:$,classes:y}),f={name:"BaseTag",extends:g,props:{value:null,severity:null,rounded:Boolean,icon:String},style:b,provide:function(){return{$pcTag:this,$parentInstance:this}}},k={name:"Tag",extends:f,inheritAttrs:!1};function m(a,r,n,v,h,w){return e(),t("span",o({class:a.cx("root")},a.ptmi("root")),[a.$slots.icon?(e(),i(l(a.$slots.icon),o({key:0,class:a.cx("icon")},a.ptm("icon")),null,16,["class"])):a.icon?(e(),t("span",o({key:1,class:[a.cx("icon"),a.icon]},a.ptm("icon")),null,16)):s("",!0),a.value!=null||a.$slots.default?d(a.$slots,"default",{key:2},function(){return[p("span",o({class:a.cx("label")},a.ptm("label")),u(a.value),17)]}):s("",!0)],16)}k.render=m;export{k as s};
