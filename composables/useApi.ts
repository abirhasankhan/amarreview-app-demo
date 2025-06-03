export const useApi = () => {
	const config = useRuntimeConfig();
	const base = config.public.apiBase;
	const supabase = useSupabaseClient();

	let cachedToken: string | null = null;

	const getAccessToken = async () => {
		if (cachedToken) return cachedToken;

		const {
			data: { session },
		} = await supabase.auth.getSession();
		cachedToken = session?.access_token || "";
		return cachedToken;
	};

	const get = async <T>(url: string, opts: any = {}) => {
		const token = await getAccessToken();
		return $fetch<T>(`${base}${url}`, {
			method: "GET",
			credentials: "include",
			headers: {
				Authorization: `Bearer ${token}`,
				...opts.headers,
			},
			...opts,
		});
	};

	const post = async <T>(url: string, body: any, opts: any = {}) => {
		const token = await getAccessToken();
		return $fetch<T>(`${base}${url}`, {
			method: "POST",
			body,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
				...opts.headers,
			},
			...opts,
		});
	};

	const put = async <T>(url: string, body: any, opts: any = {}) => {
		const token = await getAccessToken();
		return $fetch<T>(`${base}${url}`, {
			method: "PUT",
			body,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
				...opts.headers,
			},
			...opts,
		});
	};

	const del = async <T>(url: string, opts: any = {}) => {
		const token = await getAccessToken();
		return $fetch<T>(`${base}${url}`, {
			method: "DELETE",
			credentials: "include",
			headers: {
				Authorization: `Bearer ${token}`,
				...opts.headers,
			},
			...opts,
		});
	};

	return { get, post, put, del };
};
