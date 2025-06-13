import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const useUrlState = <T extends string>(
  paramName: string,
  defaultValue: T,
) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [value, setValue] = useState<T>(
    (searchParams.get(paramName) as T) || defaultValue,
  );

  useEffect(() => {
    setValue((searchParams.get(paramName) as T) || defaultValue);
  }, [searchParams, paramName, defaultValue]);

  const updateUrl = (newValue: T) => {
    setValue(newValue);
    const params = new URLSearchParams(searchParams.toString());
    if (newValue === defaultValue) {
      params.delete(paramName);
    } else {
      params.set(paramName, newValue);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [value, updateUrl] as const;
};
