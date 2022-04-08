export type Database = {
  request: IDBOpenDBRequest;
  database: IDBDatabase | null;
};

export type Field = {
  name: string;
  value: any;
};

export function Field(args: { name: string; value: any }): Field {
  return {
    ...args,
  };
}

export type Row = {
  fields: Field[];
};

export function Row(args: { fields: Field[] }): Row {
  return {
    ...args,
  };
}

export type Table = {
  name: string;
  key: string;
  row: Row;
};

export function Table(args: { name: string; key: string; row: Row }): Table {
  return {
    ...args,
  };
}

export function open(
  name: string,
  table: Table,
  onFinish: (database: Database) => any
): void {
  const request = indexedDB.open(name);

  let database: IDBDatabase | null = null;

  request.onupgradeneeded = () => {
    database = request.result;
    const store = database.createObjectStore(table.name, {
      keyPath: table.key,
    });

    for (const field of table.row.fields) {
      store.createIndex(`by_${field.name}`, name);
    }
  };

  request.onsuccess = function () {
    database = request.result;
    onFinish({
      request: request,
      database: database,
    });
  };
}

export function insert(
  database: Database,
  table: Table,
  row: Row,
  onFinish: () => any
): void {
  if (database.database === null) return;
  const tx = database.database.transaction(table.name, "readwrite");
  const store = tx.objectStore(table.name);

  const obj: any = {};

  for (const field of row.fields) {
    obj[field.name] = field.value;
  }

  store.put(obj);

  tx.oncomplete = function () {
    // All requests have succeeded and the transaction has committed.
    onFinish();
  };
}

export function fetchOne(
  database: Database,
  table: Table,
  field: Field,
  onFinish: (row: Row | null) => any
): void {
  if (database.database === null) {
    onFinish(null);
    return;
  }

  const tx = database.database.transaction(table.name, "readonly");
  const store = tx.objectStore(table.name);

  const request = store.get(field.value);

  request.onsuccess = function () {
    const matching = request.result;
    if (matching !== undefined) {
      // A match was found.
      const row = { ...table.row };

      for (const fieldName of Object.keys(matching)) {
        let i = 0;
        for (const innerField of table.row.fields) {
          if (innerField.name === fieldName) {
            row.fields.splice(
              i,
              1,
              Field({ name: fieldName, value: matching[fieldName] })
            );
            break;
          }
          i++;
        }
      }

      onFinish(row);
    } else {
      // No match was found.
      onFinish(null);
    }
  };
}

export function fetchAll(
  database: Database,
  table: Table,
  onFinish: (row: Row[]) => any
): void {
  if (database.database === null) {
    onFinish([]);
    return;
  }

  const tx = database.database.transaction(table.name, "readonly");
  const store = tx.objectStore(table.name);

  const request = store.getAll();

  request.onsuccess = function () {
    const requestMatch = request.result;

    if (requestMatch !== undefined) {
      // A match was found.

      const rows = [];

      for (const matching of requestMatch) {
        const row: Row = { fields: [] };

        for (const fieldName of Object.keys(matching)) {
          row.fields.push(
            Field({ name: fieldName, value: matching[fieldName] })
          );
        }

        rows.push(row);
      }

      onFinish(rows);
    } else {
      // No match was found.
      onFinish([]);
    }
  };
}

export function deleteOne(
  database: Database,
  table: Table,
  field: Field,
  onFinish: () => any
): void {
  if (database.database === null) {
    onFinish();
    return;
  }
  const tx = database.database.transaction(table.name, "readwrite");
  const store = tx.objectStore(table.name);

  const request = store.delete(field.value);

  request.onsuccess = () => {
    onFinish();
  };
  request.onerror = () => {
    onFinish();
  };
}
