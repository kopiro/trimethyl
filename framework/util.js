/**
 * @class  	Util
 * @author  Flavio De Stefano <flavio.destefano@caffeinalab.com>
 */

/**
 * @method requireOrNull
 * Require a module, or return a null object
 * @param  {String} name
 * @return {Object}
 */
exports.requireOrNull = function(name) {
	try {
		return require(name) || null;
	} catch (ex) {
		return null;
	}
};

/**
 * @method openURL
 * Try to open the URL with `Ti.Platform.openURL`, catching errors.
 *
 * If can't open the primary argument (url), open the fallback.
 *
 * If can't open the fallback, and `error` is set, show the error dialog.
 *
 * @param  {String} url The URL to open
 * @param  {String|Function} [fallback] If is a string, try to open the URL. If is a functions, call it.
 * @param  {String} [error]    The error to show
 */
exports.openURL = function(url, fallback, error) {
	var doFallback = function() {
		if (fallback != null) {
			if (_.isFunction(fallback)) {
				fallback();
			} else if (_.isString(fallback)) {
				Ti.Platform.openURL(fallback);
			}
		} else if (error != null) {
			exports.errorAlert(error);
		}
	};

	if (OS_IOS) {
		if (Ti.Platform.canOpenURL(url)) {
			Ti.Platform.openURL(url);
		} else {
			doFallback();
		}
	} else if (OS_ANDROID) {
		try {
			Ti.Platform.openURL(url);
		} catch (err) {
			doFallback();
		}
	}
};

/**
 * @method 	tryOpenURLs
 * Try to open all URLs in the array
 * @param  {Array} urls
 * @return {Boolean} `true` if at least one url has been opened.
 */
exports.tryOpenURLs = function(urls) {
	for (var i = 0; i < urls.length; i++) {
		try {
			if (OS_IOS) {
				if (Ti.Platform.canOpenURL(urls[i])) {
					Ti.Platform.openURL(urls[i]);
				} else {
					throw new Error();
				}
			} else if (OS_ANDROID) {
				Ti.Platform.openURL(urls[i]);
			}

			return true;
		} catch (err) {}
	}

	return false;
};

/**
 * @method startActivity
 * Valid only on Android, start the activity catching any possible errors.
 *
 * If `error` is provided, show the error dialog with this message.
 *
 * @param  {Object} opt   		Options for `createIntent(...)`
 * @param  {String} [error] 	Error message
 */
exports.startActivity = function(opt, error) {
	try {
		Ti.Android.currentActivity.startActivity(Ti.Android.createIntent(opt));
	} catch (ex) {
		if (error != null) {
			exports.errorAlert(error);
		}
	}
};

/**
 * @method  openFacebookProfile
 * Open a Facebook profile in the Facebook application
 * @param  {String} fb_id 	Facebook ID
 */
exports.openFacebookProfile = function(fb_id) {
	if (!/^\d+$/.test(fb_id)) {
		Ti.API.warn('Util: openFacebookProfile needs a numeric ID, not the username');
	}

	return exports.tryOpenURLs([
		'fb://profile/' + fb_id,
		'https://www.facebook.com/' + fb_id
	]);
};

/**
 * @method  openTwitterProfile
 * Open a Twitter profile in the Twitter application
 * @param  {String} tw_username 	Twitter screen name
 */
exports.openTwitterProfile = function(tw_username) {
	return exports.tryOpenURLs([
		'tweetbot:///user_profile/' + tw_username,
		'twitter://user?screen_name=' + tw_username,
		'http://www.twitter.com/' + tw_username
	]);
};

/**
 * @method  openTwitterStatus
 * Open a Twitter status in the Twitter application
 * @param  {String} tw_username   	The user id
 * @param  {String} status_id 		The status id
 */
exports.openTwitterStatus = function(tw_username, status_id) {
	return exports.tryOpenURLs([
		'twitter://status?id=' + status_id,
		'http://www.twitter.com/' + tw_username + '/statuses/' + status_id
	]);
};

/**
 * @method  openYoutubeProfile
 * Open a Youtube profile in the Yotube application
 * @param  {String} ytid 	Youtube ID
 */
exports.openYoutubeProfile = function(ytid) {
	return Ti.Platform.openURL('https://www.youtube.com/user/' + ytid);
};

/**
 * Get the Facebook avatar from the graph
 *
 * @param  {String} fbid Facebook ID
 * @param  {Number} [w]    Width
 * @param  {Number} [h]    Height
 * @return {String}      	The open graph url pointing to the image
 */
exports.getFacebookAvatar = function(fbid, w, h) {
	return 'http://graph.facebook.com/' + fbid + '/picture/?width=' + (w || 150) + '&height=' + (h || 150);
};

/**
 * @method openInStore
 * Open the iTunes Store or Google Play Store of specified appid
 * @property appid The appid
 */
