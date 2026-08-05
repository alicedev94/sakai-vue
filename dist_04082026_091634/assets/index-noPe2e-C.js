import{G as o,H as p,a as e,b as r,I as i,Q as d,f as l,i as u,t as b}from"./index-18hazH2F.js";var m=({dt:n})=>`
.p-progressbar {
    position: relative;
    overflow: hidden;
    height: ${n("progressbar.height")};
    background: ${n("progressbar.background")};
    border-radius: ${n("progressbar.border.radius")};
}

.p-progressbar-value {
    margin: 0;
    background: ${n("progressbar.value.background")};
}

.p-progressbar-label {
    color: ${n("progressbar.label.color")};
    font-size: ${n("progressbar.label.font.size")};
    font-weight: ${n("progressbar.label.font.weight")};
}

.p-progressbar-determinate .p-progressbar-value {
    height: 100%;
    width: 0%;
    position: absolute;
    display: none;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: width 1s ease-in-out;
}

.p-progressbar-determinate .p-progressbar-label {
    display: inline-flex;
}

.p-progressbar-indeterminate .p-progressbar-value::before {
    content: "";
    position: absolute;
    background: inherit;
    inset-block-start: 0;
    inset-inline-start: 0;
    inset-block-end: 0;
    will-change: inset-inline-start, inset-inline-end;
    animation: p-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}

.p-progressbar-indeterminate .p-progressbar-value::after {
    content: "";
    position: absolute;
    background: inherit;
    inset-block-start: 0;
    inset-inline-start: 0;
    inset-block-end: 0;
    will-change: inset-inline-start, inset-inline-end;
    animation: p-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
    animation-delay: 1.15s;
}

@keyframes p-progressbar-indeterminate-anim {
    0% {
        inset-inline-start: -35%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
    100% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
}
@-webkit-keyframes p-progressbar-indeterminate-anim {
    0% {
        inset-inline-start: -35%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
    100% {
        inset-inline-start: 100%;
        inset-inline-end: -90%;
    }
}

@keyframes p-progressbar-indeterminate-anim-short {
    0% {
        inset-inline-start: -200%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
    100% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
}
@-webkit-keyframes p-progressbar-indeterminate-anim-short {
    0% {
        inset-inline-start: -200%;
        inset-inline-end: 100%;
    }
    60% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
    100% {
        inset-inline-start: 107%;
        inset-inline-end: -8%;
    }
}
`,g={root:function(a){var t=a.instance;return["p-progressbar p-component",{"p-progressbar-determinate":t.determinate,"p-progressbar-indeterminate":t.indeterminate}]},value:"p-progressbar-value",label:"p-progressbar-label"},c=o.extend({name:"progressbar",style:m,classes:g}),v={name:"BaseProgressBar",extends:p,props:{value:{type:Number,default:null},mode:{type:String,default:"determinate"},showValue:{type:Boolean,default:!0}},style:c,provide:function(){return{$pcProgressBar:this,$parentInstance:this}}},f={name:"ProgressBar",extends:v,inheritAttrs:!1,computed:{progressStyle:function(){return{width:this.value+"%",display:"flex"}},indeterminate:function(){return this.mode==="indeterminate"},determinate:function(){return this.mode==="determinate"}}},h=["aria-valuenow"];function y(n,a,t,k,w,s){return e(),r("div",i({role:"progressbar",class:n.cx("root"),"aria-valuemin":"0","aria-valuenow":n.value,"aria-valuemax":"100"},n.ptmi("root")),[s.determinate?(e(),r("div",i({key:0,class:n.cx("value"),style:s.progressStyle},n.ptm("value")),[n.value!=null&&n.value!==0&&n.showValue?(e(),r("div",i({key:0,class:n.cx("label")},n.ptm("label")),[d(n.$slots,"default",{},function(){return[u(b(n.value+"%"),1)]})],16)):l("",!0)],16)):s.indeterminate?(e(),r("div",i({key:1,class:n.cx("value")},n.ptm("value")),null,16)):l("",!0)],16,h)}f.render=y;export{f as s};
