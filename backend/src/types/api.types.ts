export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
