import { request } from "./common-api";

const applyHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => {
    let httpHeaders: { [key: string]: string } = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    if (extraHeaders) {
        httpHeaders = { ...httpHeaders, ...extraHeaders };
    }

    return httpHeaders;
};

export const api = {
    get: <TResponse>(url: string, extraHeaders?: Record<string, string>) => {
        const httpHeaders = applyHeaders(extraHeaders);
        return request<TResponse>(url, {
            headers: httpHeaders,
            method: "GET",
        });
    },
    post: <TBody extends BodyInit, TResponse>(url: string, body: TBody, extraHeaders?: Record<string, string>) => {
        const httpHeaders = applyHeaders(extraHeaders);
        return request<TResponse>(url, {
            headers: httpHeaders,
            method: "POST",
            body,
        });
    },
    delete: <TResponse>(url: string, id: number, extraHeaders?: Record<string, string>) => {
        const httpHeaders = applyHeaders(extraHeaders);
        return request<TResponse>(`${url}/${id}`, {
            headers: httpHeaders,
            method: "DELETE",
        });
    },
};
