<template>
	<div class="articles"
	:class="device"
	v-on:wheel="scrollBuffer"
	v-hammer:swipe="scrollPage"
	v-hammer:tap="fullscreen"
	v-hammer:pinch="fullscreen">

		<div class="menubar">
			<a class="logo" v-on:click="goToPage('0-1')">ooh</a>
			<a v-on:click="goToPage('16-17')">About</a>
			<a v-on:click="goToPage(( (totalPages-1) * 2)+'-'+( (totalPages-1) * 2 + 1) )">All looks</a>
			<div class="pageNumbers">[{{currentPage * 2}}-{{currentPage * 2 + 1}}] | <a v-on:click="goToPage(((totalPages) * 2)+'-'+( (totalPages) * 2 + 1) )">{{totalPages * 2 + 1}}</a></div>
		</div>

		<div
		class="container"
		v-for="position in positions"
		:class="{forward: position == 'left', backward: position == 'right', peakNext: peakStatus.next, peakPrevious: peakStatus.previous, iDidntDoIt: iDidntDoIt}"
		:style="position == 'left' ? 'transform: translateY(-'+(100 * ( currentPage ) ) +'vh)' : 'transform: translateY(-'+(100 * ( totalPages - currentPage ) ) +'vh)' ">
			<div
			class="section"
			v-for="article in articles[position]"
			:style="article.background_image ? {backgroundImage: 'url(https://api.o-o-h.be/uploads/' + article.background_image + ')' } : {}"
			:id="'i'+article.id"
			:class="{cover: article.background_image_cover, whiteText: article.white_text, overview:article.overview, right: position == 'right', left: position == 'left'}">

				<div class="videoContainer" v-if="article.video_forward && article.video_backward">
					<video class="forward" v-show="videoDirection[position] == 'forward'" muted preload="auto">
						<source :src="'https://api.o-o-h.be/uploads/' + article.video_forward" type="video/mp4">
					</video>
					<video class="backward" v-show="videoDirection[position] == 'backward'" muted preload="auto">
						<source :src="'https://api.o-o-h.be/uploads/' + article.video_backward" type="video/mp4">
					</video>
					<div class="hoverBox" v-on:mouseenter="playVideo($event,position)" v-on:mouseleave="playVideo($event,position)"></div>
				</div>

				<div class="article" v-html="article.article"></div>
				<div class="credits" v-html="article.credits"></div>

				<div
				class="overviewItem"
				v-for="overviewItem in article.overview"
				v-on:click="goToPage(overviewItem.page)"
				:style="{backgroundImage: 'url(https://api.o-o-h.be/uploads/' + overviewItem.background_image + ')' }">
					<div class="overviewBack">
						<div class="overviewPage">
							{{overviewItem.page}}
						</div>
					</div>
				</div>

				<!-- <div class="hoverBox next" v-on:click="goToPage('next', position)" v-on:mouseenter="changePeakStatus($event, 'next')" v-on:mouseleave="changePeakStatus($event, 'next')"></div> -->
				<!-- <div class="hoverBox previous" v-on:click="goToPage('previous', position)" v-on:mouseenter="changePeakStatus($event, 'previous')" v-on:mouseleave="changePeakStatus($event, 'previous')"></div> -->
			</div>
		</div>

		<div class="fold" :class="{show: pageProperties.fold}"></div>
		<!-- <div class="credits left" :class="{show: pageProperties.creditsLeft.length > 0}" v-html="pageProperties.creditsLeft"></div> -->
		<!-- <div class="credits right" :class="{show: pageProperties.creditsRight.length > 0}" v-html="pageProperties.creditsRight"></div> -->
		<!-- <div class="turnScreen"></div> -->
		<div class="scrollDown" v-if="iDidntDoIt">hey, why don't you try scrolling?</div>
		<div class="logoClickBox" v-if="currentPage == 0" v-on:click="goToPage('2-3')"></div>
	</div>

</template>

