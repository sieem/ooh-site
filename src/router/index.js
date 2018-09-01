import Vue from 'vue'
import Router from 'vue-router'
import Resource from 'vue-resource'
import Articles from '@/components/Articles'
import Admin from '@/components/Admin'
import AdminOverview from '@/components/AdminOverview'
import adminUpdateArticle from '@/components/adminUpdateArticle'
import { VueHammer } from 'vue2-hammer'

Vue.use(Router)
Vue.use(Resource)
Vue.use(VueHammer)

export default new Router({
	mode: 'history',
	routes: [
	{
		path: '/',
		redirect: '/page/0-1'
	},
	// {
	// 	path: '/about',
	// 	redirect: '/page/12-13'
	// },
	{
		path: '/page/:page',
		component: Articles
	},
	{
		path: '/admin',
		component: Admin
	},
	{
		path: '/admin/overview',
		component: AdminOverview
	},
	{
		path: '/admin/article',
		component: adminUpdateArticle
	},
	{
		path: '/admin/article/:id',
		component: adminUpdateArticle
	}
	]
})
