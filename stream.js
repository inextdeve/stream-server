class DatabaseERROR extends Error {
  constructor(message) {
    this.message = message;
  }
}

const stream = async () => {
  try {
    const dbQuery = `SELECT address, name FROM cameras WHERE id=${id}`;
    const data = await db.query(dbQuery);
  } catch (error) {}
};
