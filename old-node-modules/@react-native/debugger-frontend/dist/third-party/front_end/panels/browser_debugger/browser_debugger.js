import*as e from"../../core/sdk/sdk.js";import*as t from"../../ui/visual_logging/visual_logging.js";import*as i from"../../core/i18n/i18n.js";import*as n from"../../core/platform/platform.js";import*as o from"../sources/sources.js";import*as s from"../../ui/legacy/legacy.js";import*as r from"../../core/common/common.js";import*as a from"../event_listeners/event_listeners.js";const l=new CSSStyleSheet;l.replaceSync(':host{margin:0;padding:2px 4px;min-height:18px}.tree-outline{padding:0}.tree-outline li{margin-left:14px;user-select:text}.tree-outline li.parent{margin-left:1px}.tree-outline li:not(.parent)::before{display:none}.breakpoint-hit{background-color:var(--sys-color-yellow-container);color:var(--sys-color-on-yellow-container)}.breakpoint-hit .breakpoint-hit-marker{background-color:var(--sys-color-yellow-container);border-right:3px solid var(--sys-color-yellow-outline);color:var(--sys-color-on-yellow-container);height:100%;left:0;margin-left:-30px;position:absolute;right:-4px;z-index:-1}.source-code[is="dt-checkbox"]{max-width:100%}\n/*# sourceURL=categorizedBreakpointsSidebarPane.css */\n');const d={auctionWorklet:"Ad Auction Worklet",animation:"Animation",breakpointHit:"breakpoint hit",canvas:"Canvas",clipboard:"Clipboard",control:"Control",device:"Device",domMutation:"DOM Mutation",dragDrop:"Drag / drop",geolocation:"Geolocation",keyboard:"Keyboard",load:"Load",media:"Media",mouse:"Mouse",notification:"Notification",parse:"Parse",pictureinpicture:"Picture-in-Picture",pointer:"Pointer",script:"Script",sharedStorageWorklet:"Shared Storage Worklet",timer:"Timer",touch:"Touch",trustedTypeViolations:"Trusted Type Violations",webaudio:"WebAudio",window:"Window",worker:"Worker",xhr:"XHR"},c=i.i18n.registerUIStrings("panels/browser_debugger/CategorizedBreakpointsSidebarPane.ts",d),h=i.i18n.getLocalizedString.bind(void 0,c),p=i.i18n.getLazilyComputedLocalizedString.bind(void 0,c);class g extends s.Widget.VBox{#e;#t;#i;#n;#o;#s;constructor(t,n,o){super(!0),this.#e=new s.TreeOutline.TreeOutlineInShadow,this.#e.setShowSelectionOnKeyboardFocus(!0),this.contentElement.appendChild(this.#e.element),this.#t=n,this.#i=o;const r=[...new Set(t.map((e=>e.category())))].sort(((e,t)=>{const n=u(e),o=u(t);return n.localeCompare(o,i.DevToolsLocale.DevToolsLocale.instance().locale)}));this.#n=new Map;for(const e of r)this.createCategory(e);if(r.length>0){const e=this.#n.get(r[0]);e&&e.element.select()}this.#o=new Map;for(const e of t)this.createBreakpoint(e);e.TargetManager.TargetManager.instance().addModelListener(e.DebuggerModel.DebuggerModel,e.DebuggerModel.Events.DebuggerPaused,this.update,this),e.TargetManager.TargetManager.instance().addModelListener(e.DebuggerModel.DebuggerModel,e.DebuggerModel.Events.DebuggerResumed,this.update,this),s.Context.Context.instance().addFlavorChangeListener(e.Target.Target,this.update,this)}get categories(){return this.#n}get breakpoints(){return this.#o}focus(){this.#e.forceSelect()}handleSpaceKeyEventOnBreakpoint(e,t){e&&" "===e.key&&(t&&t.checkbox.click(),e.consume(!0))}createCategory(e){const t=s.UIUtils.CheckboxLabel.create(u(e),void 0,void 0,e);t.checkboxElement.addEventListener("click",this.categoryCheckboxClicked.bind(this,e),!0),t.checkboxElement.tabIndex=-1;const i=new s.TreeOutline.TreeElement(t,void 0,e);i.listItemElement.addEventListener("keydown",(t=>{this.handleSpaceKeyEventOnBreakpoint(t,this.#n.get(e))})),t.checkboxElement.addEventListener("keydown",(t=>{i.listItemElement.focus(),this.handleSpaceKeyEventOnBreakpoint(t,this.#n.get(e))})),s.ARIAUtils.setChecked(i.listItemElement,!1),this.#e.appendChild(i),this.#n.set(e,{element:i,checkbox:t.checkboxElement})}createBreakpoint(e){const t=s.UIUtils.CheckboxLabel.create(o.CategorizedBreakpointL10n.getLocalizedBreakpointName(e.name),void 0,void 0,n.StringUtilities.toKebabCase(e.name));t.classList.add("source-code"),t.checkboxElement.addEventListener("click",this.breakpointCheckboxClicked.bind(this,e),!0),t.checkboxElement.tabIndex=-1;const i=new s.TreeOutline.TreeElement(t,void 0,n.StringUtilities.toKebabCase(e.name));i.listItemElement.addEventListener("keydown",(t=>{this.handleSpaceKeyEventOnBreakpoint(t,this.#o.get(e))})),t.checkboxElement.addEventListener("keydown",(t=>{i.listItemElement.focus(),this.handleSpaceKeyEventOnBreakpoint(t,this.#o.get(e))})),s.ARIAUtils.setChecked(i.listItemElement,!1),i.listItemElement.createChild("div","breakpoint-hit-marker");const r=this.#n.get(e.category());r&&r.element.appendChild(i),this.#o.set(e,{element:i,checkbox:t.checkboxElement})}getBreakpointFromPausedDetails(e){return null}update(){const t=s.Context.Context.instance().flavor(e.Target.Target),i=t?t.model(e.DebuggerModel.DebuggerModel):null,n=i?i.debuggerPausedDetails():null;if(!n||n.reason!==this.#i||!n.auxData)return void(this.#s&&(s.ARIAUtils.setDescription(this.#s,""),this.#s.classList.remove("breakpoint-hit"),this.#s=void 0));const o=this.getBreakpointFromPausedDetails(n);if(!o)return;s.ViewManager.ViewManager.instance().showView(this.#t);const r=this.#n.get(o.category());r&&r.element.expand();const a=this.#o.get(o);a&&(this.#s=a.element.listItemElement,s.ARIAUtils.setDescription(this.#s,h(d.breakpointHit)),this.#s.classList.add("breakpoint-hit"))}categoryCheckboxClicked(e){const t=this.#n.get(e);if(!t)return;const i=t.checkbox.checked;s.ARIAUtils.setChecked(t.element.listItemElement,i);for(const[t,n]of this.#o)if(t.category()===e){const e=this.#o.get(t);e&&(e.checkbox.checked=i,this.toggleBreakpoint(t,i),s.ARIAUtils.setChecked(n.element.listItemElement,i))}}toggleBreakpoint(e,t){e.setEnabled(t)}breakpointCheckboxClicked(e){const t=this.#o.get(e);if(!t)return;this.toggleBreakpoint(e,t.checkbox.checked),s.ARIAUtils.setChecked(t.element.listItemElement,t.checkbox.checked);let i=!1,n=!1;for(const t of this.#o.keys())t.category()===e.category()&&(t.enabled()?i=!0:n=!0);const o=this.#n.get(e.category());o&&(o.checkbox.checked=i,o.checkbox.indeterminate=i&&n,o.checkbox.indeterminate?s.ARIAUtils.setCheckboxAsIndeterminate(o.element.listItemElement):s.ARIAUtils.setChecked(o.element.listItemElement,i))}wasShown(){super.wasShown(),this.#e.registerCSSFiles([l])}}const b={animation:p(d.animation),"auction-worklet":p(d.auctionWorklet),canvas:p(d.canvas),clipboard:p(d.clipboard),control:p(d.control),device:p(d.device),"dom-mutation":p(d.domMutation),"drag-drop":p(d.dragDrop),geolocation:p(d.geolocation),keyboard:p(d.keyboard),load:p(d.load),media:p(d.media),mouse:p(d.mouse),notification:p(d.notification),parse:p(d.parse),"picture-in-picture":p(d.pictureinpicture),pointer:p(d.pointer),script:p(d.script),"shared-storage-worklet":p(d.sharedStorageWorklet),timer:p(d.timer),touch:p(d.touch),"trusted-type-violation":p(d.trustedTypeViolations),"web-audio":p(d.webaudio),window:p(d.window),worker:p(d.worker),xhr:p(d.xhr)};function u(e){return b[e]()}var k=Object.freeze({__proto__:null,CSPViolationBreakpointsSidebarPane:class extends g{constructor(){super(e.DOMDebuggerModel.DOMDebuggerManager.instance().cspViolationBreakpoints(),"sources.csp-violation-breakpoints","CSPViolation"),this.contentElement.setAttribute("jslog",`${t.section("sources.csp-violation-breakpoints")}`)}getBreakpointFromPausedDetails(t){const i=t.auxData&&t.auxData.violationType?t.auxData.violationType:"",n=e.DOMDebuggerModel.DOMDebuggerManager.instance().cspViolationBreakpoints().find((e=>e.type()===i));return n||null}toggleBreakpoint(t,i){t.setEnabled(i),e.DOMDebuggerModel.DOMDebuggerManager.instance().updateCSPViolationBreakpoints()}}});const m=new CSSStyleSheet;m.replaceSync(".breakpoint-list{padding-bottom:3px}.breakpoint-list .dom-breakpoint > div{overflow:hidden;text-overflow:ellipsis}.breakpoint-entry{display:flex;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;padding:2px 0}.breakpoint-entry:focus-visible{background-color:var(--sys-color-tonal-container)}.breakpoint-list .breakpoint-entry:not(:focus-visible):hover{background-color:var(--sys-color-state-hover-on-subtle)}.breakpoint-hit{background-color:var(--sys-color-neutral-container);color:var(--sys-color-on-surface)}@media (forced-colors: active){.breakpoint-entry:focus-visible,\n  .breakpoint-list .breakpoint-entry:hover{forced-color-adjust:none;background-color:Highlight}.breakpoint-entry:focus-visible *,\n  .breakpoint-list .breakpoint-entry:hover *{color:HighlightText}}\n/*# sourceURL=domBreakpointsSidebarPane.css */\n");const v={noBreakpoints:"No breakpoints",domBreakpointsList:"DOM Breakpoints list",sS:"{PH1}: {PH2}",sSS:"{PH1}: {PH2}, {PH3}",checked:"checked",unchecked:"unchecked",sBreakpointHit:"{PH1} breakpoint hit",breakpointHit:"breakpoint hit",revealDomNodeInElementsPanel:"Reveal DOM node in Elements panel",removeBreakpoint:"Remove breakpoint",removeAllDomBreakpoints:"Remove all DOM breakpoints",subtreeModified:"Subtree modified",attributeModified:"Attribute modified",nodeRemoved:"Node removed",breakOn:"Break on",breakpointRemoved:"Breakpoint removed",breakpointSet:"Breakpoint set"},x=i.i18n.registerUIStrings("panels/browser_debugger/DOMBreakpointsSidebarPane.ts",v),M=i.i18n.getLocalizedString.bind(void 0,x),f=i.i18n.getLazilyComputedLocalizedString.bind(void 0,x);let C;class D extends s.Widget.VBox{elementToCheckboxes;#r;#o;#a;#l;constructor(){super(!0),this.elementToCheckboxes=new WeakMap,this.contentElement.setAttribute("jslog",`${t.section("sources.dom-breakpoints").track({resize:!0})}`),this.#r=this.contentElement.createChild("div","gray-info-message"),this.#r.textContent=M(v.noBreakpoints),this.#o=new s.ListModel.ListModel,this.#a=new s.ListControl.ListControl(this.#o,this,s.ListControl.ListMode.NonViewport),this.contentElement.appendChild(this.#a.element),this.#a.element.classList.add("breakpoint-list","hidden"),s.ARIAUtils.markAsList(this.#a.element),s.ARIAUtils.setLabel(this.#a.element,M(v.domBreakpointsList)),this.#r.tabIndex=-1,e.TargetManager.TargetManager.instance().addModelListener(e.DOMDebuggerModel.DOMDebuggerModel,"DOMBreakpointAdded",this.breakpointAdded,this),e.TargetManager.TargetManager.instance().addModelListener(e.DOMDebuggerModel.DOMDebuggerModel,"DOMBreakpointToggled",this.breakpointToggled,this),e.TargetManager.TargetManager.instance().addModelListener(e.DOMDebuggerModel.DOMDebuggerModel,"DOMBreakpointsRemoved",this.breakpointsRemoved,this);for(const t of e.TargetManager.TargetManager.instance().models(e.DOMDebuggerModel.DOMDebuggerModel)){t.retrieveDOMBreakpoints();for(const e of t.domBreakpoints())this.addBreakpoint(e)}this.#l=null,this.update()}static instance(){return C||(C=new D),C}createElementForItem(e){const i=document.createElement("div");i.classList.add("breakpoint-entry"),i.setAttribute("jslog",`${t.domBreakpoint().context(e.type)}`),i.addEventListener("contextmenu",this.contextMenu.bind(this,e),!0),s.ARIAUtils.markAsListitem(i),i.tabIndex=-1;const n=s.UIUtils.CheckboxLabel.create(void 0,e.enabled),o=n.checkboxElement;o.addEventListener("click",this.checkboxClicked.bind(this,e),!1),o.tabIndex=-1,this.elementToCheckboxes.set(i,o),i.appendChild(n),i.addEventListener("keydown",(e=>{" "===e.key&&(n.checkboxElement.click(),e.consume(!0))}));const a=document.createElement("div");a.classList.add("dom-breakpoint"),i.appendChild(a);const l=document.createElement("div"),d=E.get(e.type);l.textContent=d?d():null;const c=d?d():"";s.ARIAUtils.setLabel(o,c),o.setAttribute("jslog",`${t.toggle().track({click:!0})}`);const h=e.enabled?M(v.checked):M(v.unchecked),p=document.createElement("monospace");return p.style.display="block",a.appendChild(p),r.Linkifier.Linkifier.linkify(e.node,{preventKeyboardFocus:!0,tooltip:void 0}).then((e=>{p.appendChild(e),s.ARIAUtils.setLabel(o,M(v.sS,{PH1:c,PH2:e.deepTextContent()})),s.ARIAUtils.setLabel(i,M(v.sSS,{PH1:c,PH2:e.deepTextContent(),PH3:h}))})),a.appendChild(l),e===this.#l?(i.classList.add("breakpoint-hit"),s.ARIAUtils.setDescription(i,M(v.sBreakpointHit,{PH1:h})),s.ARIAUtils.setDescription(o,M(v.breakpointHit))):s.ARIAUtils.setDescription(i,h),this.#r.classList.add("hidden"),this.#a.element.classList.remove("hidden"),i}heightForItem(e){return 0}isItemSelectable(e){return!0}updateSelectedItemARIA(e,t){return!0}selectedItemChanged(e,t,i,n){i&&(i.tabIndex=-1),n&&(this.setDefaultFocusedElement(n),n.tabIndex=0,this.hasFocus()&&n.focus())}breakpointAdded(e){this.addBreakpoint(e.data)}breakpointToggled(e){const t=this.hasFocus(),i=e.data;this.#a.refreshItem(i),t&&this.focus()}breakpointsRemoved(e){const t=this.hasFocus(),i=e.data;let n=-1;for(const e of i){const t=this.#o.indexOf(e);t>=0&&(this.#o.remove(t),n=t)}if(0===this.#o.length)this.#r.classList.remove("hidden"),this.setDefaultFocusedElement(this.#r),this.#a.element.classList.add("hidden");else if(n>=0){const e=this.#o.at(n);e&&this.#a.selectItem(e)}t&&this.focus()}addBreakpoint(e){this.#o.insertWithComparator(e,((e,t)=>e.type>t.type?-1:e.type<t.type?1:0)),this.#a.selectedItem()&&this.hasFocus()||this.#a.selectItem(this.#o.at(0))}contextMenu(e,t){const i=new s.ContextMenu.ContextMenu(t);i.defaultSection().appendItem(M(v.revealDomNodeInElementsPanel),(()=>r.Revealer.reveal(e.node)),{jslogContext:"reveal-in-elements"}),i.defaultSection().appendItem(M(v.removeBreakpoint),(()=>{e.domDebuggerModel.removeDOMBreakpoint(e.node,e.type)}),{jslogContext:"remove-breakpoint"}),i.defaultSection().appendItem(M(v.removeAllDomBreakpoints),(()=>{e.domDebuggerModel.removeAllDOMBreakpoints()}),{jslogContext:"remove-all-dom-breakpoints"}),i.show()}checkboxClicked(e,t){e.domDebuggerModel.toggleDOMBreakpoint(e,!!t.target&&t.target.checked)}flavorChanged(e){this.update()}update(){const t=s.Context.Context.instance().flavor(e.DebuggerModel.DebuggerPausedDetails);if(this.#l){const e=this.#l;this.#l=null,this.#a.refreshItem(e)}if(!t||!t.auxData||"DOM"!==t.reason)return;const i=t.debuggerModel.target().model(e.DOMDebuggerModel.DOMDebuggerModel);if(!i)return;const n=i.resolveDOMBreakpointData(t.auxData);if(n){for(const e of this.#o)e.node===n.node&&e.type===n.type&&(this.#l=e);this.#l&&this.#a.refreshItem(this.#l),s.ViewManager.ViewManager.instance().showView("sources.dom-breakpoints")}}wasShown(){super.wasShown(),this.registerCSSFiles([m])}}const E=new Map([["subtree-modified",f(v.subtreeModified)],["attribute-modified",f(v.attributeModified)],["node-removed",f(v.nodeRemoved)]]);var B=Object.freeze({__proto__:null,DOMBreakpointsSidebarPane:D,ContextMenuProvider:class{appendApplicableItems(t,i,n){if(n.pseudoType())return;const r=n.domModel().target().model(e.DOMDebuggerModel.DOMDebuggerModel);if(!r)return;function a(e){if(!r)return;const t=o.DebuggerPausedMessage.BreakpointTypeNouns.get(e),i=t?t():"";r.hasDOMBreakpoint(n,e)?(r.removeDOMBreakpoint(n,e),s.ARIAUtils.alert(`${M(v.breakpointRemoved)}: ${i}`)):(r.setDOMBreakpoint(n,e),s.ARIAUtils.alert(`${M(v.breakpointSet)}: ${i}`))}const l=i.debugSection().appendSubMenuItem(M(v.breakOn),!1,"break-on"),d={SubtreeModified:"subtree-modified",AttributeModified:"attribute-modified",NodeRemoved:"node-removed"};for(const e of Object.values(d)){const t=o.DebuggerPausedMessage.BreakpointTypeNouns.get(e);t&&l.defaultSection().appendCheckboxItem(t(),a.bind(null,e),{checked:r.hasDOMBreakpoint(n,e),jslogContext:e})}}}});let y;class w extends g{constructor(){let i=e.DOMDebuggerModel.DOMDebuggerManager.instance().eventListenerBreakpoints();const n=e.EventBreakpointsModel.EventBreakpointsManager.instance().eventListenerBreakpoints();i=i.concat(n),super(i,"sources.event-listener-breakpoints","EventListener"),this.contentElement.setAttribute("jslog",`${t.section("sources.event-listener-breakpoints")}`)}static instance(){return y||(y=new w),y}getBreakpointFromPausedDetails(t){const i=t.auxData,n=e.DOMDebuggerModel.DOMDebuggerManager.instance().resolveEventListenerBreakpoint(i);return n||e.EventBreakpointsModel.EventBreakpointsManager.instance().resolveEventListenerBreakpoint(i)}}var L=Object.freeze({__proto__:null,EventListenerBreakpointsSidebarPane:w});class I extends s.ThrottledWidget.ThrottledWidget{#d;eventListenersView;constructor(){super(),this.contentElement.setAttribute("jslog",`${t.section("sources.global-listeners")}`),this.eventListenersView=new a.EventListenersView.EventListenersView(this.update.bind(this),!0),this.eventListenersView.show(this.element),this.setDefaultFocusedChild(this.eventListenersView),this.update()}toolbarItems(){return[s.Toolbar.Toolbar.createActionButtonForId("browser-debugger.refresh-global-event-listeners")]}async doUpdate(){this.#d&&(this.#d.runtimeModel.releaseObjectGroup(S),this.#d=void 0);const t=[],i=s.Context.Context.instance().flavor(e.RuntimeModel.ExecutionContext);if(i){this.#d=i;const e=await i.evaluate({expression:"self",objectGroup:S,includeCommandLineAPI:!1,silent:!0,returnByValue:!1,generatePreview:!1},!1,!1);"error"in e||e.exceptionDetails||t.push(e.object)}await this.eventListenersView.addObjects(t)}wasShown(){super.wasShown(),s.Context.Context.instance().addFlavorChangeListener(e.RuntimeModel.ExecutionContext,this.update,this),s.Context.Context.instance().setFlavor(I,this)}willHide(){s.Context.Context.instance().setFlavor(I,null),s.Context.Context.instance().removeFlavorChangeListener(e.RuntimeModel.ExecutionContext,this.update,this),super.willHide(),this.#d&&(this.#d.runtimeModel.releaseObjectGroup(S),this.#d=void 0)}}const S="object-event-listeners-sidebar-pane";var A=Object.freeze({__proto__:null,ObjectEventListenersSidebarPane:I,ActionDelegate:class{handleAction(e,t){if("browser-debugger.refresh-global-event-listeners"===t){const t=e.flavor(I);return!!t&&(t.update(),!0)}return!1}},objectGroupName:S});const O=new CSSStyleSheet;O.replaceSync('.breakpoint-list{padding-bottom:3px}.breakpoint-list .editing.being-edited{overflow:hidden;white-space:nowrap}.breakpoint-condition{display:block;margin:4px 8px 4px 23px}.breakpoint-condition-input{display:block;margin-left:0;margin-right:0;border:1px solid var(--sys-color-neutral-outline);border-radius:4px;&:focus{outline:5px auto var(--sys-color-tonal-outline);box-shadow:none}}.breakpoint-entry{white-space:nowrap;padding:2px 0}.breakpoint-list .breakpoint-entry:hover{background-color:var(--sys-color-state-hover-on-subtle)}.breakpoint-list .breakpoint-entry:focus-visible{background-color:var(--sys-color-tonal-container)}.breakpoint-entry [is="dt-checkbox"]{max-width:100%}.breakpoint-hit{background-color:var(--sys-color-yellow-container);border-right:3px solid var(--sys-color-yellow-outline);color:var(--sys-color-on-yellow-container)}@media (forced-colors: active){.breakpoint-list .breakpoint-entry:hover,\n  .breakpoint-list .breakpoint-entry:focus-visible{forced-color-adjust:none;background-color:Highlight}.breakpoint-list .breakpoint-entry:hover *,\n  .breakpoint-list .breakpoint-entry:focus-visible *{color:HighlightText}}\n/*# sourceURL=xhrBreakpointsSidebarPane.css */\n');const R={xhrfetchBreakpoints:"XHR/fetch Breakpoints",noBreakpoints:"No breakpoints",addXhrfetchBreakpoint:"Add XHR/fetch breakpoint",addBreakpoint:"Add breakpoint",breakWhenUrlContains:"Break when URL contains:",urlBreakpoint:"URL Breakpoint",urlContainsS:'URL contains "{PH1}"',anyXhrOrFetch:"Any XHR or fetch",breakpointHit:"breakpoint hit",removeAllBreakpoints:"Remove all breakpoints",removeBreakpoint:"Remove breakpoint"},T=i.i18n.registerUIStrings("panels/browser_debugger/XHRBreakpointsSidebarPane.ts",R),P=i.i18n.getLocalizedString.bind(void 0,T),U=new WeakMap,H=new WeakMap;let j;class V extends s.Widget.VBox{#o;#a;#r;#c;#h;#p;constructor(){super(!0),this.#o=new s.ListModel.ListModel,this.#a=new s.ListControl.ListControl(this.#o,this,s.ListControl.ListMode.NonViewport),this.contentElement.setAttribute("jslog",`${t.section("source.xhr-breakpoints")}`),this.contentElement.appendChild(this.#a.element),this.#a.element.classList.add("breakpoint-list","hidden"),s.ARIAUtils.markAsList(this.#a.element),s.ARIAUtils.setLabel(this.#a.element,P(R.xhrfetchBreakpoints)),this.#r=this.contentElement.createChild("div","gray-info-message"),this.#r.textContent=P(R.noBreakpoints),this.#c=new Map,this.#h=new s.Toolbar.ToolbarButton(P(R.addXhrfetchBreakpoint),"plus",void 0,"sources.add-xhr-fetch-breakpoint"),this.#h.addEventListener("Click",(()=>{this.addButtonClicked()})),this.#r.addEventListener("contextmenu",this.emptyElementContextMenu.bind(this),!0),this.#r.tabIndex=-1,this.restoreBreakpoints(),this.update()}static instance(){return j||(j=new V),j}toolbarItems(){return[this.#h]}emptyElementContextMenu(e){const t=new s.ContextMenu.ContextMenu(e);t.defaultSection().appendItem(P(R.addBreakpoint),this.addButtonClicked.bind(this),{jslogContext:"sources.add-xhr-fetch-breakpoint"}),t.show()}async addButtonClicked(){await s.ViewManager.ViewManager.instance().showView("sources.xhr-breakpoints");const t=document.createElement("p");t.classList.add("breakpoint-condition"),t.textContent=P(R.breakWhenUrlContains);const i=t.createChild("span","breakpoint-condition-input");function n(i,n,o){this.removeListElement(t),i&&(e.DOMDebuggerModel.DOMDebuggerManager.instance().addXHRBreakpoint(o,!0),this.setBreakpoint(o)),this.update()}s.ARIAUtils.setLabel(i,P(R.urlBreakpoint)),this.addListElement(t,this.#a.element.firstChild);const o=new s.InplaceEditor.Config(n.bind(this,!0),n.bind(this,!1));s.InplaceEditor.InplaceEditor.startEditing(i,o)}heightForItem(e){return 0}isItemSelectable(e){return!0}setBreakpoint(e){-1!==this.#o.indexOf(e)?this.#a.refreshItem(e):this.#o.insertWithComparator(e,((e,t)=>e>t?1:e<t?-1:0)),this.#a.selectedItem()&&this.hasFocus()||this.#a.selectItem(this.#o.at(0))}createElementForItem(t){const i=document.createElement("div");s.ARIAUtils.markAsListitem(i);const n=i.createChild("div","breakpoint-entry");U.set(i,n);const o=e.DOMDebuggerModel.DOMDebuggerManager.instance().xhrBreakpoints().get(t)||!1;s.ARIAUtils.markAsCheckbox(n),s.ARIAUtils.setChecked(n,o),n.addEventListener("contextmenu",this.contextMenu.bind(this,t),!0);const r=t?P(R.urlContainsS,{PH1:t}):P(R.anyXhrOrFetch),a=s.UIUtils.CheckboxLabel.create(r,o);return s.ARIAUtils.markAsHidden(a),s.ARIAUtils.setLabel(n,r),n.appendChild(a),a.checkboxElement.addEventListener("click",this.checkboxClicked.bind(this,t,o),!1),n.addEventListener("click",(e=>{e.target===n&&this.checkboxClicked(t,o)}),!1),H.set(n,a.checkboxElement),a.checkboxElement.tabIndex=-1,n.tabIndex=-1,t===this.#a.selectedItem()&&(n.tabIndex=0,this.setDefaultFocusedElement(n)),n.addEventListener("keydown",(e=>{let i=!1;" "===e.key?(this.checkboxClicked(t,o),i=!0):"Enter"===e.key&&(this.labelClicked(t),i=!0),i&&e.consume(!0)})),t===this.#p&&(n.classList.add("breakpoint-hit"),s.ARIAUtils.setDescription(n,P(R.breakpointHit))),a.classList.add("cursor-auto"),a.textElement.addEventListener("dblclick",this.labelClicked.bind(this,t),!1),this.#c.set(t,i),i}selectedItemChanged(e,t,i,n){if(i){const e=U.get(i);if(!e)throw new Error("Expected breakpoint entry to be found for an element");e.tabIndex=-1}if(n){const e=U.get(n);if(!e)throw new Error("Expected breakpoint entry to be found for an element");this.setDefaultFocusedElement(e),e.tabIndex=0,this.hasFocus()&&e.focus()}}updateSelectedItemARIA(e,t){return!0}removeBreakpoint(e){const t=this.#o.indexOf(e);t>=0&&this.#o.remove(t),this.#c.delete(e),this.update()}addListElement(e,t){this.#a.element.insertBefore(e,t),this.#r.classList.add("hidden"),this.#a.element.classList.remove("hidden")}removeListElement(e){this.#a.element.removeChild(e),this.#a.element.firstElementChild||(this.#r.classList.remove("hidden"),this.#a.element.classList.add("hidden"))}contextMenu(t,i){const n=new s.ContextMenu.ContextMenu(i);const o=P(R.removeAllBreakpoints);n.defaultSection().appendItem(P(R.addBreakpoint),this.addButtonClicked.bind(this),{jslogContext:"sources.add-xhr-fetch-breakpoint"}),n.defaultSection().appendItem(P(R.removeBreakpoint),function(){e.DOMDebuggerModel.DOMDebuggerManager.instance().removeXHRBreakpoint(t),this.removeBreakpoint(t)}.bind(this),{jslogContext:"sources.remove-xhr-fetch-breakpoint"}),n.defaultSection().appendItem(o,function(){for(const t of this.#c.keys())e.DOMDebuggerModel.DOMDebuggerManager.instance().removeXHRBreakpoint(t),this.removeBreakpoint(t);this.update()}.bind(this),{jslogContext:"sources.remove-all-xhr-fetch-breakpoints"}),n.show()}checkboxClicked(t,i){const n=this.hasFocus();e.DOMDebuggerModel.DOMDebuggerManager.instance().toggleXHRBreakpoint(t,!i),this.#a.refreshItem(t),this.#a.selectItem(t),n&&this.focus()}labelClicked(t){const i=this.#c.get(t),n=document.createElement("span");function o(o,s,r){if(this.removeListElement(n),o){e.DOMDebuggerModel.DOMDebuggerManager.instance().removeXHRBreakpoint(t),this.removeBreakpoint(t);let n=!0;if(i){const e=U.get(i),t=e?H.get(e):void 0;t&&(n=t.checked)}e.DOMDebuggerModel.DOMDebuggerManager.instance().addXHRBreakpoint(r,n),this.setBreakpoint(r),this.#a.selectItem(r)}else i&&i.classList.remove("hidden");this.focus()}n.classList.add("breakpoint-condition"),n.textContent=t,i&&(this.#a.element.insertBefore(n,i),i.classList.add("hidden"));const r=new s.InplaceEditor.Config(o.bind(this,!0),o.bind(this,!1));s.InplaceEditor.InplaceEditor.startEditing(n,r)}flavorChanged(e){this.update()}update(){const t=0===this.#o.length;this.#a.element.classList.toggle("hidden",t),this.#r.classList.toggle("hidden",!t);const i=s.Context.Context.instance().flavor(e.DebuggerModel.DebuggerPausedDetails);if(!i||"XHR"!==i.reason){if(this.#p){const e=this.#p;this.#p=void 0,this.#o.indexOf(e)>=0&&this.#a.refreshItem(e)}return}const n=i.auxData&&i.auxData.breakpointURL;this.#p=n,this.#o.indexOf(n)<0||(this.#a.refreshItem(n),s.ViewManager.ViewManager.instance().showView("sources.xhr-breakpoints"))}restoreBreakpoints(){const t=e.DOMDebuggerModel.DOMDebuggerManager.instance().xhrBreakpoints();for(const e of t.keys())this.setBreakpoint(e)}wasShown(){super.wasShown(),this.registerCSSFiles([O])}}var F=Object.freeze({__proto__:null,XHRBreakpointsSidebarPane:V});export{k as CSPViolationBreakpointsSidebarPane,B as DOMBreakpointsSidebarPane,L as EventListenerBreakpointsSidebarPane,A as ObjectEventListenersSidebarPane,F as XHRBreakpointsSidebarPane};