<script>
	import screenfull from 'screenfull'
	// import SuperGif from 'libgif'

	export default {
		name: 'Articles',
		data () {
			return {
				articles: {left: [], right: []},
				positions: ["left", "right"],
				idToPageMap: {left: [], right: []},
				overviewArticles: {left: [], right: []},
				// deviceWidth: window.visualViewport.width || window.innerWidth, // werkt niet op iOS
				currentPage: 0,
				totalPages: null,
				peakStatus: {next: false, previous: false},
				iDidntDoIt: true,
				scrollBufferPrevDelta: null,
				scrollBufferVal: null,
				scrollBufferThreshold: 225,
				pageProperties: {
					fold: false,
					creditsLeft: '',
					creditsRight: ''
				},
				scrollToTheNextPagePlease: true,
				device: {
					isMobile:false,
					isChrome:false,
					isFullscreen:false,
				},
				videoDirection: {left: "backward", right: "backward"},
				// lockOrientationUniversal: window.screen.lockOrientation || window.screen.mozLockOrientation || window.screen.msLockOrientation
			}
		},
		methods: {
			fetchArticles(position)
			{
				this.$http.get("https://api.o-o-h.be/articles/"+ position.substring(0, 1))
				.then(function (response)
				{
					if (position == "left")
					{
						this.articles[position] = response.body
					}
					else
					{
						this.articles[position] = response.body.reverse()
					}

					// this.initializePage()

					if (this.articles.left.length > 0 && this.articles.right.length > 0)
					{
						this.idToPageMapping()
						this.generateOverview()
					}
				})
			},
			parsePage(page)
			{
				return page.split('-')[0]
			},
			initializePage()
			{
				// checken of het deelbaar is door 2 en anders min één doen.
				var routerPage = this.parsePage(this.$route.params.page)

				if (routerPage % 2 == 0)
				{
					this.currentPage = (routerPage / 2)
				}
				else if (isNaN(routerPage))
				{
					this.$router.replace({ path: `/page/0-1 ` })
				}
				else
				{
					this.$router.replace({ path: `/page/${routerPage - 1 }-${routerPage} ` })
				}

				this.currentPage = (routerPage / 2)
				this.totalPages = this.articles.right.length - 1


				//check if fold id needed
				this.pageProperties.fold = this.articles['left'][this.currentPage].fold || this.articles['right'][this.currentPage].fold || false

				// console.log(lockOrientationUniversal)
			},
			idToPageMapping()
			{
				this.totalPages = this.articles.right.length - 1

				for(var i = 0 ; i < this.articles.left.length; i++)
				{
					this.idToPageMap[this.articles.left[i].id] = i*2 + '-' + (i*2+1);
					this.idToPageMap[this.articles.right[i].id] = (this.totalPages-i)*2 + '-' + ((this.totalPages-i)*2+1);
				}
			},
			generateOverview()
			{
				this.$http.get("https://api.o-o-h.be/overview")
				.then(function (response)
				{

					for(var i = 0 ; i < response.body.length; i++)
					{


						var tempArticleSnippet = {
							background_image: response.body[i]['background_image'],
							page:this.idToPageMap[response.body[i]['id']]
						}


						// "<div v-on='overviewClick' class='overviewImage'><img src='https://api.o-o-h.be/uploads/"+response.body[i]['background_image']+"'></div>"

						// console.log(i)

						if (i < 2 || (i > 3 && i < 6)) // makes left left right right left left right right
						{
							this.overviewArticles.left.push(tempArticleSnippet)
						}
						else
						{
							this.overviewArticles.right.push(tempArticleSnippet)
						}
					}

					this.articles.left.splice(this.articles.left.length - 1, 0, {overview: this.overviewArticles.left, fold:"", id:'overview'+i})
					this.articles.right.splice(1, 0, {overview: this.overviewArticles.right, fold:"", id:'overview'+i})

					this.initializePage()
				})
			},
			scrollBuffer(event)
			{
				console.log(event.deltaY)
				if ( (this.scrollBufferPrevDelta < 0 && event.deltaY > 0) || (this.scrollBufferPrevDelta > 0 && event.deltaY < 0) )
				{
					this.scrollBufferVal = 0
				}

				if (this.scrollToTheNextPagePlease && Math.abs(event.deltaY) > 75 )
				{
					this.scrollBufferVal += event.deltaY
					// console.log(event.deltaY, event.wheelDeltaY, this.scrollBufferVal)
				}

				if (this.scrollToTheNextPagePlease && ( this.device.isFirefox && event.deltaY % 3 == 0  ) )
				{
					this.scrollBufferVal += 75
					// console.log(event.deltaY, event.wheelDeltaY, this.scrollBufferVal)
				}

				if (Math.abs(this.scrollBufferVal) > this.scrollBufferThreshold)
				{
					console.log('===========scroll 1 page=============')
					this.scrollBufferVal = 0
					this.scrollPage(event)
				}
			},
			scrollPage(event)
			{
				console.log(event.deltaY, event.wheelDeltaY, this.scrollToTheNextPagePlease)

				if (this.scrollToTheNextPagePlease)
				{
					//initiate the scroll
					this.currentPage = this.determinePage(event, this.currentPage)

					this.afterScroll()
				}
			},
			determinePage(event, currentPage)
			{
				var totalArticles = this.articles.left.length

				if ( ( event.type == "wheel" && event.deltaY > 0)  || (event.type == "swipe" && event.deltaY < 0) || event.keyCode == 38)
					var wheelDirection = -1;
				if ( ( event.type == "wheel" && event.deltaY < 0)  || (event.type == "swipe" && event.deltaY > 0) || event.keyCode == 40)
					var wheelDirection = 1;

				var nextPage = currentPage - (wheelDirection);

				if (0 <= nextPage && Math.abs(nextPage) < Math.abs(totalArticles))
				{
					return nextPage
				}
				else
				{
					return currentPage
				}

			},
			goToPage(page, position)
			{
				var position = position || false;
				console.log(page, position);
				if (position != false)
				{
					if ( (page == "previous" && position == "right") || (page == "previous" && position == "left") )
					{
						this.goToPage((this.currentPage + 1) * 2 +'-'+ (this.currentPage + 2 ) * 2);
					}
					 if ( (page == "next" && position == "right") || (page == "next" && position == "left") )
					{
						this.goToPage((this.currentPage - 1) * 2 +'-'+ (this.currentPage * 2));
					}
				}
				else
				{
					this.currentPage = this.parsePage(page) / 2
					this.$router.replace({ path: `/page/` + page })
					this.afterScroll()
				}
			},
			afterScroll()
			{
				//change on load properties
				this.iDidntDoIt = false

				//check if fold is needed
				this.pageProperties.fold = this.articles['left'][this.currentPage].fold || this.articles['right'][this.currentPage].fold || false

				//check if I can play a video in the new page
				if (this.articles['left'][this.currentPage].video_forward)
				{
					this.pageProperties.videoId = this.articles['left'][this.currentPage].id
					var position = 'left';
				}
				else if (this.articles['right'][this.totalPages - this.currentPage].video_forward)
				{
					this.pageProperties.videoId = this.articles['right'][this.totalPages - this.currentPage].id
					var position = 'right'
				}
				else
				{
					this.pageProperties.videoId = false;
				}

				if (this.pageProperties.videoId)
				{
					this.videoDirection[position] = "backward"
					setTimeout(() => this.$el.querySelector("#i"+this.pageProperties.videoId+" video.backward").play() , 250)
				}

				//peak must be disabled
				this.peakStatus.previous = false
				this.peakStatus.next = false

				//update url
				this.$router.replace({ path: `/page/${this.currentPage * 2}-${this.currentPage * 2 + 1} ` })

				//Wait for the animation to be done
				this.scrollToTheNextPagePlease = false
				setTimeout(() => this.scrollToTheNextPagePlease = true , 500)
			},
			changePeakStatus(event, direction)
			{
				if (event.type == "mouseenter")
				{
					this.peakStatus[direction] = true
				}
				else
				{
					this.peakStatus[direction] = false
				}
			},
			fullscreen(event)
			{
				//disable long animation
				this.iDidntDoIt = false

				// console.log(event)
				if (event.type == "tap")
				{
					// console.log(screenfull.enabled, event.tapCount, this.device.isMobile)
					if (screenfull.enabled && event.tapCount > 1 && this.device.isMobile)
					{
						screenfull.toggle()
						this.device.isFullscreen = this.device.isFullscreen?false:true
					}
				}

				// if (event.type == "pinch")
				// {
				// 	// console.log(screenfull.enabled, screenfull.isFullscreen, event.additionalEvent, this.device.isMobile)

				// 	if (screenfull.enabled && !screenfull.isFullscreen && event.additionalEvent == "pinchout" && this.device.isMobile)
				// 	{
				// 		screenfull.toggle()
				// 		this.device.isFullscreen = true
				// 	}

				// 	if (screenfull.enabled && screenfull.isFullscreen && event.additionalEvent == "pinchin" && this.device.isMobile)
				// 	{
				// 		screenfull.toggle()
				// 		this.device.isFullscreen = false
				// 	}
				// }

				// console.log(screenfull.isFullscreen)

				// this.device.isFullscreen = screenfull.isFullscreen

			},
			checkDevice()
			{
				if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
				{
					this.device.isMobile = true
				}

				if( /Chrome/i.test(navigator.userAgent))
				{
					this.device.isChrome = true
				}

				if( /Firefox/i.test(navigator.userAgent))
				{
					this.device.isFirefox = true
				}

				console.log(this.device)
			},
			playVideo(event, position){
				// console.log(event)

				var event = event || "";
				var parentEl = event.target.closest(".videoContainer");

				// console.log(event.target.querySelector("video"))
				if (event.type == "mouseenter")
				{
					if (parentEl.querySelector("video.backward").currentTime == 0)
					{
						parentEl.querySelector("video.backward").currentTime = parentEl.querySelector("video.backward").duration;
					}

					parentEl.querySelector("video.forward").currentTime = parentEl.querySelector("video.backward").duration - parentEl.querySelector("video.backward").currentTime
					// parentEl.querySelector("video.backward").pause()


					setTimeout(() => parentEl.querySelector("video.forward").play() , 100)
					setTimeout(() => this.videoDirection[position] = "forward" , 100)


				}
				else
				{
					parentEl.querySelector("video.backward").currentTime = parentEl.querySelector("video.forward").duration - parentEl.querySelector("video.forward").currentTime
					// parentEl.querySelector("video.forward").pause()


					setTimeout(() => parentEl.querySelector("video.backward").play() , 100)
					setTimeout(() => this.videoDirection[position] = "backward" , 100)

				}

				// console.log(this.videoDirection)
				// console.log(event.target.querySelector("video").classList)
			}
		},
		created: function () {
			this.currentPage = Math.floor(Math.random() * Math.floor(7)) + 3;
			this.fetchArticles("left")
			this.fetchArticles("right")
			this.checkDevice()

		}
	}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