exports.openInStore = function(appid) {
	if (OS_IOS) {
		Ti.Platform.openURL('https://itunes.apple.com/app/id' + appid);
	} else if (OS_ANDROID) {
		Ti.Platform.openURL('https://play.google.com/store/apps/details?id=' + appid);
	}
};

/**
 * @method  getDomainFromURL
 * Return the clean domain of an URL
 *
 * @param  {String} url The URL to parse
 * @return {String}     Clean domain
 */
exports.getDomainFromURL = function(url) {
	var matches = url.match(/https?\:\/\/([^\/]*)/i);
	if (matches == null || matches[1] == null) return '';

	return matches[1].replace('www.', '');
};

/**
 * Return the iOS major version
 * @return {Number}
 */
exports.getIOSVersion = function() {
	if (!OS_IOS) return 0;
	return Ti.Platform.version.split('.')[0] >> 0;
};

/**
 * @method isIOS6
 * Check if is iOS 6
 * @return {Boolean}
 */
exports.isIOS6 = function() {
	return exports.getIOSVersion() === 6;
};

/**
 * @method isIOS7
 * Check if is iOS 7
 * @return {Boolean}
 */
exports.isIOS7 = function() {
	return exports.getIOSVersion() === 7;
};

/**
 * @method isIOS8
 * Check if is iOS 8
 * @return {Boolean}
 */
exports.isIOS8 = function() {
	return exports.getIOSVersion() === 8;
};

/**
 * Parse the initial arguments URL schema
 *
 * @return {String}
 */
exports.parseSchema = function() {
	if (OS_IOS) {
		var cmd = Ti.App.getArguments();
		if (cmd.url != null) return cmd.url;
	} else if (OS_ANDROID) {
		var url = Ti.Android.currentActivity.intent.data;
		if (url != null) return url;
	}
	return null;
};

/**
 * @method timestamp
 * Get the UNIX timestamp.
 *
 * @param  {Object} [arg]  The date to parse.
 * @return {Number}
 */
exports.timestamp = function(arg) {
	if (arg == null) return exports.now();
	return (new Date(arg).getTime() / 1000) >> 0;
};

/**
 * @method now
 * Get the current UNIX timestamp.
 * @return {Number}
 */
exports.now = function() {
	return (Date.now() / 1000) >> 0;
};

/**
 * @method fromNow
 * Get the UNIX timestamp from now with delay expressed in seconds.
 *
 * @param  {Number} [t]  Seconds from now.
 * @return {Number}
 */
exports.fromNow = function(t) {
	return exports.timestamp(Date.now() + t*1000);
};

/**
 * @method timestampForHumans
 * Return in human readable format a timestamp
 * @param  {Number} ts The timestamp
 * @return {String}
 */
exports.timestampForHumans = function(ts) {
	return require('alloy/moment')(ts*1000).format();
};

/**
 * @method parseJSON
 * Try to parse a JSON, and silently fail on error, returning a `null` in this case.
 *
 * @param  {String} json 		The JSON to parse.
 * @return {Object}
 */
exports.parseJSON = function(json) {
	try {
		return JSON.parse(json) || null;
	} catch (ex) {
		return null;
	}
};

/**
 * @method buildQuery
 * Generate URL-encoded query string.
 *
 * @param {Object} obj 			Object key-value to parse.
 * @param {String} prepend 	The prepended char
 * @return {String}
 */
exports.buildQuery = function(obj, prepend) {
	if (_.isEmpty(obj)) return '';

	var q = [];
	var builder = function(value, key) {
		if (value === null || value === undefined) return;

		if (_.isArray(value)) {
			_.each(value, function(v) { builder(v, key+'[]'); });
		} else if (_.isObject(value)) {
			_.each(value, function(v, k) { builder(v, key+'['+k+']'); });
		} else {
			q.push( encodeURIComponent(key) + '=' + encodeURIComponent(value) );
		}
	};

	_.each(obj, builder);
	return q.length === 0 ? '' : ((prepend || '?') + q.join('&'));
};

/**
 * @method  getAppDataDirectory
 * Return the app-data directory.
 *
 * @return {String}
 */
var APPDATA_DIRECTORY = null;
exports.getAppDataDirectory = function() {
	if (APPDATA_DIRECTORY === null) {
		if (OS_IOS) {
			APPDATA_DIRECTORY = Ti.Filesystem.applicationSupportDirectory;
		} else if (OS_ANDROID) {
			APPDATA_DIRECTORY = Ti.Filesystem[ Ti.Filesystem.isExternalStoragePresent() ? 'externalStorageDirectory' : 'applicationDataDirectory' ];
		} else {
			APPDATA_DIRECTORY = Ti.Filesystem.applicationDataDirectory;
		}
		// Why this?
		// Because sometimes this directory doesn't exists,
		// so with this wrap we are sure that the directory will exists.
		try { Ti.Filesystem.getFile(APPDATA_DIRECTORY).createDirectory(); } catch (err) {}
	}
	return APPDATA_DIRECTORY;
};

