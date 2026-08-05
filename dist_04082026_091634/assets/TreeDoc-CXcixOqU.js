import{G as Ae,aC as He,aD as A,ae as M,aE as re,ap as w,ax as oe,aA as le,ar as ie,aF as ae,Y as Be,ao as Ve,av as Pe,W as G,a0 as T,aw as We,ah as ze,H,I as p,aG as Z,aH as _,a as c,b as h,g as f,R as C,f as b,t as ee,aI as Ue,O as z,d as k,at as xe,as as Ge,aa as Xe,ai as qe,w as Je,F as S,n as y,v as g,i as Qe,aJ as se,a5 as j,S as X,af as Ye,r as O,Q as m,P as de,m as W,o as Ze,j as E}from"./index-18hazH2F.js";import{s as _e}from"./index-WbIaz6rM.js";import{a as ce,b as ue,c as pe,s as et}from"./index-BTqLOyt3.js";import{s as tt}from"./index-0h0MS2T2.js";import{s as nt}from"./index-D0jGIdaC.js";import{s as rt}from"./index-DT5JSPqZ.js";import{s as ot}from"./index-BdNnIVrv.js";import{s as lt}from"./index-DfrDnoUo.js";import"./index-Bm5QzyoQ.js";import"./index-cUYiCtvH.js";import"./index-CDmBXs9u.js";import"./index-G52WnAtL.js";import"./index-JvqqPqKx.js";import"./index-B8WkEvHs.js";var it=({dt:e})=>`
.p-treetable {
    position: relative;
}

.p-treetable-table {
    border-spacing: 0;
    border-collapse: separate;
    width: 100%;
}

.p-treetable-scrollable > .p-treetable-table-container {
    position: relative;
}

.p-treetable-scrollable-table > .p-treetable-thead {
    inset-block-start: 0;
    z-index: 1;
}

.p-treetable-scrollable-table > .p-treetable-frozen-tbody {
    position: sticky;
    z-index: 1;
}

.p-treetable-scrollable-table > .p-treetable-tfoot {
    inset-block-end: 0;
    z-index: 1;
}

.p-treetable-scrollable .p-treetable-frozen-column {
    position: sticky;
    background: ${e("treetable.header.cell.background")};
}

.p-treetable-scrollable th.p-treetable-frozen-column {
    z-index: 1;
}

.p-treetable-scrollable > .p-treetable-table-container > .p-treetable-table > .p-treetable-thead {
    background: ${e("treetable.header.cell.background")};
}

.p-treetable-scrollable > .p-treetable-table-container > .p-treetable-table > .p-treetable-tfoot {
    background: ${e("treetable.footer.cell.background")};
}

.p-treetable-flex-scrollable {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.p-treetable-flex-scrollable > .p-treetable-table-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
}

.p-treetable-scrollable-table > .p-treetable-tbody > .p-treetable-row-group-header {
    position: sticky;
    z-index: 1;
}

.p-treetable-resizable-table > .p-treetable-thead > tr > th,
.p-treetable-resizable-table > .p-treetable-tfoot > tr > td,
.p-treetable-resizable-table > .p-treetable-tbody > tr > td {
    overflow: hidden;
    white-space: nowrap;
}

.p-treetable-resizable-table > .p-treetable-thead > tr > th.p-treetable-resizable-column:not(.p-treetable-frozen-column) {
    background-clip: padding-box;
    position: relative;
}

.p-treetable-resizable-table-fit > .p-treetable-thead > tr > th.p-treetable-resizable-column:last-child .p-treetable-column-resizer {
    display: none;
}

.p-treetable-column-resizer {
    display: block;
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    margin: 0;
    width: ${e("treetable.column.resizer.width")};
    height: 100%;
    padding: 0;
    cursor: col-resize;
    border: 1px solid transparent;
}

.p-treetable-column-header-content {
    display: flex;
    align-items: center;
    gap: ${e("treetable.header.cell.gap")};
}

.p-treetable-column-resize-indicator {
    width: ${e("treetable.resize.indicator.width")};
    position: absolute;
    z-index: 10;
    display: none;
    background: ${e("treetable.resize.indicator.color")};
}

.p-treetable-mask {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.p-treetable-paginator-top {
    border-color: ${e("treetable.paginator.top.border.color")};
    border-style: solid;
    border-width: ${e("treetable.paginator.top.border.width")};
}

.p-treetable-paginator-bottom {
    border-color: ${e("treetable.paginator.bottom.border.color")};
    border-style: solid;
    border-width: ${e("treetable.paginator.bottom.border.width")};
}

.p-treetable-header {
    background: ${e("treetable.header.background")};
    color: ${e("treetable.header.color")};
    border-color: ${e("treetable.header.border.color")};
    border-style: solid;
    border-width: ${e("treetable.header.border.width")};
    padding: ${e("treetable.header.padding")};
}

.p-treetable-footer {
    background: ${e("treetable.footer.background")};
    color: ${e("treetable.footer.color")};
    border-color: ${e("treetable.footer.border.color")};
    border-style: solid;
    border-width: ${e("treetable.footer.border.width")};
    padding: ${e("treetable.footer.padding")};
}

.p-treetable-header-cell {
    padding: ${e("treetable.header.cell.padding")};
    background: ${e("treetable.header.cell.background")};
    border-color: ${e("treetable.header.cell.border.color")};
    border-style: solid;
    border-width: 0 0 1px 0;
    color: ${e("treetable.header.cell.color")};
    font-weight: normal;
    text-align: start;
    transition: background ${e("treetable.transition.duration")}, color ${e("treetable.transition.duration")}, border-color ${e("treetable.transition.duration")},
            outline-color ${e("treetable.transition.duration")}, box-shadow ${e("treetable.transition.duration")};
}

.p-treetable-column-title {
    font-weight: ${e("treetable.column.title.font.weight")};
}

.p-treetable-tbody > tr {
    outline-color: transparent;
    background: ${e("treetable.row.background")};
    color: ${e("treetable.row.color")};
    transition: background ${e("treetable.transition.duration")}, color ${e("treetable.transition.duration")}, border-color ${e("treetable.transition.duration")},
            outline-color ${e("treetable.transition.duration")}, box-shadow ${e("treetable.transition.duration")};
}

.p-treetable-tbody > tr > td {
    text-align: start;
    border-color: ${e("treetable.body.cell.border.color")};
    border-style: solid;
    border-width: 0 0 1px 0;
    padding: ${e("treetable.body.cell.padding")};
}

.p-treetable-hoverable .p-treetable-tbody > tr:not(.p-treetable-row-selected):hover {
    background: ${e("treetable.row.hover.background")};
    color: ${e("treetable.row.hover.color")};
}

.p-treetable-tbody > tr.p-treetable-row-selected {
    background: ${e("treetable.row.selected.background")};
    color: ${e("treetable.row.selected.color")};
}

.p-treetable-tbody > tr:has(+ .p-treetable-row-selected) > td {
    border-block-end-color: ${e("treetable.body.cell.selected.border.color")};
}

.p-treetable-tbody > tr.p-treetable-row-selected > td {
    border-block-end-color: ${e("treetable.body.cell.selected.border.color")};
}

.p-treetable-tbody > tr:focus-visible,
.p-treetable-tbody > tr.p-treetable-contextmenu-row-selected {
    box-shadow: ${e("treetable.row.focus.ring.shadow")};
    outline: ${e("treetable.row.focus.ring.width")} ${e("treetable.row.focus.ring.style")} ${e("treetable.row.focus.ring.color")};
    outline-offset: ${e("treetable.row.focus.ring.offset")};
}

.p-treetable-tfoot > tr > td {
    text-align: start;
    padding: ${e("treetable.footer.cell.padding")};
    border-color: ${e("treetable.footer.cell.border.color")};
    border-style: solid;
    border-width: 0 0 1px 0;
    color: ${e("treetable.footer.cell.color")};
    background: ${e("treetable.footer.cell.background")};
}

.p-treetable-column-footer {
    font-weight: ${e("treetable.column.footer.font.weight")};
}

.p-treetable-sortable-column {
    cursor: pointer;
    user-select: none;
    outline-color: transparent;
}

.p-treetable-column-title,
.p-treetable-sort-icon,
.p-treetable-sort-badge {
    vertical-align: middle;
}

.p-treetable-sort-icon {
    color: ${e("treetable.sort.icon.color")};
    font-size: ${e("treetable.sort.icon.size")};
    width: ${e("treetable.sort.icon.size")};
    height: ${e("treetable.sort.icon.size")};
    transition: color ${e("treetable.transition.duration")};
}

.p-treetable-sortable-column:not(.p-treetable-column-sorted):hover {
    background: ${e("treetable.header.cell.hover.background")};
    color: ${e("treetable.header.cell.hover.color")};
}

.p-treetable-sortable-column:not(.p-treetable-column-sorted):hover .p-treetable-sort-icon {
    color: ${e("treetable.sort.icon.hover.color")};
}

.p-treetable-column-sorted {
    background: ${e("treetable.header.cell.selected.background")};
    color: ${e("treetable.header.cell.selected.color")};
}

.p-treetable-column-sorted .p-treetable-sort-icon {
    color: ${e("treetable.header.cell.selected.color")};
}

.p-treetable-sortable-column:focus-visible {
    box-shadow: ${e("treetable.header.cell.focus.ring.shadow")};
    outline: ${e("treetable.header.cell.focus.ring.width")} ${e("treetable.header.cell.focus.ring.style")} ${e("treetable.header.cell.focus.ring.color")};
    outline-offset: ${e("treetable.header.cell.focus.ring.offset")};
}

.p-treetable-hoverable .p-treetable-selectable-row {
    cursor: pointer;
}

.p-treetable-loading-icon {
    font-size: ${e("treetable.loading.icon.size")};
    width: ${e("treetable.loading.icon.size")};
    height: ${e("treetable.loading.icon.size")};
}

.p-treetable-gridlines .p-treetable-header {
    border-width: 1px 1px 0 1px;
}

.p-treetable-gridlines .p-treetable-footer {
    border-width: 0 1px 1px 1px;
}

.p-treetable-gridlines .p-treetable-paginator-top {
    border-width: 1px 1px 0 1px;
}

.p-treetable-gridlines .p-treetable-paginator-bottom {
    border-width: 0 1px 1px 1px;
}

.p-treetable-gridlines .p-treetable-thead > tr > th {
    border-width: 1px 0 1px 1px;
}

.p-treetable-gridlines .p-treetable-thead > tr > th:last-child {
    border-width: 1px;
}

.p-treetable-gridlines .p-treetable-tbody > tr > td {
    border-width: 1px 0 0 1px;
}

.p-treetable-gridlines .p-treetable-tbody > tr > td:last-child {
    border-width: 1px 1px 0 1px;
}

.p-treetable-gridlines .p-treetable-tbody > tr:last-child > td {
    border-width: 1px 0 1px 1px;
}

.p-treetable-gridlines .p-treetable-tbody > tr:last-child > td:last-child {
    border-width: 1px;
}

.p-treetable-gridlines .p-treetable-tfoot > tr > td {
    border-width: 1px 0 1px 1px;
}

.p-treetable-gridlines .p-treetable-tfoot > tr > td:last-child {
    border-width: 1px 1px 1px 1px;
}

.p-treetable.p-treetable-gridlines .p-treetable-thead + .p-treetable-tfoot > tr > td {
    border-width: 0 0 1px 1px;
}

.p-treetable.p-treetable-gridlines .p-treetable-thead + .p-treetable-tfoot > tr > td:last-child {
    border-width: 0 1px 1px 1px;
}

.p-treetable.p-treetable-gridlines:has(.p-treetable-thead):has(.p-treetable-tbody) .p-treetable-tbody > tr > td {
    border-width: 0 0 1px 1px;
}

.p-treetable.p-treetable-gridlines:has(.p-treetable-thead):has(.p-treetable-tbody) .p-treetable-tbody > tr > td:last-child {
    border-width: 0 1px 1px 1px;
}

.p-treetable.p-treetable-gridlines:has(.p-treetable-tbody):has(.p-treetable-tfoot) .p-treetable-tbody > tr:last-child > td {
    border-width: 0 0 0 1px;
}

.p-treetable.p-treetable-gridlines:has(.p-treetable-tbody):has(.p-treetable-tfoot) .p-treetable-tbody > tr:last-child > td:last-child {
    border-width: 0 1px 0 1px;
}

.p-treetable.p-treetable-sm .p-treetable-header {
    padding: 0.375rem 0.5rem;
}

.p-treetable.p-treetable-sm .p-treetable-thead > tr > th {
    padding: 0.375rem 0.5rem;
}

.p-treetable.p-treetable-sm .p-treetable-tbody > tr > td {
    padding: 0.375rem 0.5rem;
}

.p-treetable.p-treetable-sm .p-treetable-tfoot > tr > td {
    padding: 0.375rem 0.5rem;
}

.p-treetable.p-treetable-sm .p-treetable-footer {
    padding: 0.375rem 0.5rem;
}

.p-treetable.p-treetable-lg .p-treetable-header {
    padding: 0.9375rem 1.25rem;
}

.p-treetable.p-treetable-lg .p-treetable-thead > tr > th {
    padding: 0.9375rem 1.25rem;
}

.p-treetable.p-treetable-lg .p-treetable-tbody > tr > td {
    padding: 0.9375rem 1.25rem;
}

.p-treetable.p-treetable-lg .p-treetable-tfoot > tr > td {
    padding: 0.9375rem 1.25rem;
}

.p-treetable.p-treetable-lg .p-treetable-footer {
    padding: 0.9375rem 1.25rem;
}

.p-treetable-body-cell-content {
    display: flex;
    align-items: center;
    gap: ${e("treetable.body.cell.gap")};
}

.p-treetable-tbody > tr.p-treetable-row-selected .p-treetable-node-toggle-button {
    color: inherit;
}

.p-treetable-node-toggle-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    width: ${e("treetable.node.toggle.button.size")};
    height: ${e("treetable.node.toggle.button.size")};
    color: ${e("treetable.node.toggle.button.color")};
    border: 0 none;
    background: transparent;
    cursor: pointer;
    border-radius: ${e("treetable.node.toggle.button.border.radius")};
    transition: background ${e("treetable.transition.duration")}, color ${e("treetable.transition.duration")}, border-color ${e("treetable.transition.duration")},
            outline-color ${e("treetable.transition.duration")}, box-shadow ${e("treetable.transition.duration")};
    outline-color: transparent;
    user-select: none;
}

.p-treetable-node-toggle-button:enabled:hover {
    color: ${e("treetable.node.toggle.button.hover.color")};
    background: ${e("treetable.node.toggle.button.hover.background")};
}

.p-treetable-tbody > tr.p-treetable-row-selected .p-treetable-node-toggle-button:hover {
    background: ${e("treetable.node.toggle.button.selected.hover.background")};
    color: ${e("treetable.node.toggle.button.selected.hover.color")};
}

.p-treetable-node-toggle-button:focus-visible {
    box-shadow: ${e("treetable.node.toggle.button.focus.ring.shadow")};
    outline: ${e("treetable.node.toggle.button.focus.ring.width")} ${e("treetable.node.toggle.button.focus.ring.style")} ${e("treetable.node.toggle.button.focus.ring.color")};
    outline-offset: ${e("treetable.node.toggle.button.focus.ring.offset")};
}

.p-treetable-node-toggle-icon:dir(rtl) {
    transform: rotate(180deg);
}
`,at={root:function(t){var n=t.instance,r=t.props;return["p-treetable p-component",{"p-treetable-hoverable":r.rowHover||n.rowSelectionMode,"p-treetable-resizable":r.resizableColumns,"p-treetable-resizable-fit":r.resizableColumns&&r.columnResizeMode==="fit","p-treetable-scrollable":r.scrollable,"p-treetable-flex-scrollable":r.scrollable&&r.scrollHeight==="flex","p-treetable-gridlines":r.showGridlines,"p-treetable-sm":r.size==="small","p-treetable-lg":r.size==="large"}]},loading:"p-treetable-loading",mask:"p-treetable-mask p-overlay-mask",loadingIcon:"p-treetable-loading-icon",header:"p-treetable-header",paginator:function(t){var n=t.position;return"p-treetable-paginator-"+n},tableContainer:"p-treetable-table-container",table:function(t){var n=t.props;return["p-treetable-table",{"p-treetable-scrollable-table":n.scrollable,"p-treetable-resizable-table":n.resizableColumns,"p-treetable-resizable-table-fit":n.resizableColumns&&n.columnResizeMode==="fit"}]},thead:"p-treetable-thead",headerCell:function(t){var n=t.instance,r=t.props,l=t.context;return["p-treetable-header-cell",{"p-treetable-sortable-column":n.columnProp("sortable"),"p-treetable-resizable-column":r.resizableColumns,"p-treetable-column-sorted":l==null?void 0:l.sorted,"p-treetable-frozen-column":n.columnProp("frozen")}]},columnResizer:"p-treetable-column-resizer",columnHeaderContent:"p-treetable-column-header-content",columnTitle:"p-treetable-column-title",sortIcon:"p-treetable-sort-icon",pcSortBadge:"p-treetable-sort-badge",tbody:"p-treetable-tbody",row:function(t){var n=t.props,r=t.instance;return[{"p-treetable-row-selected":r.selected,"p-treetable-contextmenu-row-selected":n.contextMenuSelection&&r.isSelectedWithContextMenu}]},bodyCell:function(t){var n=t.instance;return[{"p-treetable-frozen-column":n.columnProp("frozen")}]},bodyCellContent:function(t){var n=t.instance;return["p-treetable-body-cell-content",{"p-treetable-body-cell-content-expander":n.columnProp("expander")}]},nodeToggleButton:"p-treetable-node-toggle-button",nodeToggleIcon:"p-treetable-node-toggle-icon",pcNodeCheckbox:"p-treetable-node-checkbox",emptyMessage:"p-treetable-empty-message",tfoot:"p-treetable-tfoot",footerCell:function(t){var n=t.instance;return[{"p-treetable-frozen-column":n.columnProp("frozen")}]},footer:"p-treetable-footer",columnResizeIndicator:"p-treetable-column-resize-indicator"},st={tableContainer:{overflow:"auto"},thead:{position:"sticky"},tfoot:{position:"sticky"}},dt=Ae.extend({name:"treetable",style:it,classes:at,inlineStyles:st}),ct={name:"BaseTreeTable",extends:H,props:{value:{type:null,default:null},dataKey:{type:[String,Function],default:"key"},expandedKeys:{type:null,default:null},selectionKeys:{type:null,default:null},selectionMode:{type:String,default:null},metaKeySelection:{type:Boolean,default:!1},contextMenu:{type:Boolean,default:!1},contextMenuSelection:{type:Object,default:null},rows:{type:Number,default:0},first:{type:Number,default:0},totalRecords:{type:Number,default:0},paginator:{type:Boolean,default:!1},paginatorPosition:{type:String,default:"bottom"},alwaysShowPaginator:{type:Boolean,default:!0},paginatorTemplate:{type:String,default:"FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"},pageLinkSize:{type:Number,default:5},rowsPerPageOptions:{type:Array,default:null},currentPageReportTemplate:{type:String,default:"({currentPage} of {totalPages})"},lazy:{type:Boolean,default:!1},loading:{type:Boolean,default:!1},loadingIcon:{type:String,default:void 0},loadingMode:{type:String,default:"mask"},rowHover:{type:Boolean,default:!1},autoLayout:{type:Boolean,default:!1},sortField:{type:[String,Function],default:null},sortOrder:{type:Number,default:null},defaultSortOrder:{type:Number,default:1},multiSortMeta:{type:Array,default:null},sortMode:{type:String,default:"single"},removableSort:{type:Boolean,default:!1},filters:{type:Object,default:null},filterMode:{type:String,default:"lenient"},filterLocale:{type:String,default:void 0},resizableColumns:{type:Boolean,default:!1},columnResizeMode:{type:String,default:"fit"},indentation:{type:Number,default:1},showGridlines:{type:Boolean,default:!1},scrollable:{type:Boolean,default:!1},scrollHeight:{type:String,default:null},size:{type:String,default:null},tableStyle:{type:null,default:null},tableClass:{type:[String,Object],default:null},tableProps:{type:Object,default:null}},style:dt,provide:function(){return{$pcTreeTable:this,$parentInstance:this}}},Me={name:"FooterCell",hostName:"TreeTable",extends:H,props:{column:{type:Object,default:null},index:{type:Number,default:null}},data:function(){return{styleObject:{}}},mounted:function(){this.columnProp("frozen")&&this.updateStickyPosition()},updated:function(){this.columnProp("frozen")&&this.updateStickyPosition()},methods:{columnProp:function(t){return A(this.column,t)},getColumnPT:function(t){var n,r={props:this.column.props,parent:{instance:this,props:this.$props,state:this.$data},context:{index:this.index,frozen:this.columnProp("frozen"),size:(n=this.$parentInstance)===null||n===void 0?void 0:n.size}};return p(this.ptm("column.".concat(t),{column:r}),this.ptm("column.".concat(t),r),this.ptmo(this.getColumnProp(),t,r))},getColumnProp:function(){return this.column.props&&this.column.props.pt?this.column.props.pt:void 0},updateStickyPosition:function(){if(this.columnProp("frozen")){var t=this.columnProp("alignFrozen");if(t==="right"){var n=0,r=Z(this.$el,'[data-p-frozen-column="true"]');r&&(n=T(r)+parseFloat(r.style["inset-inline-end"]||0)),this.styleObject.insetInlineEnd=n+"px"}else{var l=0,o=_(this.$el,'[data-p-frozen-column="true"]');o&&(l=T(o)+parseFloat(o.style["inset-inline-start"]||0)),this.styleObject.insetInlineStart=l+"px"}}}},computed:{containerClass:function(){return[this.columnProp("footerClass"),this.columnProp("class"),this.cx("footerCell")]},containerStyle:function(){var t=this.columnProp("footerStyle"),n=this.columnProp("style");return this.columnProp("frozen")?[n,t,this.styleObject]:[n,t]}}};function R(e){"@babel/helpers - typeof";return R=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},R(e)}function he(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable})),n.push.apply(n,r)}return n}function fe(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?he(Object(n),!0).forEach(function(r){ut(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):he(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function ut(e,t,n){return(t=pt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function pt(e){var t=ht(e,"string");return R(t)=="symbol"?t:t+""}function ht(e,t){if(R(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(R(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var ft=["data-p-frozen-column"];function bt(e,t,n,r,l,o){return c(),h("td",p({style:o.containerStyle,class:o.containerClass,role:"cell"},fe(fe({},o.getColumnPT("root")),o.getColumnPT("footerCell")),{"data-p-frozen-column":o.columnProp("frozen")}),[n.column.children&&n.column.children.footer?(c(),f(C(n.column.children.footer),{key:0,column:n.column},null,8,["column"])):b("",!0),o.columnProp("footer")?(c(),h("span",p({key:1,class:e.cx("columnFooter")},o.getColumnPT("columnFooter")),ee(o.columnProp("footer")),17)):b("",!0)],16,ft)}Me.render=bt;var Te={name:"HeaderCell",hostName:"TreeTable",extends:H,emits:["column-click","column-resizestart"],props:{column:{type:Object,default:null},resizableColumns:{type:Boolean,default:!1},sortField:{type:[String,Function],default:null},sortOrder:{type:Number,default:null},multiSortMeta:{type:Array,default:null},sortMode:{type:String,default:"single"},index:{type:Number,default:null}},data:function(){return{styleObject:{}}},mounted:function(){this.columnProp("frozen")&&this.updateStickyPosition()},updated:function(){this.columnProp("frozen")&&this.updateStickyPosition()},methods:{columnProp:function(t){return A(this.column,t)},getColumnPT:function(t){var n,r={props:this.column.props,parent:{instance:this,props:this.$props,state:this.$data},context:{index:this.index,sorted:this.isColumnSorted(),frozen:this.$parentInstance.scrollable&&this.columnProp("frozen"),resizable:this.resizableColumns,scrollable:this.$parentInstance.scrollable,showGridlines:this.$parentInstance.showGridlines,size:(n=this.$parentInstance)===null||n===void 0?void 0:n.size}};return p(this.ptm("column.".concat(t),{column:r}),this.ptm("column.".concat(t),r),this.ptmo(this.getColumnProp(),t,r))},getColumnProp:function(){return this.column.props&&this.column.props.pt?this.column.props.pt:void 0},updateStickyPosition:function(){if(this.columnProp("frozen")){var t=this.columnProp("alignFrozen");if(t==="right"){var n=0,r=Z(this.$el,'[data-p-frozen-column="true"]');r&&(n=T(r)+parseFloat(r.style["inset-inline-end"]||0)),this.styleObject.insetInlineEnd=n+"px"}else{var l=0,o=_(this.$el,'[data-p-frozen-column="true"]');o&&(l=T(o)+parseFloat(o.style["inset-inline-start"]||0)),this.styleObject.insetInlineStart=l+"px"}var a=this.$el.parentElement.nextElementSibling;if(a){var s=Pe(this.$el);a.children[s].style["inset-inline-start"]=this.styleObject["inset-inline-start"],a.children[s].style["inset-inline-end"]=this.styleObject["inset-inline-end"]}}},onClick:function(t){this.$emit("column-click",{originalEvent:t,column:this.column})},onKeyDown:function(t){(t.code==="Enter"||t.code==="NumpadEnter"||t.code==="Space")&&t.currentTarget.nodeName==="TH"&&w(t.currentTarget,"data-p-sortable-column")&&(this.$emit("column-click",{originalEvent:t,column:this.column}),t.preventDefault())},onResizeStart:function(t){this.$emit("column-resizestart",t)},getMultiSortMetaIndex:function(){for(var t=-1,n=0;n<this.multiSortMeta.length;n++){var r=this.multiSortMeta[n];if(r.field===this.columnProp("field")||r.field===this.columnProp("sortField")){t=n;break}}return t},isMultiSorted:function(){return this.columnProp("sortable")&&this.getMultiSortMetaIndex()>-1},isColumnSorted:function(){return this.sortMode==="single"?this.sortField&&(this.sortField===this.columnProp("field")||this.sortField===this.columnProp("sortField")):this.isMultiSorted()}},computed:{containerClass:function(){return[this.columnProp("headerClass"),this.columnProp("class"),this.cx("headerCell")]},containerStyle:function(){var t=this.columnProp("headerStyle"),n=this.columnProp("style");return this.columnProp("frozen")?[n,t,this.styleObject]:[n,t]},sortState:function(){var t=!1,n=null;if(this.sortMode==="single")t=this.sortField&&(this.sortField===this.columnProp("field")||this.sortField===this.columnProp("sortField")),n=t?this.sortOrder:0;else if(this.sortMode==="multiple"){var r=this.getMultiSortMetaIndex();r>-1&&(t=!0,n=this.multiSortMeta[r].order)}return{sorted:t,sortOrder:n}},sortableColumnIcon:function(){var t=this.sortState,n=t.sorted,r=t.sortOrder;if(n){if(n&&r>0)return ue;if(n&&r<0)return pe}else return ce;return null},ariaSort:function(){if(this.columnProp("sortable")){var t=this.sortState,n=t.sorted,r=t.sortOrder;return n&&r<0?"descending":n&&r>0?"ascending":"none"}else return null}},components:{Badge:Ue,SortAltIcon:ce,SortAmountUpAltIcon:ue,SortAmountDownIcon:pe}};function I(e){"@babel/helpers - typeof";return I=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},I(e)}function be(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable})),n.push.apply(n,r)}return n}function me(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?be(Object(n),!0).forEach(function(r){mt(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):be(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function mt(e,t,n){return(t=gt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function gt(e){var t=yt(e,"string");return I(t)=="symbol"?t:t+""}function yt(e,t){if(I(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(I(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var vt=["tabindex","aria-sort","data-p-sortable-column","data-p-resizable-column","data-p-sorted","data-p-frozen-column"];function kt(e,t,n,r,l,o){var a=z("Badge");return c(),h("th",p({class:o.containerClass,style:[o.containerStyle],onClick:t[1]||(t[1]=function(){return o.onClick&&o.onClick.apply(o,arguments)}),onKeydown:t[2]||(t[2]=function(){return o.onKeyDown&&o.onKeyDown.apply(o,arguments)}),tabindex:o.columnProp("sortable")?"0":null,"aria-sort":o.ariaSort,role:"columnheader"},me(me({},o.getColumnPT("root")),o.getColumnPT("headerCell")),{"data-p-sortable-column":o.columnProp("sortable"),"data-p-resizable-column":n.resizableColumns,"data-p-sorted":o.isColumnSorted(),"data-p-frozen-column":o.columnProp("frozen")}),[n.resizableColumns&&!o.columnProp("frozen")?(c(),h("span",p({key:0,class:e.cx("columnResizer"),onMousedown:t[0]||(t[0]=function(){return o.onResizeStart&&o.onResizeStart.apply(o,arguments)})},o.getColumnPT("columnResizer")),null,16)):b("",!0),k("div",p({class:e.cx("columnHeaderContent")},o.getColumnPT("columnHeaderContent")),[n.column.children&&n.column.children.header?(c(),f(C(n.column.children.header),{key:0,column:n.column},null,8,["column"])):b("",!0),o.columnProp("header")?(c(),h("span",p({key:1,class:e.cx("columnTitle")},o.getColumnPT("columnTitle")),ee(o.columnProp("header")),17)):b("",!0),o.columnProp("sortable")?(c(),h("span",xe(p({key:2},o.getColumnPT("sort"))),[(c(),f(C(n.column.children&&n.column.children.sorticon||o.sortableColumnIcon),p({sorted:o.sortState.sorted,sortOrder:o.sortState.sortOrder,class:e.cx("sortIcon")},o.getColumnPT("sortIcon")),null,16,["sorted","sortOrder","class"]))],16)):b("",!0),o.isMultiSorted()?(c(),f(a,p({key:3,class:e.cx("pcSortBadge")},o.getColumnPT("pcSortBadge"),{value:o.getMultiSortMetaIndex()+1,size:"small"}),null,16,["class","value"])):b("",!0)],16)],16,vt)}Te.render=kt;var Oe={name:"BodyCell",hostName:"TreeTable",extends:H,emits:["node-toggle","checkbox-toggle"],props:{node:{type:Object,default:null},column:{type:Object,default:null},level:{type:Number,default:0},indentation:{type:Number,default:1},leaf:{type:Boolean,default:!1},expanded:{type:Boolean,default:!1},selectionMode:{type:String,default:null},checked:{type:Boolean,default:!1},partialChecked:{type:Boolean,default:!1},templates:{type:Object,default:null},index:{type:Number,default:null},loadingMode:{type:String,default:"mask"}},data:function(){return{styleObject:{}}},mounted:function(){this.columnProp("frozen")&&this.updateStickyPosition()},updated:function(){this.columnProp("frozen")&&this.updateStickyPosition()},methods:{toggle:function(){this.$emit("node-toggle",this.node)},columnProp:function(t){return A(this.column,t)},getColumnPT:function(t){var n,r={props:this.column.props,parent:{instance:this,props:this.$props,state:this.$data},context:{index:this.index,selectable:this.$parentInstance.rowHover||this.$parentInstance.rowSelectionMode,selected:this.$parent.selected,frozen:this.columnProp("frozen"),scrollable:this.$parentInstance.scrollable,showGridlines:this.$parentInstance.showGridlines,size:(n=this.$parentInstance)===null||n===void 0?void 0:n.size,node:this.node}};return p(this.ptm("column.".concat(t),{column:r}),this.ptm("column.".concat(t),r),this.ptmo(this.getColumnProp(),t,r))},getColumnProp:function(){return this.column.props&&this.column.props.pt?this.column.props.pt:void 0},getColumnCheckboxPT:function(t){var n={props:this.column.props,parent:{instance:this,props:this.$props,state:this.$data},context:{checked:this.checked,partialChecked:this.partialChecked,node:this.node}};return p(this.ptm("column.".concat(t),{column:n}),this.ptm("column.".concat(t),n),this.ptmo(this.getColumnProp(),t,n))},updateStickyPosition:function(){if(this.columnProp("frozen")){var t=this.columnProp("alignFrozen");if(t==="right"){var n=0,r=Z(this.$el,'[data-p-frozen-column="true"]');r&&(n=T(r)+parseFloat(r.style["inset-inline-end"]||0)),this.styleObject.insetInlineEnd=n+"px"}else{var l=0,o=_(this.$el,'[data-p-frozen-column="true"]');o&&(l=T(o)+parseFloat(o.style["inset-inline-start"]||0)),this.styleObject.insetInlineStart=l+"px"}}},resolveFieldData:function(t,n){return M(t,n)},toggleCheckbox:function(){this.$emit("checkbox-toggle")}},computed:{containerClass:function(){return[this.columnProp("bodyClass"),this.columnProp("class"),this.cx("bodyCell")]},containerStyle:function(){var t=this.columnProp("bodyStyle"),n=this.columnProp("style");return this.columnProp("frozen")?[n,t,this.styleObject]:[n,t]},togglerStyle:function(){return{marginLeft:this.level*this.indentation+"rem",visibility:this.leaf?"hidden":"visible"}},checkboxSelectionMode:function(){return this.selectionMode==="checkbox"}},components:{Checkbox:ot,ChevronRightIcon:nt,ChevronDownIcon:tt,CheckIcon:Ge,MinusIcon:rt,SpinnerIcon:ze},directives:{ripple:Xe}};function F(e){"@babel/helpers - typeof";return F=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},F(e)}function ge(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable})),n.push.apply(n,r)}return n}function ye(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?ge(Object(n),!0).forEach(function(r){St(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ge(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function St(e,t,n){return(t=Ct(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Ct(e){var t=wt(e,"string");return F(t)=="symbol"?t:t+""}function wt(e,t){if(F(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(F(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Pt=["data-p-frozen-column"];function zt(e,t,n,r,l,o){var a=z("SpinnerIcon"),s=z("Checkbox"),d=qe("ripple");return c(),h("td",p({style:o.containerStyle,class:o.containerClass,role:"cell"},ye(ye({},o.getColumnPT("root")),o.getColumnPT("bodyCell")),{"data-p-frozen-column":o.columnProp("frozen")}),[k("div",p({class:e.cx("bodyCellContent")},o.getColumnPT("bodyCellContent")),[o.columnProp("expander")?Je((c(),h("button",p({key:0,type:"button",class:e.cx("nodeToggleButton"),onClick:t[0]||(t[0]=function(){return o.toggle&&o.toggle.apply(o,arguments)}),style:o.togglerStyle,tabindex:"-1"},o.getColumnPT("nodeToggleButton"),{"data-pc-group-section":"rowactionbutton"}),[n.node.loading&&n.loadingMode==="icon"?(c(),h(S,{key:0},[n.templates.nodetoggleicon?(c(),f(C(n.templates.nodetoggleicon),{key:0})):b("",!0),n.templates.nodetogglericon?(c(),f(C(n.templates.nodetogglericon),{key:1})):(c(),f(a,p({key:2,spin:""},e.ptm("nodetoggleicon")),null,16))],64)):(c(),h(S,{key:1},[n.column.children&&n.column.children.rowtoggleicon?(c(),f(C(n.column.children.rowtoggleicon),{key:0,node:n.node,expanded:n.expanded,class:y(e.cx("nodeToggleIcon"))},null,8,["node","expanded","class"])):n.templates.nodetoggleicon?(c(),f(C(n.templates.nodetoggleicon),{key:1,node:n.node,expanded:n.expanded,class:y(e.cx("nodeToggleIcon"))},null,8,["node","expanded","class"])):n.column.children&&n.column.children.rowtogglericon?(c(),f(C(n.column.children.rowtogglericon),{key:2,node:n.node,expanded:n.expanded,class:y(e.cx("nodeToggleIcon"))},null,8,["node","expanded","class"])):n.expanded?(c(),f(C(n.node.expandedIcon?"span":"ChevronDownIcon"),p({key:3,class:e.cx("nodeToggleIcon")},o.getColumnPT("nodeToggleIcon")),null,16,["class"])):(c(),f(C(n.node.collapsedIcon?"span":"ChevronRightIcon"),p({key:4,class:e.cx("nodeToggleIcon")},o.getColumnPT("nodeToggleIcon")),null,16,["class"]))],64))],16)),[[d]]):b("",!0),o.checkboxSelectionMode&&o.columnProp("expander")?(c(),f(s,{key:1,modelValue:n.checked,binary:!0,class:y(e.cx("pcNodeCheckbox")),disabled:n.node.selectable===!1,onChange:o.toggleCheckbox,tabindex:-1,indeterminate:n.partialChecked,unstyled:e.unstyled,pt:o.getColumnCheckboxPT("pcNodeCheckbox"),"data-p-partialchecked":n.partialChecked},{icon:g(function(u){return[n.templates.checkboxicon?(c(),f(C(n.templates.checkboxicon),{key:0,checked:u.checked,partialChecked:n.partialChecked,class:y(u.class)},null,8,["checked","partialChecked","class"])):b("",!0)]}),_:1},8,["modelValue","class","disabled","onChange","indeterminate","unstyled","pt","data-p-partialchecked"])):b("",!0),n.column.children&&n.column.children.body?(c(),f(C(n.column.children.body),{key:2,node:n.node,column:n.column},null,8,["node","column"])):(c(),h(S,{key:3},[Qe(ee(o.resolveFieldData(n.node.data,o.columnProp("field"))),1)],64))],16)],16,Pt)}Oe.render=zt;function D(e){"@babel/helpers - typeof";return D=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},D(e)}function q(e,t){var n=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=Ke(e))||t){n&&(e=n);var r=0,l=function(){};return{s:l,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(u){throw u},f:l}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,a=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var u=n.next();return a=u.done,u},e:function(u){s=!0,o=u},f:function(){try{a||n.return==null||n.return()}finally{if(s)throw o}}}}function ve(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable})),n.push.apply(n,r)}return n}function J(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?ve(Object(n),!0).forEach(function(r){xt(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ve(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function xt(e,t,n){return(t=Mt(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Mt(e){var t=Tt(e,"string");return D(t)=="symbol"?t:t+""}function Tt(e,t){if(D(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(D(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function ke(e){return jt(e)||Kt(e)||Ke(e)||Ot()}function Ot(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ke(e,t){if(e){if(typeof e=="string")return Q(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Q(e,t):void 0}}function Kt(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function jt(e){if(Array.isArray(e))return Q(e)}function Q(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}var je={name:"TreeTableRow",hostName:"TreeTable",extends:H,emits:["node-click","node-toggle","checkbox-change","nodeClick","nodeToggle","checkboxChange","row-rightclick","rowRightclick"],props:{node:{type:null,default:null},dataKey:{type:[String,Function],default:"key"},parentNode:{type:null,default:null},columns:{type:null,default:null},expandedKeys:{type:null,default:null},selectionKeys:{type:null,default:null},selectionMode:{type:String,default:null},level:{type:Number,default:0},indentation:{type:Number,default:1},tabindex:{type:Number,default:-1},ariaSetSize:{type:Number,default:null},ariaPosInset:{type:Number,default:null},loadingMode:{type:String,default:"mask"},templates:{type:Object,default:null},contextMenu:{type:Boolean,default:!1},contextMenuSelection:{type:Object,default:null}},nodeTouched:!1,methods:{columnProp:function(t,n){return A(t,n)},toggle:function(){this.$emit("node-toggle",this.node)},onClick:function(t){se(t.target)||w(t.target,"data-pc-section")==="nodetogglebutton"||w(t.target,"data-pc-section")==="nodetoggleicon"||t.target.tagName==="path"||(this.setTabIndexForSelectionMode(t,this.nodeTouched),this.$emit("node-click",{originalEvent:t,nodeTouched:this.nodeTouched,node:this.node}),this.nodeTouched=!1)},onRowRightClick:function(t){this.$emit("row-rightclick",{originalEvent:t,node:this.node})},onTouchEnd:function(){this.nodeTouched=!0},nodeKey:function(t){return M(t,this.dataKey)},onKeyDown:function(t,n){switch(t.code){case"ArrowDown":this.onArrowDownKey(t);break;case"ArrowUp":this.onArrowUpKey(t);break;case"ArrowLeft":this.onArrowLeftKey(t);break;case"ArrowRight":this.onArrowRightKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"Enter":case"NumpadEnter":case"Space":se(t.target)||this.onEnterKey(t,n);break;case"Tab":this.onTabKey(t);break}},onArrowDownKey:function(t){var n=t.currentTarget.nextElementSibling;n&&this.focusRowChange(t.currentTarget,n),t.preventDefault()},onArrowUpKey:function(t){var n=t.currentTarget.previousElementSibling;n&&this.focusRowChange(t.currentTarget,n),t.preventDefault()},onArrowRightKey:function(t){var n=this,r=j(t.currentTarget,"button").style.visibility==="hidden",l=j(this.$refs.node,'[data-pc-section="nodetogglebutton"]');r||(!this.expanded&&l.click(),this.$nextTick(function(){n.onArrowDownKey(t)}),t.preventDefault())},onArrowLeftKey:function(t){if(!(this.level===0&&!this.expanded)){var n=t.currentTarget,r=j(n,"button").style.visibility==="hidden",l=j(n,'[data-pc-section="nodetogglebutton"]');if(this.expanded&&!r){l.click();return}var o=this.findBeforeClickableNode(n);o&&this.focusRowChange(n,o)}},onHomeKey:function(t){var n=j(t.currentTarget.parentElement,'tr[aria-level="'.concat(this.level+1,'"]'));n&&X(n),t.preventDefault()},onEndKey:function(t){var n=G(t.currentTarget.parentElement,'tr[aria-level="'.concat(this.level+1,'"]')),r=n[n.length-1];X(r),t.preventDefault()},onEnterKey:function(t){if(t.preventDefault(),this.setTabIndexForSelectionMode(t,this.nodeTouched),this.selectionMode==="checkbox"){this.toggleCheckbox();return}this.$emit("node-click",{originalEvent:t,nodeTouched:this.nodeTouched,node:this.node}),this.nodeTouched=!1},onTabKey:function(){var t=ke(G(this.$refs.node.parentElement,"tr")),n=t.some(function(l){return w(l,"data-p-selected")||l.getAttribute("aria-checked")==="true"});if(t.forEach(function(l){l.tabIndex=-1}),n){var r=t.filter(function(l){return w(l,"data-p-selected")||l.getAttribute("aria-checked")==="true"});r[0].tabIndex=0;return}t[0].tabIndex=0},focusRowChange:function(t,n){t.tabIndex="-1",n.tabIndex="0",X(n)},findBeforeClickableNode:function(t){var n=t.previousElementSibling;if(n){var r=n.querySelector("button");return r&&r.style.visibility!=="hidden"?n:this.findBeforeClickableNode(n)}return null},toggleCheckbox:function(){var t=this.selectionKeys?J({},this.selectionKeys):{},n=!this.checked;this.propagateDown(this.node,n,t),this.$emit("checkbox-change",{node:this.node,check:n,selectionKeys:t})},propagateDown:function(t,n,r){if(n?r[this.nodeKey(t)]={checked:!0,partialChecked:!1}:delete r[this.nodeKey(t)],t.children&&t.children.length){var l=q(t.children),o;try{for(l.s();!(o=l.n()).done;){var a=o.value;this.propagateDown(a,n,r)}}catch(s){l.e(s)}finally{l.f()}}},propagateUp:function(t){var n=t.check,r=J({},t.selectionKeys),l=0,o=!1,a=q(this.node.children),s;try{for(a.s();!(s=a.n()).done;){var d=s.value;r[this.nodeKey(d)]&&r[this.nodeKey(d)].checked?l++:r[this.nodeKey(d)]&&r[this.nodeKey(d)].partialChecked&&(o=!0)}}catch(u){a.e(u)}finally{a.f()}n&&l===this.node.children.length?r[this.nodeKey(this.node)]={checked:!0,partialChecked:!1}:(n||delete r[this.nodeKey(this.node)],o||l>0&&l!==this.node.children.length?r[this.nodeKey(this.node)]={checked:!1,partialChecked:!0}:r[this.nodeKey(this.node)]={checked:!1,partialChecked:!1}),this.$emit("checkbox-change",{node:t.node,check:t.check,selectionKeys:r})},onCheckboxChange:function(t){var n=t.check,r=J({},t.selectionKeys),l=0,o=!1,a=q(this.node.children),s;try{for(a.s();!(s=a.n()).done;){var d=s.value;r[this.nodeKey(d)]&&r[this.nodeKey(d)].checked?l++:r[this.nodeKey(d)]&&r[this.nodeKey(d)].partialChecked&&(o=!0)}}catch(u){a.e(u)}finally{a.f()}n&&l===this.node.children.length?r[this.nodeKey(this.node)]={checked:!0,partialChecked:!1}:(n||delete r[this.nodeKey(this.node)],o||l>0&&l!==this.node.children.length?r[this.nodeKey(this.node)]={checked:!1,partialChecked:!0}:r[this.nodeKey(this.node)]={checked:!1,partialChecked:!1}),this.$emit("checkbox-change",{node:t.node,check:t.check,selectionKeys:r})},setTabIndexForSelectionMode:function(t,n){if(this.selectionMode!==null){var r=ke(G(this.$refs.node.parentElement,"tr"));t.currentTarget.tabIndex=n===!1?-1:0,r.every(function(l){return l.tabIndex===-1})&&(r[0].tabIndex=0)}}},computed:{containerClass:function(){return[this.node.styleClass,this.cx("row")]},expanded:function(){return this.expandedKeys&&this.expandedKeys[this.nodeKey(this.node)]===!0},leaf:function(){return this.node.leaf===!1?!1:!(this.node.children&&this.node.children.length)},selected:function(){return this.selectionMode&&this.selectionKeys?this.selectionKeys[this.nodeKey(this.node)]===!0:!1},isSelectedWithContextMenu:function(){return this.node&&this.contextMenuSelection?Ye(this.node,this.contextMenuSelection,this.dataKey):!1},checked:function(){return this.selectionKeys?this.selectionKeys[this.nodeKey(this.node)]&&this.selectionKeys[this.nodeKey(this.node)].checked:!1},partialChecked:function(){return this.selectionKeys?this.selectionKeys[this.nodeKey(this.node)]&&this.selectionKeys[this.nodeKey(this.node)].partialChecked:!1},getAriaSelected:function(){return this.selectionMode==="single"||this.selectionMode==="multiple"?this.selected:null},ptmOptions:function(){return{context:{selectable:this.$parentInstance.rowHover||this.$parentInstance.rowSelectionMode,selected:this.selected,scrollable:this.$parentInstance.scrollable}}}},components:{TTBodyCell:Oe}},Et=["tabindex","aria-expanded","aria-level","aria-setsize","aria-posinset","aria-selected","aria-checked","data-p-selected","data-p-selected-contextmenu"];function $t(e,t,n,r,l,o){var a=z("TTBodyCell"),s=z("TreeTableRow",!0);return c(),h(S,null,[k("tr",p({ref:"node",class:o.containerClass,style:n.node.style,tabindex:n.tabindex,role:"row","aria-expanded":n.node.children&&n.node.children.length?o.expanded:void 0,"aria-level":n.level+1,"aria-setsize":n.ariaSetSize,"aria-posinset":n.ariaPosInset,"aria-selected":o.getAriaSelected,"aria-checked":o.checked||void 0,onClick:t[1]||(t[1]=function(){return o.onClick&&o.onClick.apply(o,arguments)}),onKeydown:t[2]||(t[2]=function(){return o.onKeyDown&&o.onKeyDown.apply(o,arguments)}),onTouchend:t[3]||(t[3]=function(){return o.onTouchEnd&&o.onTouchEnd.apply(o,arguments)}),onContextmenu:t[4]||(t[4]=function(){return o.onRowRightClick&&o.onRowRightClick.apply(o,arguments)})},e.ptm("row",o.ptmOptions),{"data-p-selected":o.selected,"data-p-selected-contextmenu":n.contextMenuSelection&&o.isSelectedWithContextMenu}),[(c(!0),h(S,null,O(n.columns,function(d,u){return c(),h(S,{key:o.columnProp(d,"columnKey")||o.columnProp(d,"field")||u},[o.columnProp(d,"hidden")?b("",!0):(c(),f(a,{key:0,column:d,node:n.node,level:n.level,leaf:o.leaf,indentation:n.indentation,expanded:o.expanded,selectionMode:n.selectionMode,checked:o.checked,partialChecked:o.partialChecked,templates:n.templates,onNodeToggle:t[0]||(t[0]=function(i){return e.$emit("node-toggle",i)}),onCheckboxToggle:o.toggleCheckbox,index:u,loadingMode:n.loadingMode,unstyled:e.unstyled,pt:e.pt},null,8,["column","node","level","leaf","indentation","expanded","selectionMode","checked","partialChecked","templates","onCheckboxToggle","index","loadingMode","unstyled","pt"]))],64)}),128))],16,Et),o.expanded&&n.node.children&&n.node.children.length?(c(!0),h(S,{key:0},O(n.node.children,function(d){return c(),f(s,{key:o.nodeKey(d),dataKey:n.dataKey,columns:n.columns,node:d,parentNode:n.node,level:n.level+1,expandedKeys:n.expandedKeys,selectionMode:n.selectionMode,selectionKeys:n.selectionKeys,contextMenu:n.contextMenu,contextMenuSelection:n.contextMenuSelection,indentation:n.indentation,ariaPosInset:n.node.children.indexOf(d)+1,ariaSetSize:n.node.children.length,templates:n.templates,onNodeToggle:t[5]||(t[5]=function(u){return e.$emit("node-toggle",u)}),onNodeClick:t[6]||(t[6]=function(u){return e.$emit("node-click",u)}),onRowRightclick:t[7]||(t[7]=function(u){return e.$emit("row-rightclick",u)}),onCheckboxChange:o.onCheckboxChange,unstyled:e.unstyled,pt:e.pt},null,8,["dataKey","columns","node","parentNode","level","expandedKeys","selectionMode","selectionKeys","contextMenu","contextMenuSelection","indentation","ariaPosInset","ariaSetSize","templates","onCheckboxChange","unstyled","pt"])}),128)):b("",!0)],64)}je.render=$t;function L(e){"@babel/helpers - typeof";return L=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},L(e)}function U(e,t){var n=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=Ee(e))||t){n&&(e=n);var r=0,l=function(){};return{s:l,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(u){throw u},f:l}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var o,a=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var u=n.next();return a=u.done,u},e:function(u){s=!0,o=u},f:function(){try{a||n.return==null||n.return()}finally{if(s)throw o}}}}function Se(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable})),n.push.apply(n,r)}return n}function x(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?Se(Object(n),!0).forEach(function(r){Rt(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Se(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function Rt(e,t,n){return(t=It(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function It(e){var t=Ft(e,"string");return L(t)=="symbol"?t:t+""}function Ft(e,t){if(L(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(L(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function $(e){return Nt(e)||Lt(e)||Ee(e)||Dt()}function Dt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ee(e,t){if(e){if(typeof e=="string")return Y(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Y(e,t):void 0}}function Lt(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Nt(e){if(Array.isArray(e))return Y(e)}function Y(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}var $e={name:"TreeTable",extends:ct,inheritAttrs:!1,emits:["node-expand","node-collapse","update:expandedKeys","update:selectionKeys","node-select","node-unselect","update:first","update:rows","page","update:sortField","update:sortOrder","update:multiSortMeta","sort","filter","column-resize-end","update:contextMenuSelection","row-contextmenu"],provide:function(){return{$columns:this.d_columns}},data:function(){return{d_expandedKeys:this.expandedKeys||{},d_first:this.first,d_rows:this.rows,d_sortField:this.sortField,d_sortOrder:this.sortOrder,d_multiSortMeta:this.multiSortMeta?$(this.multiSortMeta):[],hasASelectedNode:!1,d_columns:new He({type:"Column"})}},documentColumnResizeListener:null,documentColumnResizeEndListener:null,lastResizeHelperX:null,resizeColumnElement:null,watch:{expandedKeys:function(t){this.d_expandedKeys=t},first:function(t){this.d_first=t},rows:function(t){this.d_rows=t},sortField:function(t){this.d_sortField=t},sortOrder:function(t){this.d_sortOrder=t},multiSortMeta:function(t){this.d_multiSortMeta=t}},beforeUnmount:function(){this.destroyStyleElement(),this.d_columns.clear()},methods:{columnProp:function(t,n){return A(t,n)},ptHeaderCellOptions:function(t){return{context:{frozen:this.columnProp(t,"frozen")}}},onNodeToggle:function(t){var n=this.nodeKey(t);this.d_expandedKeys[n]?(delete this.d_expandedKeys[n],this.$emit("node-collapse",t)):(this.d_expandedKeys[n]=!0,this.$emit("node-expand",t)),this.d_expandedKeys=x({},this.d_expandedKeys),this.$emit("update:expandedKeys",this.d_expandedKeys)},onNodeClick:function(t){if(this.rowSelectionMode&&t.node.selectable!==!1){var n=t.nodeTouched?!1:this.metaKeySelection,r=n?this.handleSelectionWithMetaKey(t):this.handleSelectionWithoutMetaKey(t);this.$emit("update:selectionKeys",r)}},nodeKey:function(t){return M(t,this.dataKey)},handleSelectionWithMetaKey:function(t){var n=t.originalEvent,r=t.node,l=this.nodeKey(r),o=n.metaKey||n.ctrlKey,a=this.isNodeSelected(r),s;return a&&o?(this.isSingleSelectionMode()?s={}:(s=x({},this.selectionKeys),delete s[l]),this.$emit("node-unselect",r)):(this.isSingleSelectionMode()?s={}:this.isMultipleSelectionMode()&&(s=o?this.selectionKeys?x({},this.selectionKeys):{}:{}),s[l]=!0,this.$emit("node-select",r)),s},handleSelectionWithoutMetaKey:function(t){var n=t.node,r=this.nodeKey(n),l=this.isNodeSelected(n),o;return this.isSingleSelectionMode()?l?(o={},this.$emit("node-unselect",n)):(o={},o[r]=!0,this.$emit("node-select",n)):l?(o=x({},this.selectionKeys),delete o[r],this.$emit("node-unselect",n)):(o=this.selectionKeys?x({},this.selectionKeys):{},o[r]=!0,this.$emit("node-select",n)),o},onCheckboxChange:function(t){this.$emit("update:selectionKeys",t.selectionKeys),t.check?this.$emit("node-select",t.node):this.$emit("node-unselect",t.node)},onRowRightClick:function(t){this.contextMenu&&(re(),t.originalEvent.target.focus()),this.$emit("update:contextMenuSelection",t.node),this.$emit("row-contextmenu",t)},isSingleSelectionMode:function(){return this.selectionMode==="single"},isMultipleSelectionMode:function(){return this.selectionMode==="multiple"},onPage:function(t){this.d_first=t.first,this.d_rows=t.rows;var n=this.createLazyLoadEvent(t);n.pageCount=t.pageCount,n.page=t.page,this.d_expandedKeys={},this.$emit("update:expandedKeys",this.d_expandedKeys),this.$emit("update:first",this.d_first),this.$emit("update:rows",this.d_rows),this.$emit("page",n)},resetPage:function(){this.d_first=0,this.$emit("update:first",this.d_first)},getFilterColumnHeaderClass:function(t){return[this.cx("headerCell",{column:t}),this.columnProp(t,"filterHeaderClass")]},onColumnHeaderClick:function(t){var n=t.originalEvent,r=t.column;if(this.columnProp(r,"sortable")){var l=n.target,o=this.columnProp(r,"sortField")||this.columnProp(r,"field");if(w(l,"data-p-sortable-column")===!0||w(l,"data-pc-section")==="columntitle"||w(l,"data-pc-section")==="columnheadercontent"||w(l,"data-pc-section")==="sorticon"||w(l.parentElement,"data-pc-section")==="sorticon"||w(l.parentElement.parentElement,"data-pc-section")==="sorticon"||l.closest('[data-p-sortable-column="true"]')){if(re(),this.sortMode==="single")this.d_sortField===o?this.removableSort&&this.d_sortOrder*-1===this.defaultSortOrder?(this.d_sortOrder=null,this.d_sortField=null):this.d_sortOrder=this.d_sortOrder*-1:(this.d_sortOrder=this.defaultSortOrder,this.d_sortField=o),this.$emit("update:sortField",this.d_sortField),this.$emit("update:sortOrder",this.d_sortOrder),this.resetPage();else if(this.sortMode==="multiple"){var a=n.metaKey||n.ctrlKey;a||(this.d_multiSortMeta=this.d_multiSortMeta.filter(function(s){return s.field===o})),this.addMultiSortField(o),this.$emit("update:multiSortMeta",this.d_multiSortMeta)}this.$emit("sort",this.createLazyLoadEvent(n))}}},addMultiSortField:function(t){var n=this.d_multiSortMeta.findIndex(function(r){return r.field===t});n>=0?this.removableSort&&this.d_multiSortMeta[n].order*-1===this.defaultSortOrder?this.d_multiSortMeta.splice(n,1):this.d_multiSortMeta[n]={field:t,order:this.d_multiSortMeta[n].order*-1}:this.d_multiSortMeta.push({field:t,order:this.defaultSortOrder}),this.d_multiSortMeta=$(this.d_multiSortMeta)},sortSingle:function(t){return this.sortNodesSingle(t)},sortNodesSingle:function(t){var n=this,r=$(t),l=oe();return r.sort(function(o,a){var s=M(o.data,n.d_sortField),d=M(a.data,n.d_sortField);return le(s,d,n.d_sortOrder,l)}),r},sortMultiple:function(t){return this.sortNodesMultiple(t)},sortNodesMultiple:function(t){var n=this,r=$(t);return r.sort(function(l,o){return n.multisortField(l,o,0)}),r},multisortField:function(t,n,r){var l=M(t.data,this.d_multiSortMeta[r].field),o=M(n.data,this.d_multiSortMeta[r].field),a=oe();return l===o?this.d_multiSortMeta.length-1>r?this.multisortField(t,n,r+1):0:le(l,o,this.d_multiSortMeta[r].order,a)},filter:function(t){var n=[],r=this.filterMode==="strict",l=U(t),o;try{for(l.s();!(o=l.n()).done;){for(var a=o.value,s=x({},a),d=!0,u=!1,i=0;i<this.columns.length;i++){var v=this.columns[i],P=this.columnProp(v,"filterField")||this.columnProp(v,"field");if(Object.prototype.hasOwnProperty.call(this.filters,P)){var Re=this.columnProp(v,"filterMatchMode")||"startsWith",Ie=this.filters[P],Fe=ie.filters[Re],B={filterField:P,filterValue:Ie,filterConstraint:Fe,strict:r};if((r&&!(this.findFilteredNodes(s,B)||this.isFilterMatched(s,B))||!r&&!(this.isFilterMatched(s,B)||this.findFilteredNodes(s,B)))&&(d=!1),!d)break}if(this.hasGlobalFilter()&&!u){var K=x({},s),De=this.filters.global,Le=ie.filters.contains,V={filterField:P,filterValue:De,filterConstraint:Le,strict:r};(r&&(this.findFilteredNodes(K,V)||this.isFilterMatched(K,V))||!r&&(this.isFilterMatched(K,V)||this.findFilteredNodes(K,V)))&&(u=!0,s=K)}}var te=d;this.hasGlobalFilter()&&(te=d&&u),te&&n.push(s)}}catch(Ne){l.e(Ne)}finally{l.f()}var ne=this.createLazyLoadEvent(event);return ne.filteredValue=n,this.$emit("filter",ne),n},findFilteredNodes:function(t,n){if(t){var r=!1;if(t.children){var l=$(t.children);t.children=[];var o=U(l),a;try{for(o.s();!(a=o.n()).done;){var s=a.value,d=x({},s);this.isFilterMatched(d,n)&&(r=!0,t.children.push(d))}}catch(u){o.e(u)}finally{o.f()}}if(r)return!0}},isFilterMatched:function(t,n){var r=n.filterField,l=n.filterValue,o=n.filterConstraint,a=n.strict,s=!1,d=M(t.data,r);return o(d,l,this.filterLocale)&&(s=!0),(!s||a&&!this.isNodeLeaf(t))&&(s=this.findFilteredNodes(t,{filterField:r,filterValue:l,filterConstraint:o,strict:a})||s),s},isNodeSelected:function(t){return this.selectionMode&&this.selectionKeys?this.selectionKeys[this.nodeKey(t)]===!0:!1},isNodeLeaf:function(t){return t.leaf===!1?!1:!(t.children&&t.children.length)},createLazyLoadEvent:function(t){var n=this,r;return this.hasFilters()&&(r={},this.columns.forEach(function(l){n.columnProp(l,"field")&&(r[l.props.field]=n.columnProp(l,"filterMatchMode"))})),{originalEvent:t,first:this.d_first,rows:this.d_rows,sortField:this.d_sortField,sortOrder:this.d_sortOrder,multiSortMeta:this.d_multiSortMeta,filters:this.filters,filterMatchModes:r}},onColumnResizeStart:function(t){var n=ae(this.$el).left;this.resizeColumnElement=t.target.parentElement,this.columnResizing=!0,this.lastResizeHelperX=t.pageX-n+this.$el.scrollLeft,this.bindColumnResizeEvents()},onColumnResize:function(t){var n=ae(this.$el).left;this.$el.setAttribute("data-p-unselectable-text","true"),!this.isUnstyled&&Be(this.$el,{"user-select":"none"}),this.$refs.resizeHelper.style.height=this.$el.offsetHeight+"px",this.$refs.resizeHelper.style.top="0px",this.$refs.resizeHelper.style.left=t.pageX-n+this.$el.scrollLeft+"px",this.$refs.resizeHelper.style.display="block"},onColumnResizeEnd:function(){var t=Ve(this.$el)?this.lastResizeHelperX-this.$refs.resizeHelper.offsetLeft:this.$refs.resizeHelper.offsetLeft-this.lastResizeHelperX,n=this.resizeColumnElement.offsetWidth,r=n+t,l=this.resizeColumnElement.style.minWidth||15;if(n+t>parseInt(l,10)){if(this.columnResizeMode==="fit"){var o=this.resizeColumnElement.nextElementSibling,a=o.offsetWidth-t;r>15&&a>15&&this.resizeTableCells(r,a)}else if(this.columnResizeMode==="expand"){var s=this.$refs.table.offsetWidth+t+"px",d=function(i){i&&(i.style.width=i.style.minWidth=s)};this.resizeTableCells(r),d(this.$refs.table)}this.$emit("column-resize-end",{element:this.resizeColumnElement,delta:t})}this.$refs.resizeHelper.style.display="none",this.resizeColumn=null,this.$el.removeAttribute("data-p-unselectable-text"),!this.isUnstyled&&(this.$el.style["user-select"]=""),this.unbindColumnResizeEvents()},resizeTableCells:function(t,n){var r=Pe(this.resizeColumnElement),l=[],o=G(this.$refs.table,'thead[data-pc-section="thead"] > tr > th');o.forEach(function(d){return l.push(T(d))}),this.destroyStyleElement(),this.createStyleElement();var a="",s='[data-pc-name="treetable"]['.concat(this.$attrSelector,'] > [data-pc-section="tablecontainer"] > table[data-pc-section="table"]');l.forEach(function(d,u){var i=u===r?t:n&&u===r+1?n:d,v="width: ".concat(i,"px !important; max-width: ").concat(i,"px !important");a+=`
                    `.concat(s,' > thead[data-pc-section="thead"] > tr > th:nth-child(').concat(u+1,`),
                    `).concat(s,' > tbody[data-pc-section="tbody"] > tr > td:nth-child(').concat(u+1,`),
                    `).concat(s,' > tfoot[data-pc-section="tfoot"] > tr > td:nth-child(').concat(u+1,`) {
                        `).concat(v,`
                    }
                `)}),this.styleElement.innerHTML=a},bindColumnResizeEvents:function(){var t=this;this.documentColumnResizeListener||(this.documentColumnResizeListener=document.addEventListener("mousemove",function(n){t.columnResizing&&t.onColumnResize(n)})),this.documentColumnResizeEndListener||(this.documentColumnResizeEndListener=document.addEventListener("mouseup",function(){t.columnResizing&&(t.columnResizing=!1,t.onColumnResizeEnd())}))},unbindColumnResizeEvents:function(){this.documentColumnResizeListener&&(document.removeEventListener("document",this.documentColumnResizeListener),this.documentColumnResizeListener=null),this.documentColumnResizeEndListener&&(document.removeEventListener("document",this.documentColumnResizeEndListener),this.documentColumnResizeEndListener=null)},onColumnKeyDown:function(t,n){(t.code==="Enter"||t.code==="NumpadEnter")&&t.currentTarget.nodeName==="TH"&&w(t.currentTarget,"data-p-sortable-column")&&this.onColumnHeaderClick(t,n)},hasColumnFilter:function(){if(this.columns){var t=U(this.columns),n;try{for(t.s();!(n=t.n()).done;){var r=n.value;if(r.children&&r.children.filter)return!0}}catch(l){t.e(l)}finally{t.f()}}return!1},hasFilters:function(){return this.filters&&Object.keys(this.filters).length>0&&this.filters.constructor===Object},hasGlobalFilter:function(){return this.filters&&Object.prototype.hasOwnProperty.call(this.filters,"global")},getItemLabel:function(t){return t.data.name},createStyleElement:function(){var t;this.styleElement=document.createElement("style"),this.styleElement.type="text/css",We(this.styleElement,"nonce",(t=this.$primevue)===null||t===void 0||(t=t.config)===null||t===void 0||(t=t.csp)===null||t===void 0?void 0:t.nonce),document.head.appendChild(this.styleElement)},destroyStyleElement:function(){this.styleElement&&(document.head.removeChild(this.styleElement),this.styleElement=null)},setTabindex:function(t,n){if(this.isNodeSelected(t))return this.hasASelectedNode=!0,0;if(this.selectionMode){if(!this.isNodeSelected(t)&&n===0&&!this.hasASelectedNode)return 0}else if(!this.selectionMode&&n===0)return 0;return-1}},computed:{columns:function(){return this.d_columns.get(this)},processedData:function(){if(this.lazy)return this.value;if(this.value&&this.value.length){var t=this.value;return this.sorted&&(this.sortMode==="single"?t=this.sortSingle(t):this.sortMode==="multiple"&&(t=this.sortMultiple(t))),this.hasFilters()&&(t=this.filter(t)),t}else return null},dataToRender:function(){var t=this.processedData;if(this.paginator){var n=this.lazy?0:this.d_first;return t.slice(n,n+this.d_rows)}else return t},empty:function(){var t=this.processedData;return!t||t.length===0},sorted:function(){return this.d_sortField||this.d_multiSortMeta&&this.d_multiSortMeta.length>0},hasFooter:function(){var t=!1,n=U(this.columns),r;try{for(n.s();!(r=n.n()).done;){var l=r.value;if(this.columnProp(l,"footer")||l.children&&l.children.footer){t=!0;break}}}catch(o){n.e(o)}finally{n.f()}return t},paginatorTop:function(){return this.paginator&&(this.paginatorPosition!=="bottom"||this.paginatorPosition==="both")},paginatorBottom:function(){return this.paginator&&(this.paginatorPosition!=="top"||this.paginatorPosition==="both")},singleSelectionMode:function(){return this.selectionMode&&this.selectionMode==="single"},multipleSelectionMode:function(){return this.selectionMode&&this.selectionMode==="multiple"},rowSelectionMode:function(){return this.singleSelectionMode||this.multipleSelectionMode},totalRecordsLength:function(){if(this.lazy)return this.totalRecords;var t=this.processedData;return t?t.length:0}},components:{TTRow:je,TTPaginator:_e,TTHeaderCell:Te,TTFooterCell:Me,SpinnerIcon:ze}};function N(e){"@babel/helpers - typeof";return N=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},N(e)}function Ce(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(l){return Object.getOwnPropertyDescriptor(e,l).enumerable})),n.push.apply(n,r)}return n}function we(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]!=null?arguments[t]:{};t%2?Ce(Object(n),!0).forEach(function(r){At(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Ce(Object(n)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))})}return e}function At(e,t,n){return(t=Ht(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Ht(e){var t=Bt(e,"string");return N(t)=="symbol"?t:t+""}function Bt(e,t){if(N(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t);if(N(r)!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var Vt=["colspan"];function Wt(e,t,n,r,l,o){var a=z("TTPaginator"),s=z("TTHeaderCell"),d=z("TTRow"),u=z("TTFooterCell");return c(),h("div",p({class:e.cx("root"),"data-scrollselectors":".p-treetable-scrollable-body"},e.ptmi("root")),[m(e.$slots,"default"),e.loading&&e.loadingMode==="mask"?(c(),h("div",p({key:0,class:e.cx("loading")},e.ptm("loading")),[k("div",p({class:e.cx("mask")},e.ptm("mask")),[m(e.$slots,"loadingicon",{class:y(e.cx("loadingIcon"))},function(){return[(c(),f(C(e.loadingIcon?"span":"SpinnerIcon"),p({spin:"",class:[e.cx("loadingIcon"),e.loadingIcon]},e.ptm("loadingIcon")),null,16,["class"]))]})],16)],16)):b("",!0),e.$slots.header?(c(),h("div",p({key:1,class:e.cx("header")},e.ptm("header")),[m(e.$slots,"header")],16)):b("",!0),o.paginatorTop?(c(),f(a,{key:2,rows:l.d_rows,first:l.d_first,totalRecords:o.totalRecordsLength,pageLinkSize:e.pageLinkSize,template:e.paginatorTemplate,rowsPerPageOptions:e.rowsPerPageOptions,currentPageReportTemplate:e.currentPageReportTemplate,class:y(e.cx("pcPaginator",{position:"top"})),onPage:t[0]||(t[0]=function(i){return o.onPage(i)}),alwaysShow:e.alwaysShowPaginator,unstyled:e.unstyled,pt:e.ptm("pcPaginator")},de({_:2},[e.$slots.paginatorcontainer?{name:"container",fn:g(function(i){return[m(e.$slots,"paginatorcontainer",{first:i.first,last:i.last,rows:i.rows,page:i.page,pageCount:i.pageCount,totalRecords:i.totalRecords,firstPageCallback:i.firstPageCallback,lastPageCallback:i.lastPageCallback,prevPageCallback:i.prevPageCallback,nextPageCallback:i.nextPageCallback,rowChangeCallback:i.rowChangeCallback})]}),key:"0"}:void 0,e.$slots.paginatorstart?{name:"start",fn:g(function(){return[m(e.$slots,"paginatorstart")]}),key:"1"}:void 0,e.$slots.paginatorend?{name:"end",fn:g(function(){return[m(e.$slots,"paginatorend")]}),key:"2"}:void 0,e.$slots.paginatorfirstpagelinkicon?{name:"firstpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatorfirstpagelinkicon",{class:y(i.class)})]}),key:"3"}:void 0,e.$slots.paginatorprevpagelinkicon?{name:"prevpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatorprevpagelinkicon",{class:y(i.class)})]}),key:"4"}:void 0,e.$slots.paginatornextpagelinkicon?{name:"nextpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatornextpagelinkicon",{class:y(i.class)})]}),key:"5"}:void 0,e.$slots.paginatorlastpagelinkicon?{name:"lastpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatorlastpagelinkicon",{class:y(i.class)})]}),key:"6"}:void 0,e.$slots.paginatorjumptopagedropdownicon?{name:"jumptopagedropdownicon",fn:g(function(i){return[m(e.$slots,"paginatorjumptopagedropdownicon",{class:y(i.class)})]}),key:"7"}:void 0,e.$slots.paginatorrowsperpagedropdownicon?{name:"rowsperpagedropdownicon",fn:g(function(i){return[m(e.$slots,"paginatorrowsperpagedropdownicon",{class:y(i.class)})]}),key:"8"}:void 0]),1032,["rows","first","totalRecords","pageLinkSize","template","rowsPerPageOptions","currentPageReportTemplate","class","alwaysShow","unstyled","pt"])):b("",!0),k("div",p({class:e.cx("tableContainer"),style:[e.sx("tableContainer"),{maxHeight:e.scrollHeight}]},e.ptm("tableContainer")),[k("table",p({ref:"table",role:"table",class:[e.cx("table"),e.tableClass],style:e.tableStyle},we(we({},e.tableProps),e.ptm("table"))),[k("thead",p({class:e.cx("thead"),style:e.sx("thead"),role:"rowgroup"},e.ptm("thead")),[k("tr",p({role:"row"},e.ptm("headerRow")),[(c(!0),h(S,null,O(o.columns,function(i,v){return c(),h(S,{key:o.columnProp(i,"columnKey")||o.columnProp(i,"field")||v},[o.columnProp(i,"hidden")?b("",!0):(c(),f(s,{key:0,column:i,resizableColumns:e.resizableColumns,sortField:l.d_sortField,sortOrder:l.d_sortOrder,multiSortMeta:l.d_multiSortMeta,sortMode:e.sortMode,onColumnClick:t[1]||(t[1]=function(P){return o.onColumnHeaderClick(P)}),onColumnResizestart:t[2]||(t[2]=function(P){return o.onColumnResizeStart(P)}),index:v,unstyled:e.unstyled,pt:e.pt},null,8,["column","resizableColumns","sortField","sortOrder","multiSortMeta","sortMode","index","unstyled","pt"]))],64)}),128))],16),o.hasColumnFilter()?(c(),h("tr",xe(p({key:0},e.ptm("headerRow"))),[(c(!0),h(S,null,O(o.columns,function(i,v){return c(),h(S,{key:o.columnProp(i,"columnKey")||o.columnProp(i,"field")||v},[o.columnProp(i,"hidden")?b("",!0):(c(),h("th",p({key:0,class:o.getFilterColumnHeaderClass(i),style:[o.columnProp(i,"style"),o.columnProp(i,"filterHeaderStyle")],ref_for:!0},e.ptm("headerCell",o.ptHeaderCellOptions(i))),[i.children&&i.children.filter?(c(),f(C(i.children.filter),{key:0,column:i,index:v},null,8,["column","index"])):b("",!0)],16))],64)}),128))],16)):b("",!0)],16),k("tbody",p({class:e.cx("tbody"),role:"rowgroup"},e.ptm("tbody")),[o.empty?(c(),h("tr",p({key:1,class:e.cx("emptyMessage")},e.ptm("emptyMessage")),[k("td",p({colspan:o.columns.length},e.ptm("emptyMessageCell")),[m(e.$slots,"empty")],16,Vt)],16)):(c(!0),h(S,{key:0},O(o.dataToRender,function(i,v){return c(),f(d,{key:o.nodeKey(i),dataKey:e.dataKey,columns:o.columns,node:i,level:0,expandedKeys:l.d_expandedKeys,indentation:e.indentation,selectionMode:e.selectionMode,selectionKeys:e.selectionKeys,ariaSetSize:o.dataToRender.length,ariaPosInset:v+1,tabindex:o.setTabindex(i,v),loadingMode:e.loadingMode,contextMenu:e.contextMenu,contextMenuSelection:e.contextMenuSelection,templates:e.$slots,onNodeToggle:o.onNodeToggle,onNodeClick:o.onNodeClick,onCheckboxChange:o.onCheckboxChange,onRowRightclick:t[3]||(t[3]=function(P){return o.onRowRightClick(P)}),unstyled:e.unstyled,pt:e.pt},null,8,["dataKey","columns","node","expandedKeys","indentation","selectionMode","selectionKeys","ariaSetSize","ariaPosInset","tabindex","loadingMode","contextMenu","contextMenuSelection","templates","onNodeToggle","onNodeClick","onCheckboxChange","unstyled","pt"])}),128))],16),o.hasFooter?(c(),h("tfoot",p({key:0,class:e.cx("tfoot"),style:e.sx("tfoot"),role:"rowgroup"},e.ptm("tfoot")),[k("tr",p({role:"row"},e.ptm("footerRow")),[(c(!0),h(S,null,O(o.columns,function(i,v){return c(),h(S,{key:o.columnProp(i,"columnKey")||o.columnProp(i,"field")||v},[o.columnProp(i,"hidden")?b("",!0):(c(),f(u,{key:0,column:i,index:v,unstyled:e.unstyled,pt:e.pt},null,8,["column","index","unstyled","pt"]))],64)}),128))],16)],16)):b("",!0)],16)],16),o.paginatorBottom?(c(),f(a,{key:3,rows:l.d_rows,first:l.d_first,totalRecords:o.totalRecordsLength,pageLinkSize:e.pageLinkSize,template:e.paginatorTemplate,rowsPerPageOptions:e.rowsPerPageOptions,currentPageReportTemplate:e.currentPageReportTemplate,class:y(e.cx("pcPaginator",{position:"bottom"})),onPage:t[4]||(t[4]=function(i){return o.onPage(i)}),alwaysShow:e.alwaysShowPaginator,unstyled:e.unstyled,pt:e.ptm("pcPaginator")},de({_:2},[e.$slots.paginatorcontainer?{name:"container",fn:g(function(i){return[m(e.$slots,"paginatorcontainer",{first:i.first,last:i.last,rows:i.rows,page:i.page,pageCount:i.pageCount,totalRecords:i.totalRecords,firstPageCallback:i.firstPageCallback,lastPageCallback:i.lastPageCallback,prevPageCallback:i.prevPageCallback,nextPageCallback:i.nextPageCallback,rowChangeCallback:i.rowChangeCallback})]}),key:"0"}:void 0,e.$slots.paginatorstart?{name:"start",fn:g(function(){return[m(e.$slots,"paginatorstart")]}),key:"1"}:void 0,e.$slots.paginatorend?{name:"end",fn:g(function(){return[m(e.$slots,"paginatorend")]}),key:"2"}:void 0,e.$slots.paginatorfirstpagelinkicon?{name:"firstpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatorfirstpagelinkicon",{class:y(i.class)})]}),key:"3"}:void 0,e.$slots.paginatorprevpagelinkicon?{name:"prevpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatorprevpagelinkicon",{class:y(i.class)})]}),key:"4"}:void 0,e.$slots.paginatornextpagelinkicon?{name:"nextpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatornextpagelinkicon",{class:y(i.class)})]}),key:"5"}:void 0,e.$slots.paginatorlastpagelinkicon?{name:"lastpagelinkicon",fn:g(function(i){return[m(e.$slots,"paginatorlastpagelinkicon",{class:y(i.class)})]}),key:"6"}:void 0,e.$slots.paginatorjumptopagedropdownicon?{name:"jumptopagedropdownicon",fn:g(function(i){return[m(e.$slots,"paginatorjumptopagedropdownicon",{class:y(i.class)})]}),key:"7"}:void 0,e.$slots.paginatorrowsperpagedropdownicon?{name:"rowsperpagedropdownicon",fn:g(function(i){return[m(e.$slots,"paginatorrowsperpagedropdownicon",{class:y(i.class)})]}),key:"8"}:void 0]),1032,["rows","first","totalRecords","pageLinkSize","template","rowsPerPageOptions","currentPageReportTemplate","class","alwaysShow","unstyled","pt"])):b("",!0),e.$slots.footer?(c(),h("div",p({key:4,class:e.cx("footer")},e.ptm("footer")),[m(e.$slots,"footer")],16)):b("",!0),k("div",p({ref:"resizeHelper",class:e.cx("columnResizeIndicator"),style:{display:"none"}},e.ptm("columnResizeIndicator")),null,16)],16)}$e.render=Wt;const Ut={class:"card"},Gt={class:"card"},sn={__name:"TreeDoc",setup(e){const t=W(null),n=W(null),r=W(null),l=W(null);return Ze(()=>{}),(o,a)=>{const s=lt,d=et,u=$e;return c(),h(S,null,[k("div",Ut,[a[2]||(a[2]=k("div",{class:"font-semibold text-xl"},"Tree",-1)),E(s,{value:t.value,selectionMode:"checkbox",selectionKeys:n.value,"onUpdate:selectionKeys":a[0]||(a[0]=i=>n.value=i)},null,8,["value","selectionKeys"])]),k("div",Gt,[a[3]||(a[3]=k("div",{class:"font-semibold text-xl mb-4"},"TreeTable",-1)),E(u,{value:r.value,selectionMode:"checkbox",selectionKeys:l.value,"onUpdate:selectionKeys":a[1]||(a[1]=i=>l.value=i)},{default:g(()=>[E(d,{field:"name",header:"Name",expander:!0}),E(d,{field:"size",header:"Size"}),E(d,{field:"type",header:"Type"})]),_:1},8,["value","selectionKeys"])])],64)}}};export{sn as default};
