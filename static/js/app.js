define('jquery', [], function () {
	return jQuery;
});

require.config({
	baseUrl: static_url + '/js/lib',
	//    baseUrl: '/static/js/lib',
	paths: {
		app: '../app',
		tpl: '../tpl',
		schema: '../schema',
		vendor: '../../vendor'
	},
	shim: {
		'gonrin': {
			deps: ['underscore', 'jquery', 'backbone'],
			exports: 'Gonrin'
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		}
	}
});

require(['jquery', 'gonrin', 'app/router',
		'app/bases/Nav/NavbarView',
		'text!app/bases/tpl/layout.html',
		'i18n!app/nls/app'
	],
	function ($, Gonrin, Router, Nav, layout, lang) {
		$.ajaxSetup({
			headers: {
				'content-type': 'application/json'
			}
		});

		var app = new Gonrin.Application({
			serviceURL: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port : ''),
			staticURL: static_url,
			router: new Router(),
			lang: lang,
			//layout: layout,
			initialize: function () {
				this.getRouter().registerAppRoute();
				
				//this.getCurrentUser();
				this.postLogin({});
			},
			getParameterUrl: function (parameter, url) {
				if (!url) url = window.location.href;
				var reg = new RegExp('[?&]' + parameter + '=([^&#]*)', 'i');
				var string = reg.exec(url);
				return string ? string[1] : undefined;
			},
			getCurrentUser: function () {
				var self = this;
				$.ajax({
					url: self.serviceURL + '/current_user',
					dataType: "json",
					success: function (data) {
						self.postLogin(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						self.router.navigate("login");
					}
				});
			},
			hasRole: function (role) {
				return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles != null) && gonrinApp().currentUser.roles.indexOf(role) >= 0;
			},
			postLogin: function (data) {
				var self = this;

				$('body').html(layout);
				self.currentUser = new Gonrin.User(data);
				this.$header = $('body').find(".page-header");
				this.$content = $('body').find(".content-area");
				this.$navbar = $('body').find(".page-navbar");
				var $user = self.$header.find("span.username");
				if (!data.fullname || data.fullname === "") {
					data.fullname = data.id;
				}
				self.$header.find("span.username").html(data.fullname);
				this.$toolbox = $('body').find(".tools-area");
				
				this.nav = new Nav({
					el: this.$navbar
				});
				self.nav.render();
			}
		});
		Backbone.history.start();

	});