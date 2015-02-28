define(function (require) {
    "use strict";

    var ko = require("knockout");

    // Better knockout binding error handling and reporting
    // Derived from: http://stackoverflow.com/questions/13136678/knockoutjs-catch-errors-binding
    var ErrorHandlingBindingProvider = function () {
        var original = new ko.bindingProvider();

        //determine if an element has any bindings
        this.nodeHasBindings = original.nodeHasBindings;

        //return the bindings given a node and the bindingContext
        this.getBindingAccessors = function (node, bindingContext) {
            var result = {};

            //catch general errors parsing binding syntax
            try {
                result = original.getBindingAccessors(node, bindingContext);
            } catch (e) {
                knockoutErrorHandlingBindingProvider.log("Error in binding syntax: " + e.message, node);
            }

            //catch errors when actually evaluating the value of a binding
            ko.utils.objectForEach(result, function (key, value) {
                result[key] = function () {
                    var result = null;

                    try {
                        result = value();
                    } catch (e) {
                        knockoutErrorHandlingBindingProvider.log("Error in \"" + key + "\" binding: " + e.message, node);
                    }

                    return result;
                };
            });

            return result;
        };
    };

    var knockoutErrorHandlingBindingProvider = {
        /**
         * All logging is performed via this call so consumers can choose to
         * substitute their own logging mechanism. Default is simply logging
         * to the console.
         * @method log
         * @param {object} objects* The data to be logged.
         */
        log: function () {
            try {
                console.log(arguments);
            } catch (ignore) {
            }
        },

        /**
         * Sets up the binding provider by attaching it to knockout.
         * @method setup
         */
        setup: function () {
            ko.bindingProvider.instance = new ErrorHandlingBindingProvider();
        }
    };

    return knockoutErrorHandlingBindingProvider;
});
