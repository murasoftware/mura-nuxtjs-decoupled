<template>
<div>
<script>if(typeof Mura == 'undefined'){window.queuedMuraCmds=[],window.queuedMuraPreInitCmds=[],window.mura=window.m=window.Mura=function(u){window.queuedMuraCmds.push(u)},window.Mura.preInit=function(u){window.queuedMuraPreInitCmds.push(u)};}</script>
<div>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-brand href="#">Mura/NuxtJS</b-navbar-brand>

    <b-navbar-toggle target="nav_collapse" />

    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item v-bind:class="{ 'active': (content.contentid==item.contentid)}" v-for="item of primaryNavData" :key="item.contentid" :to="'/'+item.filename">{{item.menutitle}}</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-form-input size="sm" name="keywords" class="mr-sm-2" type="text" placeholder="Search" />
          <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
					<input name="display" type="hidden" value="search"/>
					<input name="nocache" type="hidden" value="1"/>
					<input name="newsearch" type="hidden" value="1"/>
        </b-nav-form>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>
<main role="main" class="container">
<h1 class="mt-5">{{content.title}}</h1>
<b-breadcrumb v-if="crumbs.length > 1" :items="crumbs" />
<div v-html="content.body"></div>
<div v-html="region.maincontent"></div>
</main>
<footer class="footer">
 <div class="container">
	 <span class="text-muted">&copy; {{new Date().getFullYear()}}</span>
 </div>
</footer>
<div id="htmlqueues"></div>
</div>
</template>

<script>
import Mura from 'mura.js'

require('../mura.config.js')

var path =''

var loadContent=async function(context){

	if(process.server){
		Mura.init({
			rootpath:"http://localhost:8888",
			siteid:"default",
			processMarkup:false,
			response:context.res,
			request:context.req
		})
	}

	//Don't rely on ready event for when to fire
	Mura.holdReady(true);

	const content= await Mura.renderFilename(context.route.path,context.route.query).then(function(rendered){
		return rendered
	},function(rendered){
		if(!rendered){
			return Mura
				.getEntity('content')
				.set({
					title:'404',
					menutitle:'404',
					body:'The content that you requested can not be found',
					contentid: Mura.createUUID(),
					isnew:1,
					siteid: Mura.siteid,
					type: 'Page',
					subtype: 'Default',
					contentid: Mura.createUUID(),
					contenthistid: Mura.createUUID(),
					filename:"404"
				})
		} else {
			return rendered
		}
	})

	var primaryNavData=await Mura.getFeed('content')
		.where()
		.prop('parentid').isEQ('00000000000000000000000000000000001')
		.sort('orderno')
		.getQuery()
		.then(function(collection){
			let tempArray=collection.getAll().items;
			tempArray.unshift({to:"/",menutitle:"Home",title:"Home",filename:"",contentid:"00000000000000000000000000000000001"});
			return tempArray;
		});

	if(content.exists()){
		var crumbs=await content.get('crumbs').then(function(crumbs){
			return crumbs.get('items').map(function(item){
				return {
					text:item.get('menutitle'),
					to:"/" + item.get('filename'),
					active:(item.contentid==content.get('contentid'))
				}
			}).reverse();
		});
	} else {
		var crumbs=[]
	}

	const mainregion=await content.renderDisplayRegion('maincontent')

	if(content.get('redirect') && typeof location != 'undefined'){
		location.href=content.get('redirect')
		return
	} else {
		return {
			content:content.getAll(),
			primaryNavData:primaryNavData,
			region:{
				maincontent:mainregion
			},
			crumbs:crumbs
		}
	}
}

export default {
  components: {
  },
	data () {
		return {
			content:'',
			primaryNavData:'',
			region:{maincontent:''},
			Mura: Mura,
			crumbs:[]
		}
	},
	mounted(){
		this.init()
	},
	watch:{
		async '$route.query'() {
			const data=await loadContent({
				route:$nuxt.$route
			})

			this.content=data.content;
			this.crumbs=data.crumbs;
			this.primaryNavData=data.primaryNavData;
			this.region=data.region;

			this.init();
		}
	},
	async asyncData (context) {
		return await loadContent(context)
	},
  layout(context) {
    return 'default'
  },
	methods:{
		getContent(){
			//This inflates the entity's object back into a Mura.Entity instance
			return Mura.getEntity('content').set(this.content)
		},

		init(){
			const content=Mura.getEntity('content').set(this.content)

			if(content.get('redirect')){
				location.href=content.get('redirect')
				return
			}

			//The setTimeout was used to prevent mysterious double processing of previous html in element
			setTimeout(
				()=>{
					Mura('#htmlqueues').html(content.get('htmlheadqueue') + content.get('htmlfootqueue'))
				},
				100
			)

			if(content.exists()){

				//Re-initialize Mura for browser with content node specific details
				//console.log(content.get('config'))
				Mura.init(Mura.extend({queueObjects:false,content:content}))

				Mura.holdReady(false);

				Mura.loader()
					.loadcss(Mura.rootpath + '/core/modules/v1/core_assets/css/mura.7.1.min.css')
					.loadcss(Mura.rootpath + '/core/modules/v1/core_assets/css/mura.7.1.skin.css');
			}
		}
	}
}
</script>

<style>

</style>
