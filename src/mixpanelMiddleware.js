import mixpanel from 'mixpanel-browser';

const identity = value => value;

const renameProperties = (object, formatter) => {
    return Object.keys(object).reduce((memo, key) => {
        memo[formatter(key)] = formatter(object[key]);
        return memo;
    }, {})
};

export default function mixpanelMiddleware(token, options = {}) {
    mixpanel.init(token, options.config);

    const {
        personSelector,
        uniqueIdSelector,
        actionTypeFormatter = identity,
        propertyFormatter = identity,
    } = options;

    return store => next => action => {
        const {
            type,
            meta: {
                mixpanel: {
                    type: customType,
                    eventName: eventName,
                    timeEvent: timeEvent,
                    props: mixpanelPayload,
                    increment: increment,
                } = {},
            } = {},
        } = action;

        if (eventName) {
            if (personSelector && uniqueIdSelector) {
                const person = personSelector(store.getState());
                mixpanel.identify(uniqueIdSelector(store.getState()));
                mixpanel.people.set(person);
            }

            const data = (typeof mixpanelPayload === 'object') ? mixpanelPayload : {};
            mixpanel.track(actionTypeFormatter(eventName), {
                ...renameProperties(data, propertyFormatter),
                action: actionTypeFormatter(customType || type),
            });
        }

        if (timeEvent) {
            mixpanel.time_event(timeEvent);
        }

        if (increment && increment.length > 0) {
            mixpanel.people.increment(propertyFormatter(increment));
        }

        return next(action);
    };
}
