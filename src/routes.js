import { randomUUID } from 'node:crypto';

import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      const user = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
      }

      database.insert('users', user);

      return res.writeHead(201).end();
    }
  },
]