import amplitude from "amplitude-js";

let instance;

const init = () => {
    instance = amplitude.getInstance();

    instance.init(process.env.VUE_APP_AMPLITUDE_API_KEY, null, {
        includeGclid: true,
        includeUtm: true,
        includeReferrer: true,
    });

    return instance;
}

const initUser = ({ id, ...rest }) => {
    instance.setUserId(id);
    instance.setUserProperties(rest);
}

const logEvent = (name, props) => {
    instance.logEvent(name, props)
}

export default {
    init,
    initUser,
    logEvent,
}