(function(e){if("function"==typeof bootstrap)bootstrap("wakeevent",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeWakeEvent=e}else"undefined"!=typeof window?window.wakeEvent=e():global.wakeEvent=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var timeout = 5000;
var lastTime = Date.now();
var callbacks = [];

setInterval(function() {
    var currentTime = Date.now();
    if (currentTime > (lastTime + timeout + 2000)) {
        callbacks.forEach(function (fn) {
            fn();
        });
    }
    lastTime = currentTime;
}, timeout);

module.exports = function (fn) {
    callbacks.push(fn);
};

},{}]},{},[1])(1)
});
;