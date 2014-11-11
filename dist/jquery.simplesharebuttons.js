/*! Simple Share Buttons - v0.3.0 - 2014-11-11
* https://github.com/SubZane/simplesharebuttons
* Copyright (c) 2014 Andreas Norman; Licensed MIT */
var SimpleShareButtons = {
	options: {
		container: '.simplesharebuttons',
		fetchCounts: true,
		GooglePlusAPIProvider: 'backend/GooglePlusCall.php'
	},

	init: function (options) {
		// Mix in the passed-in options with the default options
		this.options = $.extend({}, this.options, options);

		// Save the element reference, both as a jQuery
		// reference and a normal reference
		this.elem = this.options.container;
		this.$elem = $(this.options.container);

		this.attachEvents();

	},

	attachEvents: function () {
		var _self = this;
		var count = 0;
		this.$elem.find('.sharebutton').each(function (i) {
			if ($(this).data('sharetype') === 'twitter') {
				_self.attachTwitter(this);
				if (_self.options.fetchCounts) {
					_self.fetchTwitterCount($(this).data('url'));
					$('.twitter-socialcount').html(count);
				}
			} else if ($(this).data('sharetype') === 'facebook') {
				_self.attachFacebook(this);
				if (_self.options.fetchCounts) {
					_self.fetchFacebookCount($(this).data('url'));
				}
			} else if ($(this).data('sharetype') === 'linkedin') {
				_self.attachLinkedIn(this);
				if (_self.options.fetchCounts) {
					_self.fetchLinkedInCount($(this).data('url'));
				}
			} else if ($(this).data('sharetype') === 'googleplus') {
				_self.attachGooglePlus(this);
				if (_self.options.fetchCounts) {
					_self.fetchGooglePlusCount($(this).data('url'));
				}
			}
		});
	},

	fetchFacebookCount: function (url) {
		/*
		http://graph.facebook.com/?id=http://{URL}
		{
		"id": "http://{URL}",
		"shares": intgr/(number)
		}
		*/
		$.ajax({
			url: 'http://graph.facebook.com/?id=' + url,
			async: true,
			dataType: 'json',
		}).done(function (response) {
			if (typeof response.shares !== 'undefined') {
				$('.facebook-socialcount').html(response.shares);
			} else {
				$('.facebook-socialcount').html(0);
			}

		});
	},

	fetchTwitterCount: function (url) {
		/*
		http://cdn.api.twitter.com/1/urls/count.json?url=http://{URL}
		{
		"count": intgr/(number)
		"url":"http:\/\/{URL}\/"
		}
		*/
		$.ajax({
			url: 'http://cdn.api.twitter.com/1/urls/count.json?url=' + url + '&callback=?',
			async: true,
			dataType: 'json',
		}).done(function (response) {
			$('.twitter-socialcount').html(response.count);
		});
	},

	fetchLinkedInCount: function (url) {
		/*
		http://www.linkedin.com/countserv/count/share?url=http://{URL&format=json
		{
		"count": intgr/(number),
		"fCnt": "intgr/(number)",
		"fCntPlusOne":"intgr/(number) + 1", // increased by one
		"url":"http:\/\/{URL}"
		}
		*/
		$.ajax({
			url: 'http://www.linkedin.com/countserv/count/share?url=' + url + '&callback=?',
			async: true,
			dataType: 'json',
		}).done(function (response) {
			$('.linkedin-socialcount').html(response.count);
		});
	},

	fetchGooglePlusCount: function (url) {
		$.ajax({
			url: this.options.GooglePlusAPIProvider +'?url=' + url,
			async: true,
			dataType: 'text',
		}).done(function (response) {
			$('.googleplus-socialcount').html(response);
		});
	},

	attachFacebook: function (button) {
		$(button).on('click', function (e) {
			e.preventDefault();
			var url = $(this).attr('data-url');
			var fullurl = 'u=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.facebook = window.facebook || {};
			var D = 550,
				A = 335,
				C = screen.height,
				B = screen.width,
				H = Math.round((B / 2) - (D / 2)),
				G = 0,
				F = document;
			if (C > A) {
				G = Math.round((C / 2) - (A / 2));
			}
			window.facebook.shareWin = window.open('https://www.facebook.com/sharer/sharer.php?' + fullurl, '', 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
			return false;
		});
	},

	attachLinkedIn: function (button) {
		$(button).on('click', function (e) {
			e.preventDefault();
			var original_referer = $(this).attr('data-referer');
			var url = $(this).attr('data-url');
			var fullurl = 'original_referer=' + encodeURIComponent(original_referer) + '&url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.GooglePlus = window.GooglePlus || {};
			var D = 550,
				A = 335,
				C = screen.height,
				B = screen.width,
				H = Math.round((B / 2) - (D / 2)),
				G = 0,
				F = document;
			if (C > A) {
				G = Math.round((C / 2) - (A / 2));
			}
			window.GooglePlus.shareWin = window.open('https://www.linkedin.com/cws/share?' + fullurl + '&isFramed=true', '', 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
			return false;
		});
	},

	attachReddit: function (button) {
		$(button).on('click', function (e) {
			e.preventDefault();
			var url = $(this).attr('data-url');
			var fullurl = 'url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.Reddit = window.Reddit || {};
			var D = 550,
				A = 335,
				C = screen.height,
				B = screen.width,
				H = Math.round((B / 2) - (D / 2)),
				G = 0,
				F = document;
			if (C > A) {
				G = Math.round((C / 2) - (A / 2));
			}
			window.Reddit.shareWin = window.open('http://www.reddit.com/submit?' + fullurl, '', 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
			return false;
		});
	},

	attachGooglePlus: function (button) {
		$(button).on('click', function (e) {
			e.preventDefault();
			var text = $(this).attr('data-text');
			var url = $(this).attr('data-url');
			var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.GooglePlus = window.GooglePlus || {};
			var D = 550,
				A = 335,
				C = screen.height,
				B = screen.width,
				H = Math.round((B / 2) - (D / 2)),
				G = 0,
				F = document;
			if (C > A) {
				G = Math.round((C / 2) - (A / 2));
			}
			window.GooglePlus.shareWin = window.open('https://plus.google.com/share?' + fullurl, '', 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
			return false;
		});
	},

	attachTwitter: function (button) {
		$(button).on('click', function (e) {
			e.preventDefault();
			var text = $(this).attr('data-text');
			var url = $(this).attr('data-url');
			var via = $(this).attr('data-via');
			var related = $(this).attr('data-related');
			var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) + '&via=' + via + '&related=' + related;
			var encodedUrl = encodeURIComponent(url);
			window.Twitter = window.Twitter || {};
			var D = 550,
				A = 335,
				C = screen.height,
				B = screen.width,
				H = Math.round((B / 2) - (D / 2)),
				G = 0,
				F = document;
			if (C > A) {
				G = Math.round((C / 2) - (A / 2));
			}
			window.Twitter.shareWin = window.open('https://twitter.com/intent/tweet?' + fullurl, '', 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
			return false;
		});
	}
};
