import { all, get, update } from "./db";
import * as helpers from "./helpers";
import * as constants from "./constants";
import { RequestHandler } from "express";

interface APIRoutes {
  record: RequestHandler;
  study: RequestHandler;
  display: RequestHandler;
  settings: RequestHandler;
  toggle: RequestHandler;
  login: RequestHandler;
  visibility: {
    prompt: RequestHandler;
    field: RequestHandler;
  };
}

interface RecordTables {
  [k: string]: any;
}

// API routes
const routes: APIRoutes = {
  // Record route
  record: async (request, response) => {
    const { generateSql } = helpers;

    let sql,
      recordTables: RecordTables = {};

    const { defaultRecordTables: tables } = constants;
    try {
      for (let i = 0; i < tables.length; i++) {
        let tablename = tables[i];
        sql = generateSql(tablename, <string>request.query.id);

        recordTables[tablename] = await all(sql, tablename);
      }

      // Add object table
      sql = generateSql("object", <string>request.query.id);

      recordTables.object = await get(sql, "object");

      recordTables = helpers.formatByHeader(recordTables);

      response.json(recordTables);
    } catch (error) {
      const message = `GET /api/record error, ${error}`;

      console.log(message);

      response.status(400).json(message);
    }
  },

  // Study route
  study: async (request, response) => {
    const { generateSql, formatByHeader } = helpers;

    let sql,
      caseStudyTables = {};

    const visibleTables = request.query.visibleTables || [];

    const tables = [...visibleTables, ...constants.defaultCaseStudyTables];

    try {
      for (let i = 0; i < tables.length; i++) {
        let tablename = tables[i];
        sql = generateSql(tablename, request.query.id);

        caseStudyTables[tablename] = await all(sql, tablename);
      }

      // Add object table
      sql = generateSql("object", request.query.id);

      caseStudyTables.object = await get(sql, "object");

      caseStudyTables = formatByHeader(caseStudyTables);

      response.json(caseStudyTables);
    } catch (error) {
      const message = `GET /api/study error, ${error}`;

      console.log(message);

      response.status(400).json(message);
    }
  },

  // Display route
  display: async (request, response) => {
    const sql = `SELECT display.object_id, 
                            display.case_study, 
                            display.record, 
                            display.path
                     FROM display`;

    return all(sql, "display")
      .then((table) => {
        response.json(table);
      })
      .catch((error) => {
        const message = `GET /api/display error, ${error}`;

        console.log(message);

        response.status(400).json(message);
      });
  },

  // Settings route
  settings: async (request, response) => {
    const sql = `SELECT display.object_id, 
                            display.case_study, 
                            display.record, 
                            display.path, 
                            object.name
                    FROM display
                    INNER JOIN object ON display.object_id=object.object_id`;

    return all(sql, "display")
      .then((table) => {
        response.json(table);
      })
      .catch((error) => {
        const message = `GET /api/settings error, ${error}`;

        console.log(message);

        response.status(400).json(message);
      });
  },

  // Toggle route
  toggle: async (request, response) => {
    const fieldString = request.body.fieldString;
    const objectString = request.body.objectString;

    const sql = `UPDATE display
                     SET ${fieldString}
                     WHERE ${objectString}`;

    return update(sql, "display")
      .then(() => {
        response.json();
      })
      .catch((error) => {
        const message = `POST /api/settings error, ${error}`;

        console.log(message);

        response.status(400).json(message);
      });
  },

  // Login route
  login: async (request, response) => {
    const username = request.body.username;
    const password = request.body.password;

    const sql = `SELECT *
                     FROM settings
                     WHERE username = '${username}'`;

    try {
      const row = await get(sql, "login");

      if (row && row.username && row.password) {
        const hash = helpers.getPasswordHash(password);

        if (hash === row.password) {
          return response.json({ redirectUrl: "/settings" });
        }

        return response.json({ message: "Incorrect password" });
      }

      response.json({ message: "Incorrect username or password" });
    } catch (error) {
      const message = `POST /api/login error, ${error}`;

      console.log(message);

      return response.status(400).json(message);
    }
  },

  // Visibility routes
  visibility: {
    prompt: async (request, response) => {
      const { generateSql, formatByPromptVisibility } = helpers;

      const sql = generateSql("prompt_visibility", request.query.id);

      return get(sql, "prompt visibility")
        .then((table) => formatByPromptVisibility(table))
        .then((table) => {
          response.json(table);
        })
        .catch((error) => {
          const message = `GET /api/visibility/prompt error, ${error}`;

          console.log(message);

          response.status(400).json(message);
        });
    },

    field: async (request, response) => {
      const { generateSql, formatByValueVisibility } = helpers;

      const sql = generateSql("field_visibility", request.query.id);

      return get(sql, "field visibility")
        .then((table) => formatByValueVisibility(table))
        .then((table) => {
          response.json(table);
        })
        .catch((error) => {
          const message = `GET /api/visibility/field error, ${error}`;

          console.log(message);

          response.status(400).json(message);
        });
    },
  },
};

export default routes;
