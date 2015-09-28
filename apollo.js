/*
Copyright (c) 2015 David Loschiavo, zerodarknerdy.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var APOLLO = APOLLO || (function() {
	var scriptName = 'apollo.js';
	var defaultID = 'apollo_adblock_placeholder';
	var analytics = {};
	var _args = {
		'id' : defaultID,
		'sampling' : 100, // percentage of pageviews that we'll test for adblocking
		'verbose' : false, // do you want extra messaging to appear in console.log?
		'timeout' : 100, // ms to wait before checking for ad blocking
		'categoryBlocked' : 'adblock (apollo)', // GA category to be used when adblocking is detected
		'categoryUnblocked' : 'adblock (apollo)', // GA category to be used when adblocking is NOT detected
		'actionBlocked' : 'blocked', // GA action to be used when adblocking is detected
		'actionUnblocked' : 'unblocked', // GA action to be used when adblocking is NOT detected
		'labelBlocked' : window.location.pathname, // GA label to be used when adblocking is detected
		'labelUnblocked' : window.location.pathname, // GA label to be used when adblocking is NOT detected
	};

	return {
		init : function() {
			// import args
		    var scripts = document.getElementsByTagName("script");
		    var i, j, src, parts, basePath;
		    var found = false;
			for (i = 0; i < scripts.length; i++) {
				src = scripts[i].src;
				if (src.indexOf(scriptName) != -1) {
					found = true;
					parts = src.split('?');
					basePath = parts[0].replace(scriptName, '');
					if (parts[1]) {
						var opt = parts[1].split('&');
						for (j = opt.length-1; j >= 0; --j) {
							var pair = opt[j].split('=');
							_args[pair[0]] = pair[1];
						}
					}
			    	break;
				}
			}
			if (!found) {
				console.log('adblocking analytics script has been renamed, and arguments are not detectable.  please make sure you update "scriptName" in the source');
			}

			// sampling is off by default, but for high traffic sites, you may want to drop this down below 20 or you will hit daily datapoint limits in
			if (_args.sampling < 100) {
				var random = Math.floor((Math.random() * 100) + 1);
				if (random > _args.sampling) {
					_args.test = false;
					if (_args.verbose)
						console.log('skipping adblock test / sampling[' + _args.sampling + '%] rolled[' + random + ']');
					return false;
				}
			}

			if (_args.id == defaultID) {
				if (_args.verbose)
					console.log('using placeholder id[' + defaultID + ']');
				document.body.innerHTML += '<div class="advertisement ad advertising ad_holder" id="' + defaultID + '" style="width:300px;height:250px;background:#CCC;top:-500px;position:absolute;"></div>';
			} else {
				if (_args.verbose)
					console.log('not using placeholder id[' + defaultID + ']');
			}

			return true;
		},
		hasGoogleAnalyticsSupport : function() {
			// ga() tracking in analytics.js... see https://developers.google.com/analytics/devguides/collection/analyticsjs/events
			analytics.ga = true;
			if (typeof window.ga != 'function') {
				analytics.ga = false;
			}
			if (_args.verbose)
				console.log('GA support via ga()[' + analytics.ga + ']');

			// trackEvent tracking in ga.js... see https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide?hl=en
			analytics.trackEvent = true;
			if (typeof window.trackEvent != 'function') {
				analytics.trackEvent = false;
			}
			if (_args.verbose)
				console.log('GA support via trackEvent()[' + analytics.trackEvent + ']');

			// some ultra-legacy implementations using ga.js weren't set up to use trackEvent() and need to gaq.push() instead.
			analytics.gaq = true;
			if (typeof _gaq == 'undefined') {
				analytics.gaq = false;
			}
			if (_args.verbose)
				console.log('GA support via _gaq[' + analytics.gaq + ']');

			if (!analytics.ga && !analytics.trackEvent && !analytics.gaq) {
				if (_args.verbose)
					console.log('GA tracking is not available');
				return false;
			}
			return true;
		},
		adblocked : function() {
			if (_args.verbose)
				console.log('starting adblock test');
			var tag = document.getElementById(_args.id);
			if ((tag.length < 1) || (tag.clientHeight < 1)) {
				if (_args.verbose)
					console.log('adblock on');
				return true;
			}
			if (_args.verbose)
				console.log('adblock off');
			return false;
		},
		logToGoogleAnalytics : function(category, action, label) {
			if (analytics.ga) {
				ga('send', 'event', category, action, label);
			} else if (analytics.trackEvent) {
				trackEvent(category, action, label);
			} else if (analytics.gaq) {
				_gaq.push(['_trackEvent', category, action, label]);
			}
		},
		getCategoryBlocked : function() { return _args.categoryBlocked; },
		getActionBlocked : function() { return _args.actionBlocked; },
		getLabelBlocked : function() { return _args.labelBlocked; },
		getCategoryUnblocked : function() { return _args.categoryUnblocked; },
		getActionUnblocked : function() { return _args.actionUnblocked; },
		getLabelUnblocked : function() { return _args.labelUnblocked; },
	}
}());

if (APOLLO.init()) {
	setTimeout(function() {
		if (APOLLO.hasGoogleAnalyticsSupport()) {
			if (APOLLO.adblocked()) {
				APOLLO.logToGoogleAnalytics(APOLLO.getCategoryBlocked(), APOLLO.getActionBlocked(), APOLLO.getLabelBlocked());
			} else {
				APOLLO.logToGoogleAnalytics(APOLLO.getCategoryUnblocked(), APOLLO.getActionUnblocked(), APOLLO.getLabelUnblocked());
			}
		}
	}, APOLLO.timeout);
}