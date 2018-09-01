<template>
	<div class="admin">
		<div class="menubar">
			<router-link to="/">Home</router-link>
			<router-link to="/admin">Admin</router-link>
			<router-link to="/admin/overview">Overview</router-link>
			<router-link to="/admin/article">Add article</router-link>
		</div>
		<form v-on:submit="processArticle">
		 <div class="form-group">
			<label>Title</label>
			<input type="text" name="title" v-model="article.title">
		</div>
		<div class="form-group">
			<label>position</label>
			<select v-model="article.position">
			 <option value="l">Left</option>
			 <option value="r">Right</option>
		 </select>
	 </div>
	  <div class="form-group">
	 	<label>show in overview</label>
	 	<input type="checkbox" name="show_in_overview" v-model="article.show_in_overview">
	 </div>
	 <div class="form-group">
		<label>show fold</label>
		<input type="checkbox" name="fold" v-model="article.fold">
	</div>
	<div class="form-group">
		<label>article <a href="https://nl.m.wikipedia.org/wiki/Markdown">Markdown Cheatsheet</a></label>
		<textarea name="article" v-model="article.article"></textarea>
	</div>
	<div class="form-group">
		<label>credits <a href="https://nl.m.wikipedia.org/wiki/Markdown">Markdown Cheatsheet</a></label>
		<textarea name="credits" v-model="article.credits"></textarea>
	</div>
	<div class="form-group">
		<label>white text</label>
		<input type="checkbox" name="white_text" v-model="article.white_text">
	</div>
	<div class="form-group">
		<label>background-image</label>
		<input type="file" name="" @change="uploadFile($event, 'background_image')">
		<input type="text" name="background_image" disabled="disabled" v-model="article.background_image">
		<a class="btn" v-on:click="deleteFile('background_image')">Delete background</a>
	</div>
	<div class="form-group">
		<label>cover background</label>
		<input type="checkbox" name="background_image_cover" v-model="article.background_image_cover">
	</div>
	<hr>
	<div class="form-group">
		<label>video forward</label>
		<input type="file" name="" @change="uploadFile($event, 'video_forward')">
		<input type="text" name="video_forward" disabled="disabled" v-model="article.video_forward">
		<a class="btn" v-on:click="deleteFile('video_forward')">Delete video</a>
	</div>
	<div class="form-group">
		<label>video backward</label>
		<input type="file" name="" @change="uploadFile($event, 'video_backward')">
		<input type="text" name="video_backward" disabled="disabled" v-model="article.video_backward">
		<a class="btn" v-on:click="deleteFile('video_backward')">Delete video</a>
	</div>
	<input type="submit" name="submit">
</form>
</div>
</template>

<script>
	export default {
		name: 'adminUpdateArticle',
		data () {
			return {
				article: {},
				file: null,
				auth: null,
			}
		},
		methods: {
		 processArticle(e) {
			e.preventDefault();

			var id = this.$route.params.id || false;

			if(!this.article.title || !this.article.position)
			{
			 alert("error")
		 }
		 else
		 {
			console.log(this.article)
			if (id == false)
			{
				this.$http.post("https://api.o-o-h.be/articles/add/"+this.auth,this.article)
				.then(function (response) {
					this.$router.push({path: '/admin'})
				})
			}
			else
			{
				this.$http.put("https://api.o-o-h.be/articles/edit/"+id+"/"+this.auth,this.article)
				.then(function (response) {
					this.$router.push({path: '/admin'})
				})
			}

		}
	},
	fetchArticle(id){
		this.$http.get("https://api.o-o-h.be/article/"+id+"/"+this.auth)
		.then(function (response) {
			console.log(response.body);
			this.article = response.body
		})
	},
	uploadFile(event, formField){
		this.file = event.target.files[0];
		console.log(this.file);

		const fd = new FormData();
		fd.append('file',this.file,this.file.name);

		this.$http.post("https://api.o-o-h.be/upload/"+this.auth,fd)
		.then(function (response) {
			this.article[formField] = response.body.filename;
			alert("image uploaded")
		})
	},
	deleteFile(formField)
	{
		if (confirm("Are you sure?")) {
			this.$http.delete("https://api.o-o-h.be/file/delete/"+this.article.id+"/"+formField+"/"+this.auth, )
			.then(function (response) {
				console.log("deleted file");
				this.article[formField] = "";
			})
		}	}
},
created: function () {
	this.auth = window.prompt("What do you like for breakfast?","");
	if (this.$route.params.id != undefined) {
		this.fetchArticle(this.$route.params.id)
	}
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.admin
{
	padding: 50px 5px;
	font-size:14px;
	width: 500px;
	margin: auto;
}

.form-group
{
	margin: 10px 0;
}

input[type="text"], textarea
{
	display: block;
	font-size:14px;
	border: 1px solid black;
	width: 100%;
	margin: 5px 0;
	padding: 5px;
}

textarea
{
	height: 250px;
}

textarea[name="credits"]
{
	height: 100px;
}

hr
{
	border-top:1px dashed black;
}
</style>
