define(function (require) {
    "use strict";

    // Some of the code in this file could be more concisely written, but using more verbose syntax
    // to not introduce any dependencies and for maximum backward compatibility

    var safeLogger = function (f, context) {
        return function () {
            try {
                var args = (Array.prototype.slice.call(arguments));

                f.apply(context, args);
            } catch (ignored) {
            }
        };
    };

    var listeners = {
        alert: [],
        log: [],
        error: [],
        debug: [],
        info: [],
        warn: []
    };

    var listenerNotifier = function (listeners) {
        return function () {
            var args = (Array.prototype.slice.call(arguments));
            for (var i = 0, length = listeners.length; i < length; i++) {
                try {
                    listeners[i].apply(null, args);
                } catch (ex) {
                    log.postLog(JSON.stringify(ex));
                    // Using the enclosed console.log here
                    log.log(ex);
                }
            }
        };
    };

    var safeToJSONString = function () {
        try {
            return log.toJSONString(arguments);
        } catch (ex) {
            try {
                return JSON.stringify(arguments);
            } catch (ex2) {
                try {
                    log.postLog(JSON.stringify(ex));
                    // Using the enclosed console.log here
                    log.log(ex, ex2, ex3);
                } catch (ex3) {
                    // Using the enclosed console.log here
                    log.log(ex, ex2, ex3);
                }
                return null;
            }
        }
    };

    var setupLog = function (global) {
        var g = global || window;

        var console = g.console || {};

        // These methods are added back onto log itself in case of a need to bypass the log itself.
        // They are not meant to be used under normal circumstances. Users should just log to
        // console like they would in the absense of any log object.
        log.log = console.log || function () { };
        log.error = console.error || function () { };
        log.debug = console.debug || function () { };
        log.info = console.info || function () { };
        log.warn = console.warn || function () { };
        log.alert = g.alert || function () { };

        // Replace built-in instances with loggers
        g.alert = listenerNotifier(listeners.alert);
        console.log = listenerNotifier(listeners.log);
        console.error = listenerNotifier(listeners.error);
        console.debug = listenerNotifier(listeners.debug);
        console.info = listenerNotifier(listeners.info);
        console.warn = listenerNotifier(listeners.warn);

        // log everything to the server
        listeners.alert.push(safeLogger(log.postLog));
        listeners.log.push(safeLogger(log.postLog));
        listeners.error.push(safeLogger(log.postLog));
        listeners.debug.push(safeLogger(log.postLog));
        listeners.info.push(safeLogger(log.postLog));
        listeners.warn.push(safeLogger(log.postLog));

        // Delegate log calls back to console log as well
        listeners.log.push(safeLogger(log.log, console));
        listeners.error.push(safeLogger(log.error, console));
        listeners.info.push(safeLogger(log.info, console));
        listeners.warn.push(safeLogger(log.warn, console));

        // Debug isn't recommended so push debug statements to log instead
        // https://developer.mozilla.org/en-US/docs/Web/API/Console
        listeners.debug.push(safeLogger(log.log, console));

        // Likewise we don't post alerts, but redirect to log instead
        listeners.alert.push(safeLogger(log.log, console));

        // And listen to any global error events ...
        g.onerror = function (message) {
            console.log(message);
        };

        g.addEventListener("error", function (e) {
            console.log(e);
        });
    };

    // module relies on the static nature of this object
    var log = {
        /**
         * Required. Default is a no-op so requests will not be processed without it.
         * Method is called as if it were jquery's $.ajax method. While the jquery
         * interface is required, jquery itself is optional so as not to introduce
         * a required dependency to use this code.
         */
        ajax: function () { },

        /**
         * The url to which logs should be written. Receiver can expect to receive
         * a JSON blob of the format: { data: "<whatever was logged>" } where
         * <whatever was logged> could be just a string or a json serialized blob
         * of data. Data will be sent via HTTP POST. Default url is /log
         */
        postLogUrl: "/log",

        /**
         * Called with all POST requests to give the system a chance to convert
         * passed data. The typical use case is unwrapping observables such as
         * knockout's as in ko.toJSON(). Default behavior is to use JSON.stringify.
         * @method toJSONString
         * @param {object} object - The object to serialize
         */
        toJSONString: JSON.stringify,

        /**
         * POSTs log messages to the server at log.postLogUrl. Strings are posted
         * directly. All other types are JSON serialized before sending.
         * @method postLog
         * @param {object} data - The data to log.
         */
        postLog: function (data) {
            var serializedData = (typeof data == "string") ? data : (data.constructor === Array && data.length == 1) ? data[0] : safeToJSONString(data);
            if (data) {
                log.ajax({
                    url: log.postLogUrl,
                    data: log.toJSONString({ data: serializedData }),
                    type: "POST",
                    contentType: "application/json"
                });
            }
        }
    };

    setupLog(this);

    return log;
});
