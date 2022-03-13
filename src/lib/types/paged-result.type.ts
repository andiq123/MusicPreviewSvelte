export type PagedResult<T> = {
	items: T;
	pageSize: number;
	pageNumber: number;
	totalPages: number;
};
