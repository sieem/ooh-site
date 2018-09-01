<template>
	<div class="admin">
		  	<div class="menubar">
			  	<router-link to="/">Home</router-link>
			  	<router-link to="/admin">Admin</router-link>
			  	<router-link to="/admin/overview">Overview</router-link>
			  	<router-link to="/admin/article">Add article</router-link>
		  	</div>

		<div class="lists">
			<table class="list">
				<draggable v-model="articles" @end="updateList()">
					<tr class="listItem" v-for="article in articles">
						<td class="preview" v-bind:style="article.background_image ? {backgroundImage: 'url(https://api.o-o-h.be/uploads/' + article.background_image + ')' } : {}" v-bind:class="{cover: article.background_image_cover, whiteText: article.white_text}"><div class="article" v-html="article.article"></div><div class="credits" v-html="article.credits"></div></td>
						<td>{{article.id}}</td>
						<td>{{article.title}}</td>
						<td><router-link v-bind:to="'/admin/article/'+ article.id">Edit</router-link></td>
						<td><a href="#" v-on:click="deleteArticle(article.id)">Delete</a></td>
					</tr>
				</draggable>
			</table>
		</div>
	</div>
</template>

<script>
	import draggable from 'vuedraggable'

	export default {
		name: 'AdminOverview',
		data () {
			return {
				articles: {},
				auth: null,
			}
		},
		components: {
			draggable,
		},
		methods: {
			fetchArticles(){
				this.$http.get("https://api.o-o-h.be/overview")
				.then(function (response) {
					this.articles = response.body
				})
			},
			deleteArticle(id){
				if (confirm("Are you sure?")) {
					this.$http.delete("https://api.o-o-h.be/overview/delete/" + id + "/" + this.auth)
					.then(function (response)
					{
						if (!response.body.error)
						{
							this.fetchArticles()
						}
					})
				}

			},
			updateList(position)
			{
				this.$http.put("https://api.o-o-h.be/articles/ordering/overview/"+this.auth, this.articles)
				.then(function (response) {

				})
			}
		},
		created: function () {
			this.auth = window.prompt("What do you like for breakfast?","");
			this.fetchArticles()
		}
	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>



.admin
{
	margin: 40px;
}

.admin table
{
	width: 50%;
	margin: auto;
}

.admin table tr
{
	cursor: pointer;
	width: 100%;
}

.admin table td
{
	border:1px dashed black;
	vertical-align: middle;
}

.admin table td.preview
{
	position: relative;
	width: 100px;
	height: 100px;
	font-size: 3px!important;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center center;
}

.admin table td.preview.cover
{
	background-size: cover;
}

.admin table td.preview.whiteText
{
	color:#fff;
}

.admin table td.preview div.credits
{
	position: absolute;
	bottom: 0;
	font-size: 3px!important;
}
</style>
