import App from "@/App.vue";
import Vue from "vue";
import Router from "vue-router";

Vue.use(Router)

export default new Router({
	mode: "history", routes: [{ path: "/:collectionId?", component: App, name: "App" }]
})
