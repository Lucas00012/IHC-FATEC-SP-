export function buildQuery(objQuery?: any) {
    if (!objQuery) return "";

    var entries = Object.entries(objQuery)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return `?${entries}`;
}