/**
 * @method  dialog
 * Dial a number.
 *
 * @param  {String} tel The number to call.
 */
exports.dial = function(tel) {
	var telString = tel.match(/[0-9]/g).join('');
	var errString = String.format(L('unable_to_call', 'Unable to call %s'), tel);
	if (OS_IOS) {
		exports.openURL('tel:' + telString, null, errString);
	} else if (OS_ANDROID) {
		exports.startActivity({
			action: Ti.Android.ACTION_CALL,
			data: 'tel:' + telString
		}, errString);
	}
};

var XCU = {
	key: ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
	q: {
		name: 'queryKey',
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

/**
 * @method parseAsXCallbackURL
 * @param  {String} 	url  The URL to parse
 * @return {XCallbackURL}
 */
exports.parseAsXCallbackURL = function(str) {
	var m = XCU.parser.strict.exec(str);
	var i = XCU.key.length;
	var uri = {};

	while (i--) uri[XCU.key[i]] = m[i] || '';
	uri[XCU.q.name] = {};
	uri[XCU.key[12]].replace(XCU.q.parser, function($0, $1, $2) {
		if ($1) uri[XCU.q.name][$1] = decodeURIComponent($2);
	});

	return uri;
};

/**
 * @method hashJavascriptObject
 * Return the seralized representation of any JS object.
 * @param  {Object} obj
 * @return {String} The hash
 */
exports.hashJavascriptObject = function(obj) {
	if (obj == null) return 'null';
	if (_.isArray(obj) || _.isObject(obj)) return JSON.stringify(obj);
	return obj.toString();
};

/**
 * @method getErrorMessage
 * An error parser that parse a String/Object
 */
exports.getErrorMessage = function(obj) {
	if (_.isObject(obj)) {
		if (_.isString(obj.message)) {
			return obj.message;
		} else if (_.isObject(obj.error) && _.isString(obj.error.message)) {
			return obj.error.message;
		} else if (_.isString(obj.error)) {
			return obj.error;
		}
	} else if (!_.isEmpty(obj)) {
		return obj.toString();
	}
	return L('unexpected_error', 'Unexpected error');
};

/**
 * @method errorAlert
 * @param  {Object}   err      		The object error
 * @param  {Function} [callback] 	The callback
 */
exports.errorAlert = exports.alertError = function(err, callback) {
	require('T/dialog').alert(L('error', 'Error'), exports.getErrorMessage(err), callback);
};

/**
 * @method bytesForHumans
 * Get a human representation of bytes
 * @param  {Number} bytes
 * @return {String}
 */
exports.bytesForHumans = function(bytes) {
	var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes)/Math.log(1024)));
	return Math.round(bytes/Math.pow(1024,i),2) + ' ' + sizes[i];
};

/**
 * @method getDatabaseDirectory
 * Get the private documents directory
 * @return {String}
 */
var DATABASE_DIRECTORY = null;
exports.getDatabaseDirectoryName = exports.getDatabaseDirectory = function() {
	if (DATABASE_DIRECTORY === null) {
		if (OS_IOS) {
			var db = Ti.Database.open('test');
			var path = db.file.resolve().split('/'); path.pop();
			db.close();
			DATABASE_DIRECTORY = path.join('/') + '/';
		} else if (OS_ANDROID) {
			DATABASE_DIRECTORY = Ti.Filesystem[ Ti.Filesystem.isExternalStoragePresent() ? 'externalStorageDirectory' : 'applicationDataDirectory' ] + '/databases';
			try { Ti.Filesystem.getFile(DATABASE_DIRECTORY).createDirectory(); } catch (err) {}
		}
	}
	return DATABASE_DIRECTORY;
};

/**
 * @method getResourcesDirectory
 * Get the resources directory path
 * @return {String}
 */
exports.getResourcesDirectory = function() {
	if (Ti.Shadow) {
		return Ti.Filesystem.applicationDataDirectory + Ti.App.name + (OS_IOS ? '/iphone/' : '/android/');
	} else {
		return Ti.Filesystem.resourcesDirectory;
	}
};

/**
 * @method compareVersions
 * Compare two app versions
 * @param  {String} a
 * @param  {String} b
 * @return {Number}
 */
exports.compareVersions = function(a, b) {
	if (a == null || b == null) return 0;

	a = a.split('.');
	b = b.split('.');
	for (var i = 0; i < Math.max(a.length, b.length); i++) {
		var _a = +a[i] || 0, _b = +b[i] || 0;
		if (_a > _b) return 1;
		else if (_a < _b) return -1;
	}
	return 0;
};
