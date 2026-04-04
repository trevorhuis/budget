import type { Dispatch, SetStateAction } from "react";

import type { JsonObject } from "~/lib/schemas";

export function createDraftUpdateHelpers<TData extends JsonObject>(
  setDraft: Dispatch<SetStateAction<TData>>,
) {
  return {
    setField<K extends keyof TData>(key: K) {
      return (value: TData[K]) => {
        setDraft((current) => ({ ...current, [key]: value }));
      };
    },
    setNestedField<K extends keyof TData, NK extends keyof TData[K]>(
      key: K,
      nestedKey: NK,
    ) {
      return (value: TData[K][NK]) => {
        setDraft((current) => ({
          ...current,
          [key]: {
            ...(current[key] as object),
            [nestedKey]: value,
          },
        }));
      };
    },
  };
}
