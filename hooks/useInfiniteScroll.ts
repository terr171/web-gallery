import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseInfiniteScrollOptions<T> {
  initialData?: T[];
  pageSize: number;
  fetchData: (offset: number, limit: number) => Promise<T[]>;
}

export const useInfiniteScroll = <T>({
  initialData = [],
  pageSize,
  fetchData,
}: UseInfiniteScrollOptions<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [offset, setOffset] = useState(initialData.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.length === pageSize);
  const [error, setError] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreData = useCallback(async () => {
    if (!hasMore || loading || error) return;

    setLoading(true);
    try {
      const newData = await fetchData(offset, pageSize);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setOffset((prev) => prev + newData.length);
        setHasMore(newData.length === pageSize);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      setHasMore(false);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, error, offset, pageSize, fetchData]);

  useEffect(() => {
    setData(initialData);
    setOffset(initialData.length);
    setHasMore(initialData.length === pageSize);
    setError("");
    setLoading(false);
  }, [initialData, pageSize, fetchData]);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        loadMoreData();
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "20px",
    });

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [hasMore, loading, loadMoreData]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMoreRef,
  };
};
