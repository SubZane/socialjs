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
		onDestroy: function () {}
	};


	//
	// Methods
	//

	var attachEvents = function () {
    var sharebuttons = el.querySelectorAll('.sharebutton');

    forEach(sharebuttons, function (shareButton, value) {
      if (shareButton.getAttribute('data-sharetype') === 'twitter') {
        attachTwitter(shareButton);
        if (options.fetchCounts) {
          fetchTwitterCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'facebook') {
        attachFacebook(shareButton);
        if (options.fetchCounts) {
          fetchFacebookCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'linkedin') {
        attachLinkedIn(shareButton);
        if (options.fetchCounts) {
          fetchLinkedInCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'googleplus') {
        attachGooglePlus(shareButton);
        if (options.fetchCounts) {
          fetchGooglePlusCount(shareButton);
        }
      } else if (shareButton.getAttribute('data-sharetype') === 'reddit') {
        attachReddit(shareButton);
        if (options.fetchCounts) {
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
    var jsonURL = 'http://graph.facebook.com/?id=' + getDataAttribute(element, 'url');
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
    /*
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
    */
    count = getDataAttribute(element, 'basecount');
    element.querySelector('.count').innerHTML = shortCountNumber(count);
    totalCount = totalCount + count;
    twitterCount = count;
  }

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
    var jsonURL = 'http://www.linkedin.com/countserv/count/share?url=' + getDataAttribute(element, 'url') + '&callback=?';
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
  }



  var fetchRedditCount = function (element) {
    var jsonURL = 'http://www.reddit.com/api/info.json?url=' + getDataAttribute(element, 'url');
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

  var fetchPinterestCount = function (element) {
    var jsonURL = options.PinterestAPIProvider + '?url=' + getDataAttribute(element, 'url');
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

  socialjs.getTotalCount = function () {
    return totalCount;
  };

  socialjs.getFacebookCount = function () {
    return facebookCount;
  };

  socialjs.getTwitterCount = function () {
    return twitterCount;
  };

  socialjs.getLinkedinCount = function () {
    return linkedinCount;
  };

  socialjs.getGooglePlusCount = function () {
    return googleplusCount;
  };

  socialjs.getRedditCount = function () {
    return redditCount;
  };

	return socialjs;
});
