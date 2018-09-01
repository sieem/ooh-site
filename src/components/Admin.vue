<template>
	<div class="admin">
		  	<div class="menubar">
			  	<router-link to="/">Home</router-link>
			  	<router-link to="/admin">Admin</router-link>
			  	<router-link to="/admin/overview">Overview</router-link>
			  	<router-link to="/admin/article">Add article</router-link>
		  	</div>

		<div class="lists">
			<table class="list" v-for="position in positions">
				<draggable v-model="articles[position]" @end="updateList(position)">
					<tr class="listItem" v-for="article in articles[position]">
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
		name: 'Admin',
		data () {
			return {
				articles: {left: [], right: []},
				positions: ["left", "right"],
				auth: null,
			}
		},
		components: {
			draggable,
		},
		methods: {
			fetchArticles(position){
				this.$http.get("https://api.o-o-h.be/articles/"+ position.substring(0, 1))
				.then(function (response) {
					this.articles[position] = response.body
				})
			},
			deleteArticle(id)
			{
				if (confirm("Are you sure?"))
				{
					this.$http.delete("https://api.o-o-h.be/articles/delete/" + id+ "/" + this.auth)
					.then(function (response) {
						console.log("delete");
						this.fetchArticles("left")
						this.fetchArticles("right")
					})
				}

			},
			updateList(position)
			{
				this.$http.put("https://api.o-o-h.be/articles/ordering/article/" + this.auth, this.articles[position])
				.then(function (response) {

				})
			}
		},
		created: function ()
		{
			this.auth = window.prompt("What do you like for breakfast?","");
			this.fetchArticles("left")
			this.fetchArticles("right")
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
	float: left;
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
