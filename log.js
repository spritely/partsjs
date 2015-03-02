define(function (require) {
    "use strict";

    var safeToJSONString = function () {
        try {
            return log.toJSONString(arguments);
        } catch (ex) {
            try {
                return JSON.stringify(arguments);
            } catch (ex2) {
                try {
                    log.postLog(JSON.stringify(ex));
                } catch (ex3) {
                    console.log(ex, ex2, ex3);
                }
            }
        }
    };

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
        postLogUrl: "log",

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
            var serializedData = (typeof data == "string") ? data : safeToJSONString(data);
            return log.ajax({
                url: log.postLogUrl,
                data: log.toJSONString({ data: serializedData }),
                type: "POST",
                contentType: "application/json"
            });
        },

        /**
         * Reports something to the log. Any passed arguments are sent to the server and the console for logging.
         * @method log
         * @param {object} objects* - The object(s) to log.
         */
        report: function () {
            try {
                var args = (Array.prototype.slice.call(arguments));

                if (args.length == 1 && typeof args[0] == "string") {
                    log.postLog(args[0]);
                    console.log(args[0]);
                } else {
                    log.postLog(args);
                    console.log(args);
                }
            } catch (ignored) {
            }
        }
    };

    return log;
});
