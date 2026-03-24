import { DELETE, GET, POST, PUT } from "../api";

type CollectionItem = {
  createdAt?: Date;
  id: string;
  updatedAt?: Date;
  userId?: string;
};

type CollectionResponse<TItem> = {
  data: TItem[];
};

const stripServerFields = <TItem extends CollectionItem>(item: TItem) => {
  const { createdAt, updatedAt, ...payload } = item;
  return payload;
};

const stripInsertFields = <TItem extends CollectionItem>(item: TItem) => {
  const { userId, ...payload } = stripServerFields(item);
  return payload;
};

const stripUpdateFields = <TItem extends CollectionItem>(item: TItem) => {
  const { id, userId, ...payload } = stripServerFields(item);
  return payload;
};

export const getCollectionData = async <TItem>(url: string) => {
  const response = await GET<CollectionResponse<TItem>>(url);
  return response.data;
};

export const createCrudHandlers = <TItem extends CollectionItem>(
  baseUrl: string,
) => ({
  onUpdate: async ({
    transaction,
  }: {
    transaction: { mutations: Array<{ modified: TItem; original: TItem }> };
  }) => {
    const { modified, original } = transaction.mutations[0];
    await PUT(`${baseUrl}/${original.id}`, stripUpdateFields(modified));
  },
  onInsert: async ({
    transaction,
  }: {
    transaction: { mutations: Array<{ modified: TItem }> };
  }) => {
    const item = transaction.mutations[0].modified;
    await POST(baseUrl, stripInsertFields(item));
  },
  onDelete: async ({
    transaction,
  }: {
    transaction: { mutations: Array<{ modified: TItem }> };
  }) => {
    const item = transaction.mutations[0].modified;
    await DELETE(`${baseUrl}/${item.id}`);
  },
});
