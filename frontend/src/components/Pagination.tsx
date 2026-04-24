type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label: string;
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="paginationBar">
      <div className="paginationMeta">
        <strong>{label}</strong>
        <span>
          {start}-{end} من {totalItems}
        </span>
      </div>
      <div className="paginationActions">
        <button
          type="button"
          className="secondaryButton"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          السابق
        </button>
        <div className="paginationNumbers">
          {pages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`pageButton ${pageNumber === page ? "active" : ""}`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="secondaryButton"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
