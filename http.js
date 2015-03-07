define(function (require) {
    "use strict";

    var http = {
        /**
         * Required. Default is a no-op so requests will not be processed without it.
         * Method is called as if it were jquery's $.ajax method. While the jquery
         * interface is required, jquery itself is optional so as not to introduce
         * a required dependency to use this code.
         */
        ajax: function () { },

        /**
         * Method responsible for redirection. Default assumes code is executing
         * in a web browser and uses window.location.replace.
         * @method redirect
         * @param {string} url - The location to redirect to.
         */
        redirect: window.location.replace.bind(window.location),

        /**
         * Called  with all headers to give the system a chance to convert passed
         * data. The typical use case is unwrapping observables such as knockout's
         * as in ko.toJS(). Default is to return the same object (i.e. no-op).
         * @method toJSONObject
         * @param {object} object - The object to sanitize
         */
        toJSONObject: function (o) {
            return o;
        },

        /**
         * Called with all POST requests to give the system a chance to convert
         * passed data. The typical use case is unwrapping observables such as
         * knockout's as in ko.toJSON(). Default behavior is to use JSON.stringify.
         * @method toJSONString
         * @param {object} object - The object to serialize
         */
        toJSONString: JSON.stringify,

        /**
         * The url to redirect to when the server responds with 401 Unauthorized.
         * This value should be set or no 401s will be a no-op.
         */
        unauthorizedRedirect: "",

        /**
         * http calls this whenever a request returns 401 Unauthorized.
         * Default behavior redirects to http.unauthorizedRedirect if set or does nothing if not.
         * @method on401
         */
        on401: function () {
            if (typeof http.unauthorizedRedirect == "string" && http.unauthorizedRedirect.length > 0) {
                http.redirect(http.unauthorizedRedirect);
            }
        },

        /**
         * All logging is performed via this call so consumers can choose to
         * substitute their own logging mechanism. Default is simply logging
         * to the console.
         * @method log
         * @param {object} objects* The data to be logged.
         */
        log: function () {
            try {
                var args = (Array.prototype.slice.call(arguments));
                console.log(args);
            } catch (ignore) {
            }
        },

        /**
         * http adds fail to all http request promises.
         * By default it logs all responses.
         * It is designed to be easily replaceable with custom done functionality.
         * @method done
         */
        done: function (response) {
            http.log("Loaded: ", response);
        },

        /**
         * http adds fail to all http request promises.
         * By default it just calls log.
         * It is designed to be easily replaceable with custom fail functionality.
         * @method fail
         */
        fail: function () {
            var args = (Array.prototype.slice.call(arguments));
            http.log(args);
        },

        /**
         * Makes an HTTP POST request with JSON data.
         * @method post
         * @param {string} url The url to send the post request to.
         * @param {object} data The data to post. It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @param {object} [headers] The data to add to the request header.  It will be converted to JSON. If the data contains Knockout observables, they will be converted into normal properties before serialization.
         * @return {Promise} A promise of the response data.
         */
        post: function (url, data, headers) {
            http.log(url, data, headers);
            return http.ajax({
                url: url,
                data: http.toJSONString(data),
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                headers: http.toJSONObject(headers),
                statusCode: {
                    401: http.on401
                }
            }).fail(http.fail).done(http.done);
        }
    };

    return http;
});
