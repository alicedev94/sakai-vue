import{H as e,ag as u,a as b,b as l,d,J as r}from"./index-CwxAHeh0.js";import{a as s}from"./index-jlPcZyjB.js";var c=({dt:n})=>`
.p-radiobutton {
    position: relative;
    display: inline-flex;
    user-select: none;
    vertical-align: bottom;
    width: ${n("radiobutton.width")};
    height: ${n("radiobutton.height")};
}

.p-radiobutton-input {
    cursor: pointer;
    appearance: none;
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
    border: 1px solid transparent;
    border-radius: 50%;
}

.p-radiobutton-box {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: 1px solid ${n("radiobutton.border.color")};
    background: ${n("radiobutton.background")};
    width: ${n("radiobutton.width")};
    height: ${n("radiobutton.height")};
    transition: background ${n("radiobutton.transition.duration")}, color ${n("radiobutton.transition.duration")}, border-color ${n("radiobutton.transition.duration")}, box-shadow ${n("radiobutton.transition.duration")}, outline-color ${n("radiobutton.transition.duration")};
    outline-color: transparent;
    box-shadow: ${n("radiobutton.shadow")};
}

.p-radiobutton-icon {
    transition-duration: ${n("radiobutton.transition.duration")};
    background: transparent;
    font-size: ${n("radiobutton.icon.size")};
    width: ${n("radiobutton.icon.size")};
    height: ${n("radiobutton.icon.size")};
    border-radius: 50%;
    backface-visibility: hidden;
    transform: translateZ(0) scale(0.1);
}

.p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
    border-color: ${n("radiobutton.hover.border.color")};
}

.p-radiobutton-checked .p-radiobutton-box {
    border-color: ${n("radiobutton.checked.border.color")};
    background: ${n("radiobutton.checked.background")};
}

.p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
    background: ${n("radiobutton.icon.checked.color")};
    transform: translateZ(0) scale(1, 1);
    visibility: visible;
}

.p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:hover) .p-radiobutton-box {
    border-color: ${n("radiobutton.checked.hover.border.color")};
    background: ${n("radiobutton.checked.hover.background")};
}

.p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box .p-radiobutton-icon {
    background: ${n("radiobutton.icon.checked.hover.color")};
}

.p-radiobutton:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
    border-color: ${n("radiobutton.focus.border.color")};
    box-shadow: ${n("radiobutton.focus.ring.shadow")};
    outline: ${n("radiobutton.focus.ring.width")} ${n("radiobutton.focus.ring.style")} ${n("radiobutton.focus.ring.color")};
    outline-offset: ${n("radiobutton.focus.ring.offset")};
}

.p-radiobutton-checked:not(.p-disabled):has(.p-radiobutton-input:focus-visible) .p-radiobutton-box {
    border-color: ${n("radiobutton.checked.focus.border.color")};
}

.p-radiobutton.p-invalid > .p-radiobutton-box {
    border-color: ${n("radiobutton.invalid.border.color")};
}

.p-radiobutton.p-variant-filled .p-radiobutton-box {
    background: ${n("radiobutton.filled.background")};
}

.p-radiobutton.p-variant-filled.p-radiobutton-checked .p-radiobutton-box {
    background: ${n("radiobutton.checked.background")};
}

.p-radiobutton.p-variant-filled:not(.p-disabled):has(.p-radiobutton-input:hover).p-radiobutton-checked .p-radiobutton-box {
    background: ${n("radiobutton.checked.hover.background")};
}

.p-radiobutton.p-disabled {
    opacity: 1;
}

.p-radiobutton.p-disabled .p-radiobutton-box {
    background: ${n("radiobutton.disabled.background")};
    border-color: ${n("radiobutton.checked.disabled.border.color")};
}

.p-radiobutton-checked.p-disabled .p-radiobutton-box .p-radiobutton-icon {
    background: ${n("radiobutton.icon.disabled.color")};
}

.p-radiobutton-sm,
.p-radiobutton-sm .p-radiobutton-box {
    width: ${n("radiobutton.sm.width")};
    height: ${n("radiobutton.sm.height")};
}

.p-radiobutton-sm .p-radiobutton-icon {
    font-size: ${n("radiobutton.icon.sm.size")};
    width: ${n("radiobutton.icon.sm.size")};
    height: ${n("radiobutton.icon.sm.size")};
}

.p-radiobutton-lg,
.p-radiobutton-lg .p-radiobutton-box {
    width: ${n("radiobutton.lg.width")};
    height: ${n("radiobutton.lg.height")};
}

.p-radiobutton-lg .p-radiobutton-icon {
    font-size: ${n("radiobutton.icon.lg.size")};
    width: ${n("radiobutton.icon.lg.size")};
    height: ${n("radiobutton.icon.lg.size")};
}
`,p={root:function(t){var i=t.instance,a=t.props;return["p-radiobutton p-component",{"p-radiobutton-checked":i.checked,"p-disabled":a.disabled,"p-invalid":i.$pcRadioButtonGroup?i.$pcRadioButtonGroup.$invalid:i.$invalid,"p-variant-filled":i.$variant==="filled","p-radiobutton-sm p-inputfield-sm":a.size==="small","p-radiobutton-lg p-inputfield-lg":a.size==="large"}]},box:"p-radiobutton-box",input:"p-radiobutton-input",icon:"p-radiobutton-icon"},h=e.extend({name:"radiobutton",style:c,classes:p}),g={name:"BaseRadioButton",extends:s,props:{value:null,binary:Boolean,readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},inputId:{type:String,default:null},inputClass:{type:[String,Object],default:null},inputStyle:{type:Object,default:null},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:h,provide:function(){return{$pcRadioButton:this,$parentInstance:this}}},f={name:"RadioButton",extends:g,inheritAttrs:!1,emits:["change","focus","blur"],inject:{$pcRadioButtonGroup:{default:void 0}},methods:{getPTOptions:function(t){var i=t==="root"?this.ptmi:this.ptm;return i(t,{context:{checked:this.checked,disabled:this.disabled}})},onChange:function(t){if(!this.disabled&&!this.readonly){var i=this.binary?!this.checked:this.value;this.$pcRadioButtonGroup?this.$pcRadioButtonGroup.writeValue(i,t):this.writeValue(i,t),this.$emit("change",t)}},onFocus:function(t){this.$emit("focus",t)},onBlur:function(t){var i,a;this.$emit("blur",t),(i=(a=this.formField).onBlur)===null||i===void 0||i.call(a,t)}},computed:{groupName:function(){return this.$pcRadioButtonGroup?this.$pcRadioButtonGroup.groupName:this.$formName},checked:function(){var t=this.$pcRadioButtonGroup?this.$pcRadioButtonGroup.d_value:this.d_value;return t!=null&&(this.binary?!!t:u(t,this.value))}}},$=["data-p-checked","data-p-disabled"],v=["id","value","name","checked","tabindex","disabled","readonly","aria-labelledby","aria-label","aria-invalid"];function k(n,t,i,a,m,o){return b(),l("div",r({class:n.cx("root")},o.getPTOptions("root"),{"data-p-checked":o.checked,"data-p-disabled":n.disabled}),[d("input",r({id:n.inputId,type:"radio",class:[n.cx("input"),n.inputClass],style:n.inputStyle,value:n.value,name:o.groupName,checked:o.checked,tabindex:n.tabindex,disabled:n.disabled,readonly:n.readonly,"aria-labelledby":n.ariaLabelledby,"aria-label":n.ariaLabel,"aria-invalid":n.invalid||void 0,onFocus:t[0]||(t[0]=function(){return o.onFocus&&o.onFocus.apply(o,arguments)}),onBlur:t[1]||(t[1]=function(){return o.onBlur&&o.onBlur.apply(o,arguments)}),onChange:t[2]||(t[2]=function(){return o.onChange&&o.onChange.apply(o,arguments)})},o.getPTOptions("input")),null,16,v),d("div",r({class:n.cx("box")},o.getPTOptions("box")),[d("div",r({class:n.cx("icon")},o.getPTOptions("icon")),null,16)],16)],16,$)}f.render=k;export{f as s};
