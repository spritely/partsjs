define(function(require) {
    "use strict";

    var ko = require("knockout");

    // Better knockout binding error handling and reporting
    // Derived from: http://www.knockmeout.net/2013/06/knockout-debugging-strategies-plugin.html
    var knockoutErrorHandlingBindingProvider = {
        /**
         * All logging is performed via this call so consumers can choose to
         * substitute their own logging mechanism. Default is simply logging
         * to the console.
         * @method log
         * @param {object} objects* The data to be logged.
         */
        log: function() {
            try {
                console.log(arguments);
            } catch (ignore) {
            }
        },

        /**
         * Sets up the binding provider by attaching it to knockout.
         * @method setup
         */
        setup: function() {
            var existing = ko.bindingProvider.instance;

            ko.bindingProvider.instance = {
                nodeHasBindings: existing.nodeHasBindings,
                getBindings: function(node, bindingContext) {
                    var bindings;
                    try {
                        bindings = existing.getBindings(node, bindingContext);
                    } catch (ex) {
                        knockoutErrorHandlingBindingProvider.log("binding error", ex.message, node, bindingContext);
                    }

                    return bindings;
                }
            };
        }
    };

    return knockoutErrorHandlingBindingProvider;
});
