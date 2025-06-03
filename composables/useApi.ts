export const useApi = () => {
	const config = useRuntimeConfig();
	const base = config.public.apiBase;

	const get = <T>(url: string, opts: any = {}) =>
		$fetch<T>(`${base}${url}`, {
			method: "GET",
			credentials: "include",
			...opts,
		});

	const post = <T>(url: string, body: any, opts: any = {}) =>
		$fetch<T>(`${base}${url}`, {
			method: "POST",
			body,
			credentials: "include",
			...opts,
		});

	const put = <T>(url: string, body: any, opts: any = {}) =>
		$fetch<T>(`${base}${url}`, {
			method: "PUT",
			body,
			credentials: "include",
			...opts,
		});

	const del = <T>(url: string, opts: any = {}) =>
		$fetch<T>(`${base}${url}`, {
			method: "DELETE",
			credentials: "include",
			...opts,
		});


	return { get, post, put, del };
};
