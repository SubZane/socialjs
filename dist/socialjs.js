/*! socialjs - v1.0.0 - 2016-06-27
* https://github.com/SubZane/socialjs
* Copyright (c) 2016 Andreas Norman; Licensed MIT */
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
	var settings, eventTimeout;
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
		onInit: function () {},
		OnAttachEvents: function () {},
		onDestroy: function () {},
		onClick: function () {}
	};

	var urls = {
		GooglePlus: 'api/GooglePlusCall.php',
		Pinterest: 'api/PinterestCall.php',
		Facebook: 'http://graph.facebook.com/',
		Linkedin: 'http://www.linkedin.com/countserv/count/share',
		Reddit: 'http://www.reddit.com/api/info.json'
	};

	//
	// Methods
	//

	var attachEvents = function () {
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
		hook('OnAttachEvents');
	};

  /*
  http://graph.facebook.com/?id=http://{URL}
  {
  "id": "http://{URL}",
  "shares": intgr/(number)
  }
  */
  var fetchFacebookCount = function (element) {
    var jsonURL = urls.Facebook + '?id=' + getDataAttribute(element, 'url');
    var request = new XMLHttpRequest();
    request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
        var count = 0;
        var response = JSON.parse(request.response);

        if (typeof response.shares !== 'undefined') {
          count = getDataAttribute(element, 'basecount') + parseInt(response.shares, 10);
          element.querySelector('.count').innerHTML = shortCountNumber(count);
          totalCount = totalCount + count;
          facebookCount = count;
        } else {
          count = getDataAttribute(element, 'basecount');
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
    var jsonURL = urls.Linkedin + '?url=' + getDataAttribute(element, 'url') + '&callback=?';
    var request = new XMLHttpRequest();
    request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
        var response = JSON.parse(request.response);
        var count = getDataAttribute(element, 'basecount') + parseInt(response.shares, 10);
        element.querySelector('.count').innerHTML = shortCountNumber(count);
        totalCount = totalCount + count;
        linkedinCount = count;
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
		};
		request.send();
  };

  var fetchRedditCount = function (element) {
    var jsonURL = urls.Reddit + '?url=' + getDataAttribute(element, 'url');
		var request = new XMLHttpRequest();
		request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				// Success!
        var count = getDataAttribute(element, 'basecount') + parseInt(response, 10);
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

  var fetchPinterestCount = function (element) {
    var jsonURL = settings.Pinterest + '?url=' + getDataAttribute(element, 'url');
		var request = new XMLHttpRequest();
		request.open('GET', jsonURL, true);

    request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				// Success!
        var count = getDataAttribute(element, 'basecount') + parseInt(response, 10);
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
		$.ajax({
			url: urls.GooglePlus + '?url=' + getButtonURL(element),
			async: true,
			dataType: 'text',
		}).done(function (response) {
			var count = getBaseCount(element) + parseInt(response, 10);
			$(element).find('.count').html(shortCountNumber(count));
			totalCount = totalCount + count;
			googleplusCount = count;
		});
	}

	var attachFacebook = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var url = (this.hasAttribute('url') ? this.getAttribute('url') : '');
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
			var original_referer = (this.hasAttribute('referer') ? this.getAttribute('referer') : '');
			var url = (this.hasAttribute('url') ? this.getAttribute('url') : '');
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
			var url = (this.hasAttribute('url') ? this.getAttribute('url') : '');
			var fullurl = 'url=' + encodeURIComponent(url);
			var encodedUrl = encodeURIComponent(url);
			window.Reddit = window.Reddit || {};
			window.Reddit.shareWin = window.open('http://www.reddit.com/submit?' + fullurl, '', getWindowSizePosition());
			return false;
		});
	};

	var attachGooglePlus = function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			hook('onClick');
			var text = (this.hasAttribute('text') ? this.getAttribute('text') : '');
			var url = (this.hasAttribute('url') ? this.getAttribute('url') : '');
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
			var text = (this.hasAttribute('text') ? this.getAttribute('text') : '');
			var url = (this.hasAttribute('url') ? this.getAttribute('url') : '');
			var via = (this.hasAttribute('via') ? this.getAttribute('via') : '');
			var related = (this.hasAttribute('related') ? this.getAttribute('related') : '');
			var fullurl = 'text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url) + '&via=' + via + '&related=' + related;
			var encodedUrl = encodeURIComponent(url);
			window.Twitter = window.Twitter || {};
			window.Twitter.shareWin = window.open('https://twitter.com/intent/tweet?' + fullurl, '', getWindowSizePosition());
			return false;
		});
	};

  var shortCountNumber = function (num) {
    if (options.shortCount) {
      if (num >= 1e6){
        num = parseInt((num / 1e6).toFixed(2), 10) + 'M';
      } else if (num >= 1e3){
        num = parseInt((num / 1e3).toFixed(1), 10) + 'k';
      }
    }
    return num;
  };

  var getDataAttribute = function (element, attributeName) {
    var attributeValue = element.getAttribute('data-' + attributeName);
    if (typeof attributeValue !== 'undefined') {
      return attributeValue;
    } else {
      return '';
    }
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
		eventTimeout = null;
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

		// Destroy any existing initializations
		socialjs.destroy();

		// Merge user options with defaults
		settings = extend(defaults, options || {});

		el = document.querySelector(settings.container);

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
