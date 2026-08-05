import{G as f,am as m,an as b,ao as p,ap as v,a as o,b as d,d as c,I as l,f as u}from"./index-18hazH2F.js";import{b as y}from"./index-CDmBXs9u.js";var w=({dt:e})=>`
.p-slider {
    position: relative;
    background: ${e("slider.track.background")};
    border-radius: ${e("slider.track.border.radius")};
}

.p-slider-handle {
    cursor: grab;
    touch-action: none;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${e("slider.handle.height")};
    width: ${e("slider.handle.width")};
    background: ${e("slider.handle.background")};
    border-radius: ${e("slider.handle.border.radius")};
    transition: background ${e("slider.transition.duration")}, color ${e("slider.transition.duration")}, border-color ${e("slider.transition.duration")}, box-shadow ${e("slider.transition.duration")}, outline-color ${e("slider.transition.duration")};
    outline-color: transparent;
}

.p-slider-handle::before {
    content: "";
    width: ${e("slider.handle.content.width")};
    height: ${e("slider.handle.content.height")};
    display: block;
    background: ${e("slider.handle.content.background")};
    border-radius: ${e("slider.handle.content.border.radius")};
    box-shadow: ${e("slider.handle.content.shadow")};
    transition: background ${e("slider.transition.duration")};
}

.p-slider:not(.p-disabled) .p-slider-handle:hover {
    background: ${e("slider.handle.hover.background")};
}

.p-slider:not(.p-disabled) .p-slider-handle:hover::before {
    background: ${e("slider.handle.content.hover.background")};
}

.p-slider-handle:focus-visible {
    box-shadow: ${e("slider.handle.focus.ring.shadow")};
    outline: ${e("slider.handle.focus.ring.width")} ${e("slider.handle.focus.ring.style")} ${e("slider.handle.focus.ring.color")};
    outline-offset: ${e("slider.handle.focus.ring.offset")};
}

.p-slider-range {
    display: block;
    background: ${e("slider.range.background")};
    border-radius: ${e("slider.track.border.radius")};
}

.p-slider.p-slider-horizontal {
    height: ${e("slider.track.size")};
}

.p-slider-horizontal .p-slider-range {
    inset-block-start: 0;
    inset-inline-start: 0;
    height: 100%;
}

.p-slider-horizontal .p-slider-handle {
    inset-block-start: 50%;
    margin-block-start: calc(-1 * calc(${e("slider.handle.height")} / 2));
    margin-inline-start: calc(-1 * calc(${e("slider.handle.width")} / 2));
}

.p-slider-vertical {
    min-height: 100px;
    width: ${e("slider.track.size")};
}

.p-slider-vertical .p-slider-handle {
    inset-inline-start: 50%;
    margin-inline-start: calc(-1 * calc(${e("slider.handle.width")} / 2));
    margin-block-end: calc(-1 * calc(${e("slider.handle.height")} / 2));
}

.p-slider-vertical .p-slider-range {
    inset-block-end: 0;
    inset-inline-start: 0;
    width: 100%;
}
`,D={handle:{position:"absolute"},range:{position:"absolute"}},S={root:function(n){var i=n.instance,a=n.props;return["p-slider p-component",{"p-disabled":a.disabled,"p-invalid":i.$invalid,"p-slider-horizontal":a.orientation==="horizontal","p-slider-vertical":a.orientation==="vertical"}]},range:"p-slider-range",handle:"p-slider-handle"},k=f.extend({name:"slider",style:w,classes:S,inlineStyles:D}),L={name:"BaseSlider",extends:y,props:{min:{type:Number,default:0},max:{type:Number,default:100},orientation:{type:String,default:"horizontal"},step:{type:Number,default:null},range:{type:Boolean,default:!1},tabindex:{type:Number,default:0},ariaLabelledby:{type:String,default:null},ariaLabel:{type:String,default:null}},style:k,provide:function(){return{$pcSlider:this,$parentInstance:this}}};function E(e){return A(e)||M(e)||B(e)||P()}function P(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function B(e,n){if(e){if(typeof e=="string")return h(e,n);var i={}.toString.call(e).slice(8,-1);return i==="Object"&&e.constructor&&(i=e.constructor.name),i==="Map"||i==="Set"?Array.from(e):i==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)?h(e,n):void 0}}function M(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function A(e){if(Array.isArray(e))return h(e)}function h(e,n){(n==null||n>e.length)&&(n=e.length);for(var i=0,a=Array(n);i<n;i++)a[i]=e[i];return a}var z={name:"Slider",extends:L,inheritAttrs:!1,emits:["change","slideend"],dragging:!1,handleIndex:null,initX:null,initY:null,barWidth:null,barHeight:null,dragListener:null,dragEndListener:null,beforeUnmount:function(){this.unbindDragListeners()},methods:{updateDomData:function(){var n=this.$el.getBoundingClientRect();this.initX=n.left+m(),this.initY=n.top+b(),this.barWidth=this.$el.offsetWidth,this.barHeight=this.$el.offsetHeight},setValue:function(n){var i,a=n.touches?n.touches[0].pageX:n.pageX,s=n.touches?n.touches[0].pageY:n.pageY;this.orientation==="horizontal"?p(this.$el)?i=(this.initX+this.barWidth-a)*100/this.barWidth:i=(a-this.initX)*100/this.barWidth:i=(this.initY+this.barHeight-s)*100/this.barHeight;var r=(this.max-this.min)*(i/100)+this.min;if(this.step){var t=this.range?this.value[this.handleIndex]:this.value,g=r-t;g<0?r=t+Math.ceil(r/this.step-t/this.step)*this.step:g>0&&(r=t+Math.floor(r/this.step-t/this.step)*this.step)}else r=Math.floor(r);this.updateModel(n,r)},updateModel:function(n,i){var a=Math.round(i*100)/100,s;this.range?(s=this.value?E(this.value):[],this.handleIndex==0?(a<this.min?a=this.min:a>=this.max&&(a=this.max),s[0]=a):(a>this.max?a=this.max:a<=this.min&&(a=this.min),s[1]=a)):(a<this.min?a=this.min:a>this.max&&(a=this.max),s=a),this.writeValue(s,n),this.$emit("change",s)},onDragStart:function(n,i){this.disabled||(this.$el.setAttribute("data-p-sliding",!0),this.dragging=!0,this.updateDomData(),this.range&&this.value[0]===this.max?this.handleIndex=0:this.handleIndex=i,n.currentTarget.focus())},onDrag:function(n){this.dragging&&this.setValue(n)},onDragEnd:function(n){this.dragging&&(this.dragging=!1,this.$el.setAttribute("data-p-sliding",!1),this.$emit("slideend",{originalEvent:n,value:this.value}))},onBarClick:function(n){this.disabled||v(n.target,"data-pc-section")!=="handle"&&(this.updateDomData(),this.setValue(n))},onMouseDown:function(n,i){this.bindDragListeners(),this.onDragStart(n,i)},onKeyDown:function(n,i){switch(this.handleIndex=i,n.code){case"ArrowDown":case"ArrowLeft":this.decrementValue(n,i),n.preventDefault();break;case"ArrowUp":case"ArrowRight":this.incrementValue(n,i),n.preventDefault();break;case"PageDown":this.decrementValue(n,i,!0),n.preventDefault();break;case"PageUp":this.incrementValue(n,i,!0),n.preventDefault();break;case"Home":this.updateModel(n,this.min),n.preventDefault();break;case"End":this.updateModel(n,this.max),n.preventDefault();break}},onBlur:function(n,i){var a,s;(a=(s=this.formField).onBlur)===null||a===void 0||a.call(s,n)},decrementValue:function(n,i){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,s;this.range?this.step?s=this.value[i]-this.step:s=this.value[i]-1:this.step?s=this.value-this.step:!this.step&&a?s=this.value-10:s=this.value-1,this.updateModel(n,s),n.preventDefault()},incrementValue:function(n,i){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1,s;this.range?this.step?s=this.value[i]+this.step:s=this.value[i]+1:this.step?s=this.value+this.step:!this.step&&a?s=this.value+10:s=this.value+1,this.updateModel(n,s),n.preventDefault()},bindDragListeners:function(){this.dragListener||(this.dragListener=this.onDrag.bind(this),document.addEventListener("mousemove",this.dragListener)),this.dragEndListener||(this.dragEndListener=this.onDragEnd.bind(this),document.addEventListener("mouseup",this.dragEndListener))},unbindDragListeners:function(){this.dragListener&&(document.removeEventListener("mousemove",this.dragListener),this.dragListener=null),this.dragEndListener&&(document.removeEventListener("mouseup",this.dragEndListener),this.dragEndListener=null)},rangeStyle:function(){if(this.range){var n=this.rangeEndPosition>this.rangeStartPosition?this.rangeEndPosition-this.rangeStartPosition:this.rangeStartPosition-this.rangeEndPosition,i=this.rangeEndPosition>this.rangeStartPosition?this.rangeStartPosition:this.rangeEndPosition;return this.horizontal?{"inset-inline-start":i+"%",width:n+"%"}:{bottom:i+"%",height:n+"%"}}else return this.horizontal?{width:this.handlePosition+"%"}:{height:this.handlePosition+"%"}},handleStyle:function(){return this.horizontal?{"inset-inline-start":this.handlePosition+"%"}:{bottom:this.handlePosition+"%"}},rangeStartHandleStyle:function(){return this.horizontal?{"inset-inline-start":this.rangeStartPosition+"%"}:{bottom:this.rangeStartPosition+"%"}},rangeEndHandleStyle:function(){return this.horizontal?{"inset-inline-start":this.rangeEndPosition+"%"}:{bottom:this.rangeEndPosition+"%"}}},computed:{value:function(){var n;if(this.range){var i,a,s,r;return[(i=(a=this.d_value)===null||a===void 0?void 0:a[0])!==null&&i!==void 0?i:this.min,(s=(r=this.d_value)===null||r===void 0?void 0:r[1])!==null&&s!==void 0?s:this.max]}return(n=this.d_value)!==null&&n!==void 0?n:this.min},horizontal:function(){return this.orientation==="horizontal"},vertical:function(){return this.orientation==="vertical"},handlePosition:function(){return this.value<this.min?0:this.value>this.max?100:(this.value-this.min)*100/(this.max-this.min)},rangeStartPosition:function(){return this.value&&this.value[0]!==void 0?this.value[0]<this.min?0:(this.value[0]-this.min)*100/(this.max-this.min):0},rangeEndPosition:function(){return this.value&&this.value.length===2&&this.value[1]!==void 0?this.value[1]>this.max?100:(this.value[1]-this.min)*100/(this.max-this.min):100}}},V=["tabindex","aria-valuemin","aria-valuenow","aria-valuemax","aria-labelledby","aria-label","aria-orientation"],$=["tabindex","aria-valuemin","aria-valuenow","aria-valuemax","aria-labelledby","aria-label","aria-orientation"],T=["tabindex","aria-valuemin","aria-valuenow","aria-valuemax","aria-labelledby","aria-label","aria-orientation"];function x(e,n,i,a,s,r){return o(),d("div",l({class:e.cx("root"),onClick:n[18]||(n[18]=function(){return r.onBarClick&&r.onBarClick.apply(r,arguments)})},e.ptmi("root"),{"data-p-sliding":!1}),[c("span",l({class:e.cx("range"),style:[e.sx("range"),r.rangeStyle()]},e.ptm("range")),null,16),e.range?u("",!0):(o(),d("span",l({key:0,class:e.cx("handle"),style:[e.sx("handle"),r.handleStyle()],onTouchstartPassive:n[0]||(n[0]=function(t){return r.onDragStart(t)}),onTouchmovePassive:n[1]||(n[1]=function(t){return r.onDrag(t)}),onTouchend:n[2]||(n[2]=function(t){return r.onDragEnd(t)}),onMousedown:n[3]||(n[3]=function(t){return r.onMouseDown(t)}),onKeydown:n[4]||(n[4]=function(t){return r.onKeyDown(t)}),onBlur:n[5]||(n[5]=function(t){return r.onBlur(t)}),tabindex:e.tabindex,role:"slider","aria-valuemin":e.min,"aria-valuenow":e.d_value,"aria-valuemax":e.max,"aria-labelledby":e.ariaLabelledby,"aria-label":e.ariaLabel,"aria-orientation":e.orientation},e.ptm("handle")),null,16,V)),e.range?(o(),d("span",l({key:1,class:e.cx("handle"),style:[e.sx("handle"),r.rangeStartHandleStyle()],onTouchstartPassive:n[6]||(n[6]=function(t){return r.onDragStart(t,0)}),onTouchmovePassive:n[7]||(n[7]=function(t){return r.onDrag(t)}),onTouchend:n[8]||(n[8]=function(t){return r.onDragEnd(t)}),onMousedown:n[9]||(n[9]=function(t){return r.onMouseDown(t,0)}),onKeydown:n[10]||(n[10]=function(t){return r.onKeyDown(t,0)}),onBlur:n[11]||(n[11]=function(t){return r.onBlur(t,0)}),tabindex:e.tabindex,role:"slider","aria-valuemin":e.min,"aria-valuenow":e.d_value?e.d_value[0]:null,"aria-valuemax":e.max,"aria-labelledby":e.ariaLabelledby,"aria-label":e.ariaLabel,"aria-orientation":e.orientation},e.ptm("startHandler")),null,16,$)):u("",!0),e.range?(o(),d("span",l({key:2,class:e.cx("handle"),style:[e.sx("handle"),r.rangeEndHandleStyle()],onTouchstartPassive:n[12]||(n[12]=function(t){return r.onDragStart(t,1)}),onTouchmovePassive:n[13]||(n[13]=function(t){return r.onDrag(t)}),onTouchend:n[14]||(n[14]=function(t){return r.onDragEnd(t)}),onMousedown:n[15]||(n[15]=function(t){return r.onMouseDown(t,1)}),onKeydown:n[16]||(n[16]=function(t){return r.onKeyDown(t,1)}),onBlur:n[17]||(n[17]=function(t){return r.onBlur(t,1)}),tabindex:e.tabindex,role:"slider","aria-valuemin":e.min,"aria-valuenow":e.d_value?e.d_value[1]:null,"aria-valuemax":e.max,"aria-labelledby":e.ariaLabelledby,"aria-label":e.ariaLabel,"aria-orientation":e.orientation},e.ptm("endHandler")),null,16,T)):u("",!0)],16)}z.render=x;export{z as s};
