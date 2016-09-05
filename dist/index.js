'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mixpanelMiddleware = require('./mixpanelMiddleware');

Object.defineProperty(exports, 'default', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_mixpanelMiddleware).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = mixpanelMiddleware;

var _mixpanelBrowser = require('mixpanel-browser');

var _mixpanelBrowser2 = _interopRequireDefault(_mixpanelBrowser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var identity = function identity(value) {
    return value;
};

var renameProperties = function renameProperties(object, formatter) {
    return Object.keys(object).reduce(function (memo, key) {
        memo[formatter(key)] = object[key];
        return memo;
    }, {});
};

function mixpanelMiddleware(token) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var personSelector = _ref.personSelector;
    var uniqueIdSelector = _ref.uniqueIdSelector;
    var _ref$actionTypeFormat = _ref.actionTypeFormatter;
    var actionTypeFormatter = _ref$actionTypeFormat === undefined ? identity : _ref$actionTypeFormat;
    var _ref$propertyFormatte = _ref.propertyFormatter;
    var propertyFormatter = _ref$propertyFormatte === undefined ? identity : _ref$propertyFormatte;

    _mixpanelBrowser2.default.init(token);

    return function (store) {
        return function (next) {
            return function (action) {
                var type = action.type;
                var _action$meta = action.meta;
                _action$meta = _action$meta === undefined ? {} : _action$meta;
                var mixpanelPayload = _action$meta.mixpanel;
                var increment = _action$meta.mixpanelIncrement;


                if (mixpanelPayload) {
                    if (personSelector && uniqueIdSelector) {
                        var person = personSelector(store.getState());
                        _mixpanelBrowser2.default.identify(uniqueIdSelector(store.getState()));
                        _mixpanelBrowser2.default.people.set(person);
                    }

                    var data = (typeof mixpanelPayload === 'undefined' ? 'undefined' : _typeof(mixpanelPayload)) === 'object' ? mixpanelPayload : {};

                    _mixpanelBrowser2.default.track(actionTypeFormatter(type), _extends({}, renameProperties(data, propertyFormatter)));
                }

                if (increment && increment.length > 0) {
                    _mixpanelBrowser2.default.people.increment(propertyFormatter(increment));
                }

                return next(action);
            };
        };
    };
}
