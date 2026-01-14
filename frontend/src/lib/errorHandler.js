import toast from "react-hot-toast";

export const ErrorType = {
    NETWORK: "NETWORK",
    AUTH: "AUTH",
    VALIDATION: "VALIDATION",
    NOT_FOUND: "NOT_FOUND",
    SERVER: "SERVER",
    UNKNOWN: "UNKNOWN",
};

const defaultMessages = {
    [ErrorType.NETWORK]: "Please check your internet connection.",
    [ErrorType.AUTH]: "Your session has expired, please log in again.",
    [ErrorType.VALIDATION]: "Check the information you entered.",
    [ErrorType.NOT_FOUND]: "The content you are looking for could not be found.",
    [ErrorType.SERVER]: "Server error, please try again later.",
    [ErrorType.UNKNOWN]: "An unexpected error occurred.",
};

function classifyError(error) {
    if (!error.response && error.request) return ErrorType.NETWORK;

    if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) return ErrorType.AUTH;
        if (status === 404) return ErrorType.NOT_FOUND;
        if (status === 400 || status === 422) return ErrorType.VALIDATION;
        if (status >= 500) return ErrorType.SERVER;
    }

    return ErrorType.UNKNOWN;
}

export const handleError = (error, options = {}) => {
    const {
        context = "App",
        showToast = true,
        customMessage = null
    } = options;

    const type = classifyError(error);
    const message = customMessage || error.response?.data?.message || error.message || defaultMessages[type];

    if (process.env.NODE_ENV === "development") {
        console.error(`[Error - ${context}]`, { type, message, original: error });
    }

    if (showToast) {
        toast.error(message);
    }

    if (type === ErrorType.AUTH && !window.location.pathname.includes("/login")) {
        setTimeout(() => {
            window.location.href = "/login";
        }, 1500);
    }

    return { type, message };
};