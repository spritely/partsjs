define(function (require) {
    "use strict";

    var system = require("durandal/system"),
        log = require("log");

    // This method is designed to replace durandal's system.error method
    // and is not intended for general exposure
    var error = function (error, innerError) {
        try {
            log.postLog(error);
            console.error(error);

            if (innerError) {
                log.postLog(innerError);
                console.error(innerError);
            }
        } catch (ignored) {
        }
    };

    var durandalLog = {
        /**
         * Sets up the log by injecting it into the application.
         * @method setup
         */
        setup: function () {
            system.log = log.report;
            system.error = error;
        }
    };

    return durandalLog;
});
