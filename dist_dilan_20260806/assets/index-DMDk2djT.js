import{H as o,I as s,a as t,b as e,R as p,J as i,t as v,g,n as d,S as c,f as u}from"./index-CwxAHeh0.js";var m=({dt:a})=>`
.p-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${a("avatar.width")};
    height: ${a("avatar.height")};
    font-size: ${a("avatar.font.size")};
    background: ${a("avatar.background")};
    color: ${a("avatar.color")};
    border-radius: ${a("avatar.border.radius")};
}

.p-avatar-image {
    background: transparent;
}

.p-avatar-circle {
    border-radius: 50%;
}

.p-avatar-circle img {
    border-radius: 50%;
}

.p-avatar-icon {
    font-size: ${a("avatar.icon.size")};
    width: ${a("avatar.icon.size")};
    height: ${a("avatar.icon.size")};
}

.p-avatar img {
    width: 100%;
    height: 100%;
}

.p-avatar-lg {
    width: ${a("avatar.lg.width")};
    height: ${a("avatar.lg.width")};
    font-size: ${a("avatar.lg.font.size")};
}

.p-avatar-lg .p-avatar-icon {
    font-size: ${a("avatar.lg.icon.size")};
    width: ${a("avatar.lg.icon.size")};
    height: ${a("avatar.lg.icon.size")};
}

.p-avatar-xl {
    width: ${a("avatar.xl.width")};
    height: ${a("avatar.xl.width")};
    font-size: ${a("avatar.xl.font.size")};
}

.p-avatar-xl .p-avatar-icon {
    font-size: ${a("avatar.xl.icon.size")};
    width: ${a("avatar.xl.icon.size")};
    height: ${a("avatar.xl.icon.size")};
}

.p-avatar-group {
    display: flex;
    align-items: center;
}

.p-avatar-group .p-avatar + .p-avatar {
    margin-inline-start: ${a("avatar.group.offset")};
}

.p-avatar-group .p-avatar {
    border: 2px solid ${a("avatar.group.border.color")};
}

.p-avatar-group .p-avatar-lg + .p-avatar-lg {
    margin-inline-start: ${a("avatar.lg.group.offset")};
}

.p-avatar-group .p-avatar-xl + .p-avatar-xl {
    margin-inline-start: ${a("avatar.xl.group.offset")};
}
`,h={root:function(r){var n=r.props;return["p-avatar p-component",{"p-avatar-image":n.image!=null,"p-avatar-circle":n.shape==="circle","p-avatar-lg":n.size==="large","p-avatar-xl":n.size==="xlarge"}]},label:"p-avatar-label",icon:"p-avatar-icon"},f=o.extend({name:"avatar",style:m,classes:h}),$={name:"BaseAvatar",extends:s,props:{label:{type:String,default:null},icon:{type:String,default:null},image:{type:String,default:null},size:{type:String,default:"normal"},shape:{type:String,default:"square"},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:f,provide:function(){return{$pcAvatar:this,$parentInstance:this}}},b={name:"Avatar",extends:$,inheritAttrs:!1,emits:["error"],methods:{onError:function(r){this.$emit("error",r)}}},y=["aria-labelledby","aria-label"],z=["src","alt"];function w(a,r,n,S,k,l){return t(),e("div",i({class:a.cx("root"),"aria-labelledby":a.ariaLabelledby,"aria-label":a.ariaLabel},a.ptmi("root")),[p(a.$slots,"default",{},function(){return[a.label?(t(),e("span",i({key:0,class:a.cx("label")},a.ptm("label")),v(a.label),17)):a.$slots.icon?(t(),g(c(a.$slots.icon),{key:1,class:d(a.cx("icon"))},null,8,["class"])):a.icon?(t(),e("span",i({key:2,class:[a.cx("icon"),a.icon]},a.ptm("icon")),null,16)):a.image?(t(),e("img",i({key:3,src:a.image,alt:a.ariaLabel,onError:r[0]||(r[0]=function(){return l.onError&&l.onError.apply(l,arguments)})},a.ptm("image")),null,16,z)):u("",!0)]})],16,y)}b.render=w;export{b as s};
