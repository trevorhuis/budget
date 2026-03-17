import db from "./database.js";

const seed = async () => {
  await db
    .insertInto("users")
    .values({
      id: "019cf45e-80f5-714a-a121-bb32f8364813",
      name: "Tester",
    })
    .execute();
};

seed();
