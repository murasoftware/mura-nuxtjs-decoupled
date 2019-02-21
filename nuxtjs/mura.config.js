import Mura from 'mura.js';
import Example from '@/components/modules/Example'
import CollectionLayout from '@/components/modules/CollectionLayout'
import Vue from 'vue'

require('mura.js/src/core/ui.serverutils')

Mura.UI.Vue=Mura.UI.extend(
/** @lends Mura.UI.Vue.prototype */
{
	vm:'',

	$vm:function(){
		if(!this.vm){
			this.vm=new Vue(
				Object.assign({},
					this.component,
					{
						propsData:{ context: this.context }
					})
			);
		}
		return this.vm;
	},

	renderClient:function(){
		const container=Mura(this.context.targetEl)
		if(!container.node.firstChild){
			container.node.appendChild(document.createElement('DIV'));
		}
		container.node.firstChild.setAttribute('id','mc' + this.context.instanceid)
		this.$vm().$mount('#mc' + this.context.instanceid)
		this.trigger('afterRender');
	},

	destroy:function(){
		const container=Mura(this.context.targetEl)
		if(container.length && container.node.innerHTML){
			container.node.firstChild.setAttribute('id','mc' + this.context.instanceid)
			this.$vm().$destroy();
		}
	},

	renderServer:function(){
		return this.renderer.renderToString(this.$vm())
	},

	hydrate:function(){
		const container=Mura(this.context.targetEl)
		if(container.length && container.node.innerHTML){
			container.node.firstChild.setAttribute('id','mc' + this.context.instanceid)
			this.$vm().$mount('#mc' + this.context.instanceid,true)
			this.trigger('afterRender');
		}
	},

	registerHelpers:function(){
		if(Mura.isInNode()){
			this.renderer = eval("require('vue-server-renderer')").createRenderer(this.rendererOptions)
		}
	},

	renderer:null,

	rendererOptions:{}

});

Mura.Module.Example=Mura.UI.Vue.extend(
 {
	component:Example
});

//This is registered as a collection layout in the mura.config.json
Mura.Module.VueCollectionLayout=Mura.UI.Vue.extend(
 {
	component:CollectionLayout
});
