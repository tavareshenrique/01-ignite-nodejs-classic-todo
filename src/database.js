import fs from 'node:fs/promises'

import assert from 'node:assert';

import { generate } from 'csv-generate';
import { parse } from 'csv-parse';

const databasePath = new URL('../db.json', import.meta.url)
export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf-8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {

      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }
  
  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  async insertByCsv(table, data) {
    // Initialise the parser by generating random records
    const parser = generate({
      high_water_mark: 64 * 64,
      length: 100
    }).pipe(
      parse()
    );

    // Intialise count
    let count = 0;

    // Report start
    process.stdout.write('start\n');

    // Iterate through each records
    for await (const record of parser) {
      // Report current line
      process.stdout.write(`${count++} ${record.join(',')}\n`);
      // Fake asynchronous operation
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Report end
    process.stdout.write('...done\n');

    // Validation
    assert.strictEqual(count, 100);
  }

  update(table, id, data) {
    if (Array.isArray(this.#database[table])) {
      const rowIndex = this.#database[table].findIndex(row => row.id === id)

      if (rowIndex > -1) {
        const { id, ...rest } = this.#database[table][rowIndex]

        this.#database[table][rowIndex] = { 
          id, 
          ...rest,
          ...data 
        }

        this.#persist()
      }
    }
  }

  delete(table, id) {
    if (Array.isArray(this.#database[table])) {
      const rowIndex = this.#database[table].findIndex(row => row.id === id)

      if (rowIndex > -1) {
        this.#database[table].splice(rowIndex, 1)

        this.#persist()
      }
    }
  }
}