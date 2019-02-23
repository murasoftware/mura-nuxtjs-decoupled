<template>
<div>
<script>window.queuedMuraCmds=[],window.queuedMuraPreInitCmds=[],window.mura=window.m=window.Mura=function(u){window.queuedMuraCmds.push(u)},window.Mura.preInit=function(u){window.queuedMuraPreInitCmds.push(u)};</script>
<div>
	<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Mura/NuxtJS</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav mr-auto" v-if="primaryNavData">
      <li v-bind:class="{ 'active': (content.contentid==item.contentid), 'nav-item':true }" v-for="item of primaryNavData" :key="item.contentid">
				<a class="nav-link"v-bind:href="item.url">{{item.menutitle}}<!--<span class="sr-only">(current)</span>--></a>
      </li>
    </ul>
    <form class="form-inline my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="text" name="keywords" placeholder="Search" aria-label="Search">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
			<input name="display" type="hidden" value="search"/>
			<input name="nocache" type="hidden" value="1"/>
			<input name="newsearch" type="hidden" value="1"/>
		</form>
  </div>
</nav>
</div>
<h1>{{content.title}}</h1>
<div v-html="content.body"></div>
<div v-html="region.maincontent"></div>
<div id="htmlqueues"></div>
</div>
</template>

<script>
import Mura from 'mura.js'

require('../mura.config.js')

var path =''
export default {
  components: {
  },
	data () {
		return {
			content:'',
			primaryNavData:'',
			mainregion:'',
			Mura: Mura
		}
	},
	mounted(){
    this.init()
  },
	async asyncData (context) {

		Mura.init({
			rootpath:"http://localhost:8888",
			siteid:"default",
			processMarkup:false,
			response:context.res,
			request:context.req
		})

		//Don't rely on ready event for when to fire
		Mura.holdReady(true);

		function renderContent(context){
			let query={}
			if (process.client) {
				query=Mura.getQueryStringParams()
			} else {
				query=context.route.query;
			}

			return Mura.renderFilename(context.route.path,query).then((rendered)=>{
				return rendered
			},(rendered)=>{
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
		}

		function getPrimaryNavData(){
			return Mura.getFeed('content')
				.where()
				.prop('parentid').isEQ('00000000000000000000000000000000001')
				.sort('orderno')
				.getQuery()
				.then(collection=>{
					let tempArray=collection.getAll().items;
					tempArray.unshift({url:"/",menutitle:"Home",title:"Home",filename:"",contentid:"00000000000000000000000000000000001"});
					return tempArray;
				});
		}

		const content=await renderContent(context)
		const primaryNavData=await getPrimaryNavData()
		const mainregion=await content.renderDisplayRegion('maincontent')

		if(content.get('redirect')){
			location.href=content.get('redirect')
			return
		} else {
			return {
				content:content.getAll(),
				primaryNavData:primaryNavData,
				region:{
					maincontent:mainregion
				}
			}
		}

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
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

ul.primarynav {
	padding: 10px 16px;
	list-style: none;
	background-color: #eee;
}

/* Display list items side by side */
ul.primarynav li {
	display: inline;
	font-size: 18px;
}

/* Add a slash symbol (/) before/behind each list item */
ul.primarynav li+li:before {
	padding: 8px;
	color: black;
	content: "/\00a0";
}

/* Add a color to all links inside the list */
ul.primarynav li a {
	color: #0275d8;
	text-decoration: none;
}

/* Add a color on mouse-over */
ul.primarynav li a:hover {
	color: #01447e;
	text-decoration: underline;
}
</style>
