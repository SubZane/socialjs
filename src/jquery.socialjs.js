(function ($) {
	// Change this to your plugin name.
	var pluginName = 'socialjs';

	/**
	 * Plugin object constructor.
	 * Implements the Revealing Module Pattern.
	 */
	function Plugin(element, options) {
		// References to DOM and jQuery versions of element.
		var el = element;
		var $el = $(element);
		var totalCount = 0;
		var twitterCount = 0;
		var facebookCount = 0;
		var linkedinCount = 0;
		var googleplusCount = 0;
		var pinterestCount = 0;
		var redditCount = 0;

		// Extend default options with those supplied by user.
		options = $.extend({}, $.fn[pluginName].defaults, options);

		/**
		 * Initialize plugin.
		 */
		function init() {
			attachEvents();
			hook('onInit');
		}

		function attachEvents() {
			$el.find('.sharebutton').each(function (i) {
				if ($(this).data('sharetype') === 'twitter') {
					attachTwitter(this);
					if (options.fetchCounts) {
						fetchTwitterCount(this);
					}
				} else if ($(this).data('sharetype') === 'facebook') {
					attachFacebook(this);
					if (options.fetchCounts) {
						fetchFacebookCount(this);
					}
				} else if ($(this).data('sharetype') === 'linkedin') {
					attachLinkedIn(this);
					if (options.fetchCounts) {
						fetchLinkedInCount(this);
					}
				} else if ($(this).data('sharetype') === 'googleplus') {
					attachGooglePlus(this);
					if (options.fetchCounts) {
						fetchGooglePlusCount(this);
					}
				} else if ($(this).data('sharetype') === 'reddit') {
					attachReddit(this);
					if (options.fetchCounts) {
						fetchRedditCount(this);
					}
				}
				afterLoad();
			});
		}

		function afterLoad() {
			$(document).ajaxStop(function () {
				hook('onLoad');
			});
		}

		function fetchPinterestCount(element) {
			$.ajax({
				url: options.PinterestAPIProvider + '?url=' + getButtonURL(element),
				async: true,
				dataType: 'text',
			}).done(function (response) {
				var count = getBaseCount(element) + parseInt(response, 10);
				$(element).find('.count').html(shortCountNumber(count));
				totalCount = totalCount + count;
				pinterestCount = count;
			});
		}

		function fetchRedditCount(element) {
			$.ajax({
				url: 'http://www.reddit.com/api/info.json?url=' + getButtonURL(element),
				async: true,
				dataType: 'json',
			}).done(function (response) {
				var count = 0;
				if( !$.isArray(response.data.children) ||  !response.data.children.length ) {
					count = getBaseCount(element);
					$(element).find('.count').html(shortCountNumber(count));
					totalCount = totalCount + count;
					redditCount = count;
				} else {
					count = getBaseCount(element) + parseInt(response.data.children[0].data.score, 10);
					$(element).find('.count').html(shortCountNumber(count));
					totalCount = totalCount + count;
					redditCount = count;
				}
			});
		}

		function fetchFacebookCount(element) {
			/*
			http://graph.facebook.com/?id=http://{URL}
			{
			"id": "http://{URL}",
			"shares": intgr/(number)
			}
			*/
			$.ajax({
				url: 'http://graph.facebook.com/?id=' + getButtonURL(element),
				async: true,
				dataType: 'json',
			}).done(function (response) {
				var count = 0;
				if (typeof response.shares !== 'undefined') {
					count = getBaseCount(element) + parseInt(response.shares, 10);
					$(element).find('.count').html(shortCountNumber(count));
					totalCount = totalCount + count;
					facebookCount = count;
				} else {
					count = getBaseCount(element);
					$(element).find('.count').html(shortCountNumber(count));
					totalCount = totalCount + count;
					facebookCount = count;
				}

			});
		}

		function fetchTwitterCount(element) {
			/*
			http://cdn.api.twitter.com/1/urls/count.json?url=http://{URL}
			{
			"count": intgr/(number)
			"url":"http:\/\/{URL}\/"
			}
			*/
			$.ajax({
				url: 'http://cdn.api.twitter.com/1/urls/count.json?url=' + getButtonURL(element) + '&callback=?',
				async: true,
				dataType: 'json',
			}).done(function (response) {
				var count = getBaseCount(element) + parseInt(response.count, 10);
				$(element).find('.count').html(shortCountNumber(count));
				totalCount = totalCount + count;
				twitterCount = count;
			});
		}

		function fetchLinkedInCount(element) {
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
				url: 'http://www.linkedin.com/countserv/count/share?url=' + getButtonURL(element) + '&callback=?',
				async: true,
				dataType: 'json',
			}).done(function (response) {
				var count = getBaseCount(element) + parseInt(response.count, 10);
				$(element).find('.count').html(shortCountNumber(count));
				totalCount = totalCount + count;
				linkedinCount = count;
			});
		}

		function fetchGooglePlusCount(element) {
			$.ajax({
				url: options.GooglePlusAPIProvider + '?url=' + getButtonURL(element),
				async: true,
				dataType: 'text',
			}).done(function (response) {
				var count = getBaseCount(element) + parseInt(response, 10);
				$(element).find('.count').html(shortCountNumber(count));
				totalCount = totalCount + count;
				googleplusCount = count;
			});
		}

		function shortCountNumber(num) {
			if (options.shortCount) {
				if (num >= 1e6){
					num = parseInt((num / 1e6).toFixed(2), 10) + 'M';
				} else if (num >= 1e3){
					num = parseInt((num / 1e3).toFixed(1), 10) + 'k';
				}
			}
			return num;
		}

		function attachFacebook(button) {
			$(button).on('click', function (e) {
				e.preventDefault();
				hook('onClick');
				var url = getButtonURL(this);
				var fullurl = 'u=' + encodeURIComponent(url);
				var encodedUrl = encodeURIComponent(url);
				window.facebook = window.facebook || {};
				window.facebook.shareWin = window.open('https://www.facebook.com/sharer/sharer.php?' + fullurl, '', getWindowSizePosition());
				return false;
			});
		}

		function attachLinkedIn(button) {
			$(button).on('click', function (e) {
				e.preventDefault();
				hook('onClick');
				var original_referer = getButtonReferer(this);
				var url = getButtonURL(this);
				var fullurl = 'original_referer=' + encodeURIComponent(original_referer) + '&url=' + encodeURIComponent(url);
				var encodedUrl = encodeURIComponent(url);
				window.GooglePlus = window.GooglePlus || {};
				window.GooglePlus.shareWin = window.open('https://www.linkedin.com/cws/share?' + fullurl + '&isFramed=true', '', getWindowSizePosition());
				return false;
			});
		}

		function attachReddit(button) {
			$(button).on('click', function (e) {
				e.preventDefault();
				hook('onClick');
				var url = getButtonURL(this);
				var fullurl = 'url=' + encodeURIComponent(url);
				var encodedUrl = encodeURIComponent(url);
				window.Reddit = window.Reddit || {};
				window.Reddit.shareWin = window.open('http://www.reddit.com/submit?' + fullurl, '', getWindowSizePosition());
				return false;
			});
		}

		function attachGooglePlus(button) {
			$(button).on('click', function (e) {
				e.preventDefault();
				hook('onClick');
				var text = getButtonText(this);
				var url = getButtonURL(this);
				var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
				var encodedUrl = encodeURIComponent(url);
				window.GooglePlus = window.GooglePlus || {};
				window.GooglePlus.shareWin = window.open('https://plus.google.com/share?' + fullurl, '', getWindowSizePosition());
				return false;
			});
		}

		function attachTwitter(button) {
			$(button).on('click', function (e) {
				e.preventDefault();
				hook('onClick');
				var text = getButtonText(this);
				var url = getButtonURL(this);
				var via = getButtonVia(this);
				var related = getButtonRelated(this);
				var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) + '&via=' + via + '&related=' + related;
				var encodedUrl = encodeURIComponent(url);
				window.Twitter = window.Twitter || {};
				window.Twitter.shareWin = window.open('https://twitter.com/intent/tweet?' + fullurl, '', getWindowSizePosition());
				return false;
			});
		}

		function getButtonVia(element) {
			if (typeof $(element).data('via') !== 'undefined') {
				return $(element).data('via');
			} else {
				return '';
			}
		}

		function getButtonText(element) {
			if (typeof $(element).data('text') !== 'undefined') {
				return $(element).data('text');
			} else {
				return '';
			}
		}

		function getButtonRelated(element) {
			if (typeof $(element).data('related') !== 'undefined') {
				return $(element).data('related');
			} else {
				return '';
			}
		}

		function getButtonURL(element) {
			if (typeof $(element).data('url') !== 'undefined') {
				return $(element).data('url');
			} else {
				return document.URL;
			}
		}

		function getButtonReferer(element) {
			if (typeof $(element).data('referer') !== 'undefined') {
				return $(element).data('referer');
			} else {
				return '';
			}
		}

		function getBaseCount(element) {
			if (typeof $(element).data('basecount') !== 'undefined') {
				return $(element).data('basecount');
			} else {
				return 0;
			}
		}

		function getWindowSizePosition() {
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
			return 'left=' + H + ',top=' + G + ',width=' + D + ',height=' + A + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1';
		}

		function getTotalCount() {
			return totalCount;
		}

		function getFacebookCount() {
			return facebookCount;
		}

		function getTwitterCount() {
			return twitterCount;
		}

		function getLinkedinCount() {
			return linkedinCount;
		}

		function getGooglePlusCount() {
			return googleplusCount;
		}

		function getRedditCount() {
			return redditCount;
		}

		/**
		 * Get/set a plugin option.
		 * Get usage: $('#el').socialjs('option', 'key');
		 * Set usage: $('#el').socialjs('option', 'key', value);
		 */
		function option(key, val) {
			if (val) {
				options[key] = val;
			} else {
				return options[key];
			}
		}

		/**
		 * Destroy plugin.
		 * Usage: $('#el').socialjs('destroy');
		 */
		function destroy() {
			// Iterate over each matching element.
			$el.each(function () {
				var el = this;
				var $el = $(this);

				// Add code to restore the element to its original state...

				hook('onDestroy');
				// Remove Plugin instance from the element.
				$el.removeData('plugin_' + pluginName);
			});
		}

		/**
		 * Callback hooks.
		 * Usage: In the defaults object specify a callback function:
		 * hookName: function() {}
		 * Then somewhere in the plugin trigger the callback:
		 * hook('hookName');
		 */
		function hook(hookName) {
			if (options[hookName] !== undefined) {
				// Call the user defined function.
				// Scope is set to the jQuery element we are operating on.
				options[hookName].call(el);
			}
		}

		// Initialize the plugin instance.
		init();

		// Expose methods of Plugin we wish to be public.
		return {
			option: option,
			destroy: destroy,
			getTotalCount: getTotalCount,
			getFacebookCount: getFacebookCount,
			getGooglePlusCount: getGooglePlusCount,
			getLinkedinCount: getLinkedinCount,
			getTwitterCount: getTwitterCount,
			getRedditCount: getRedditCount
		};
	}

	/**
	 * Plugin definition.
	 */
	$.fn[pluginName] = function (options) {
		// If the first parameter is a string, treat this as a call to
		// a public method.
		if (typeof arguments[0] === 'string') {
			var methodName = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			var returnVal;
			this.each(function () {
				// Check that the element has a plugin instance, and that
				// the requested public method exists.
				if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
					// Call the method of the Plugin instance, and Pass it
					// the supplied arguments.
					returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
				} else {
					throw new Error('Method ' + methodName + ' does not exist on jQuery.' + pluginName);
				}
			});
			if (returnVal !== undefined) {
				// If the method returned a value, return the value.
				return returnVal;
			} else {
				// Otherwise, returning 'this' preserves chainability.
				return this;
			}
			// If the first parameter is an object (options), or was omitted,
			// instantiate a new instance of the plugin.
		} else if (typeof options === 'object' || !options) {
			return this.each(function () {
				// Only allow the plugin to be instantiated once.
				if (!$.data(this, 'plugin_' + pluginName)) {
					// Pass options to Plugin constructor, and store Plugin
					// instance in the elements jQuery data object.
					$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
				}
			});
		}
	};

	// Default plugin options.
	// Options can be overwritten when initializing plugin, by
	// passing an object literal, or after initialization:
	// $('#el').socialjs('option', 'key', value);
	$.fn[pluginName].defaults = {
		fetchCounts: true,
		GooglePlusAPIProvider: 'backend/GooglePlusCall.php',
		shortCount: true,
		onInit: function () {},
		onLoad: function () {},
		onDestroy: function () {},
		onClick: function(){},
	};

})(jQuery);
