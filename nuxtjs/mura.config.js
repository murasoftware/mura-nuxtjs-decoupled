import Mura from 'mura.js';
import Example from '@/components/modules/Example'
import CollectionLayout from '@/components/modules/CollectionLayout'
import Vue from 'vue'

require('mura.js/src/core/ui.vueserver')

Mura.Module.Example=Mura.UI.VueServer.extend(
 {
	component:Example
});

//This is registered as a collection layout in the mura.config.json
Mura.Module.VueCollectionLayout=Mura.UI.VueServer.extend(
 {
	component:CollectionLayout
});
