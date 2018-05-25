(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.socialjs = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//

	var socialjs = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings;
	var el;

  var totalCount = 0;
  var twitterCount = 0;
  var facebookCount = 0;
  var linkedinCount = 0;
  var googleplusCount = 0;
  var pinterestCount = 0;
  var redditCount = 0;

	// Default settings
	var defaults = {
		container: '.socialjs',
		fetchCounts: true,
		shortCount: true,
		https: false,
		urls: {
			GooglePlus: 'backend/GooglePlusCall.php',
			Pinterest: 'backend/PinterestCall.php',
			Facebook: 'http://graph.facebook.com/',
			Linkedin: 'http://www.linkedin.com/countserv/count/share',
			Reddit: 'http://www.reddit.com/api/info.json',
		},
		onInit: function () {},
		OnAttachEvents: function () {},
		onDestroy: function () {},
		onClick: function () {}
	};

	//
	// Methods
	//

	var attachEvents = function () {
    Array.prototype.forEach.call(el, function (el, i) {
				
    var sharebuttons = el.querySelectorAll('.sharebutton');

    forEach(sharebuttons, function (shareButton, value) {
      if (shareButton.getAttribute('data-sharetype') === 'twitter') {
        attachTwitter(shareButton);
        if (settings.fetchCounts) {
          fetchTwitterCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'facebook') {
        attachFacebook(shareButton);
        if (settings.fetchCounts) {
          fetchFacebookCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'linkedin') {
        attachLinkedIn(shareButton);
        if (settings.fetchCounts) {
          fetchLinkedInCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'googleplus') {
        attachGooglePlus(shareButton);
        if (settings.fetchCounts) {
          fetchGooglePlusCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'reddit') {
        attachReddit(shareButton);
        if (settings.fetchCounts) {
          fetchRedditCount(shareButton);
        }
      }
    });
    });
		hook('OnAttachEvents');
	};

	/*
	This no longer works due to the face that Twitter removed this feature. It will remain here for historic reasons only.
	See: https://blog.twitter.com/2015/hard-decisions-for-a-sustainable-platform
	*/
	var fetchTwitterCount = function (element) {
		/*
		http://cdn.api.twitter.com/1/urls/count.json?url=http://{URL}
		{
		"count": intgr/(number)
		"url":"http:\/\/{URL}\/"
		}
		*/
		var count = getDataAttribute(element, 'basecount');
		element.querySelector('.count').innerHTML = shortCountNumber(count);
		totalCount = totalCount + count;
		twitterCount = count;
	};

  /*
  http://graph.facebook.com/?id=http://{URL}
  {
  "id": "http://{URL}",
  "shares": intgr/(number)
  }
  */
  var fetchFacebookCount = function (element) {
    var jsonURL = settings.urls.Facebook + '?id=' + getUrl(element);
    var request = new XMLHttpRequest();
    request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
        var count = 0;
        var response = JSON.parse(request.response);

        if (typeof response.shares !== 'undefined') {
          count = parseInt(getDataAttribute(element, 'basecount')) + parseInt(response.shares, 10);
          element.querySelector('.count').innerHTML = shortCountNumber(count);
          totalCount = totalCount + count;
          facebookCount = count;
        } else {
          count = parseInt(getDataAttribute(element, 'basecount'));
          element.querySelector('.count').innerHTML = shortCountNumber(count);
          totalCount = totalCount + count;
          facebookCount = count;
        }
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
		};
		request.send();
  };


  /*
  http://www.linkedin.com/countserv/count/share?url=http://{URL&format=json
  {
  "count": intgr/(number),
  "fCnt": "intgr/(number)",
  "fCntPlusOne":"intgr/(number) + 1", // increased by one
  "url":"http:\/\/{URL}"
  }
  */
  var fetchLinkedInCount = function (element) {
		var jsonURL = settings.urls.Linkedin + '?url=' + getUrl(element);
		jsonp(jsonURL, function(data) {
			 var count = parseInt(getDataAttribute(element, 'basecount')) + parseInt(data.count, 10);
			 element.querySelector('.count').innerHTML = shortCountNumber(count);
			 totalCount = totalCount + count;
			 linkedinCount = count;
		});
  };

  var fetchRedditCount = function (element) {
    var jsonURL = settings.urls.Reddit + '?url=' + getUrl(element);
		var request = new XMLHttpRequest();
		request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				var response = JSON.parse(request.response);
				// Success!
				var count = 0;
				if( !Array.isArray(response.data.children) ||  !response.data.children.length ) {
					count = parseInt(getDataAttribute(element, 'basecount'));
					element.querySelector('.count').innerHTML = shortCountNumber(count);
					totalCount = totalCount + count;
					redditCount = count;
				} else {
					count = parseInt(getDataAttribute(element, 'basecount')) + parseInt(response.data.children[0].data.score, 10);
					element.querySelector('.count').innerHTML = shortCountNumber(count);
					totalCount = totalCount + count;
					redditCount = count;
				}
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
		};
		request.send();
  };

  var fetchPinterestCount = function (element) {
    var jsonURL = settings.Pinterest + '?url=' + getUrl(element);
		var request = new XMLHttpRequest();
		request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				var response = JSON.parse(request.response);
				// Success!
        var count = parseInt(getDataAttribute(element, 'basecount')) + parseInt(response, 10);
        element.querySelector('.count').innerHTML = shortCountNumber(count);
        totalCount = totalCount + count;
        pinterestCount = count;
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
		};
		request.send();
  };

	var fetchGooglePlusCount = function (element) {
		var jsonURL = settings.urls.GooglePlus + '?url=' + getUrl(element);
		var request = new XMLHttpRequest();
		request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				var response = JSON.parse(request.response);
				// Success!
        var count = parseInt(getDataAttribute(element, 'basecount')) + parseInt(response, 10);
        element.querySelector('.count').innerHTML = shortCountNumber(count);
        totalCount = totalCount + count;
        googleplusCount = count;
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
		};
		request.send();
	};

	var attachFacebook = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var url = getUrl(button);
			var fullurl = 'u=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.facebook = window.facebook || {};
			window.facebook.shareWin = window.open('https://www.facebook.com/sharer/sharer.php?' + fullurl, '', getWindowSizePosition());
			return false;
		});
	};

	var attachLinkedIn = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var original_referer = (button.hasAttribute('data-referer') ? button.getAttribute('data-referer') : '');
			var url = getUrl(button);
			var fullurl = 'original_referer=' + encodeURIComponent(original_referer) + '&url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.GooglePlus = window.GooglePlus || {};
			window.GooglePlus.shareWin = window.open('https://www.linkedin.com/cws/share?' + fullurl + '&isFramed=true', '', getWindowSizePosition());
			return false;
		});
	};

	var attachReddit = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var url = getUrl(button);
			var fullurl = 'url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.Reddit = window.Reddit || {};
			window.Reddit.shareWin = window.open('https://www.reddit.com/submit?' + fullurl, '', getWindowSizePosition());
			return false;
		});
	};

	var attachGooglePlus = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var text = (button.hasAttribute('data-text') ? button.getAttribute('data-text') : '');
			var url = getUrl(button);
			var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.GooglePlus = window.GooglePlus || {};
			window.GooglePlus.shareWin = window.open('https://plus.google.com/share?' + fullurl, '', getWindowSizePosition());
			return false;
		});
	};

	var attachTwitter = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var text = (button.hasAttribute('data-text') ? button.getAttribute('data-text') : '');
			var url = getUrl(button);
			var via = (button.hasAttribute('data-via') ? button.getAttribute('data-via') : '');
			var related = (button.hasAttribute('related') ? button.getAttribute('related') : '');
			var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) + '&via=' + via + '&related=' + related;
			var encodedUrl = encodeURIComponent(url);
			window.Twitter = window.Twitter || {};
			window.Twitter.shareWin = window.open('https://twitter.com/intent/tweet?' + fullurl, '', getWindowSizePosition());
			return false;
		});
	};

  var shortCountNumber = function (num) {
    if (settings.shortCount) {
      if (num >= 1e6){
        num = parseInt((num / 1e6).toFixed(2), 10) + 'M';
      } else if (num >= 1e3){
        num = parseInt((num / 1e3).toFixed(1), 10) + 'k';
      }
    }
    return num;
  };

	var getUrl = function (element) {
		var attributeValue = element.getAttribute('data-url');
		if (typeof attributeValue !== 'undefined' && attributeValue !== null && attributeValue !== '') {
      return attributeValue;
    } else {
			return window.location.href;
    }
	};

  var getDataAttribute = function (element, attributeName) {
    var attributeValue = element.getAttribute('data-' + attributeName);
    if (typeof attributeValue !== 'undefined') {
      return attributeValue;
    } else {
      return '';
    }
  };

	var handleError = function () {

	};

	var jsonp = function (url, callback) {
		var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
		window[callbackName] = function(data) {
			delete window[callbackName];
			document.body.removeChild(script);
			callback(data);
		};

		var script = document.createElement('script');
		script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
		document.body.appendChild(script);
	};

  var getWindowSizePosition = function () {
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
  };

	var hasClass = function (element, classname) {
		if (typeof element.classList !== 'undefined' && element.classList.contains(classname)) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Callback hooks.
	 * Usage: In the defaults object specify a callback function:
	 * hookName: function() {}
	 * Then somewhere in the plugin trigger the callback:
	 * hook('hookName');
	 */
	var hook = function (hookName) {
		if (settings[hookName] !== undefined) {
			// Call the user defined function.
			// Scope is set to the jQuery element we are operating on.
			settings[hookName].call(el);
		}
	};

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function (defaults, options) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	socialjs.destroy = function () {

		// If plugin isn't already initialized, stop
		if (!settings) {
			return;
		}

		// Remove init class for conditional CSS
		document.documentElement.classList.remove(settings.initClass);

		// @todo Undo any other init functions...

		// Remove event listeners
		document.removeEventListener('click', eventHandler, false);

		// Reset variables
		settings = null;
		hook('onDestroy');
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	socialjs.init = function (options) {
		// feature test
		if (!supports) {
			return;
		}

		if(options.https === true) {
			defaults.urls.Facebook = 'https://graph.facebook.com/';
			defaults.urls.Linkedin = 'https://www.linkedin.com/countserv/count/share';
			defaults.urls.Reddit = 'https://www.reddit.com/api/info.json';
		}

		if (document.location.hostname === 'localhost') {
			console.warn('SocialJS will not work properly when run on localhost. The URL must be accessible from the outside.');
		}

		// Destroy any existing initializations
		socialjs.destroy();

		// Merge user options with defaults
		settings = extend(defaults, options || {});

		el = document.querySelectorAll(settings.container);

		attachEvents();

		hook('onInit');
	};

	//
	// Public APIs
	//

	socialjs.getCount = {
		Total: function () {
			return totalCount;
		},
		Facebook: function () {
			return facebookCount;
		},
		Linkedin: function () {
			return linkedinCount;
		},
		GooglePlus: function () {
			return googleplusCount;
		},
		Reddit: function () {
			return redditCount;
		}
	};

	return socialjs;
});
