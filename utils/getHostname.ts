export const getHostname = (hostnameCookie: string) => {
    if (hostnameCookie.split(':').length > 1) {
        return hostnameCookie.split(':')[0]
    }
    return hostnameCookie
}