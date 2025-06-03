export const useApi = () => {
	const config = useRuntimeConfig();
	const base = config.public.apiBase;
	const withBase = (url: string) => `${base}${url}`;

	const get = <T>(url: string, opts: any = {}) =>
		$fetch<T>(withBase(url), {
			method: "GET",
			credentials: "include",
			...opts,
		});

	const post = <T>(url: string, body: any, opts: any = {}) =>
		$fetch<T>(withBase(url), {
			method: "POST",
			body,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...opts.headers,
			},
			...opts,
		});

	const put = <T>(url: string, body: any, opts: any = {}) =>
		$fetch<T>(withBase(url), {
			method: "PUT",
			body,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...opts.headers,
			},
			...opts,
		});

	const del = <T>(url: string, opts: any = {}) =>
		$fetch<T>(withBase(url), {
			method: "DELETE",
			credentials: "include",
			...opts,
		});

	return { get, post, put, del };
};
