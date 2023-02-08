import dedent from "dedent-js";
import { test } from "./test_utils";

describe("create table", () => {
  it(`formats CREATE TABLE always on multiple lines`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT,
        name VARCHAR(100),
        org_id INT
      )
    `);
  });

  it(`formats CREATE TEMPORARY TABLE`, () => {
    test(dedent`
      CREATE TEMPORARY TABLE foo (
        id INT
      )
    `);
  });

  it(`formats IF NOT EXISTS`, () => {
    test(dedent`
      CREATE TABLE IF NOT EXISTS foo (
        id INT
      )
    `);
  });

  it(`formats OR REPLACE`, () => {
    test(
      dedent`
        CREATE OR REPLACE TABLE foo (
          id INT
        )
      `,
      { dialect: "bigquery" }
    );
  });

  it(`formats CREATE TABLE with various data types`, () => {
    test(dedent`
      CREATE TABLE client (
        id INTEGER,
        name VARCHAR(100),
        price DECIMAL(10, 5),
        age UNSIGNED BIG INT,
        organization_name NATIVE CHARACTER (70)
      )
    `);
  });

  it(`formats CREATE TABLE with column constraints`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT NOT NULL PRIMARY KEY,
        name VARCHAR(100) UNIQUE COLLATE RTRIM,
        age VARCHAR(6) DEFAULT 0,
        organization_id INT REFERENCES organization (id),
        byear1 INT GENERATED ALWAYS AS (today - age) VIRTUAL,
        byear2 INT AS (today - age)
      )
    `);
  });

  it(`formats SQLite PRIMARY KEY modifiers`, () => {
    test(dedent`
      CREATE TABLE client (
        id INTEGER PRIMARY KEY ASC AUTOINCREMENT
      )
    `);
  });

  it(`formats CREATE TABLE with table constraints`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT,
        name VARCHAR,
        PRIMARY KEY (id, name),
        UNIQUE (name),
        CHECK (id > 0),
        FOREIGN KEY (id, org_id) REFERENCES organization (id, org_id)
      )
    `);
  });

  it(`formats FOREIGN KEY constraint with options`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT,
        FOREIGN KEY (org_id1) REFERENCES organization (id1)
          ON DELETE SET NULL
          ON UPDATE CASCADE,
        FOREIGN KEY (org_id3) REFERENCES organization (id3)
          MATCH FULL
      )
    `);
  });

  it(`formats deferrable FOREIGN KEY constraint`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT,
        CONSTRAINT fkey
          FOREIGN KEY (org_id1) REFERENCES organization (id1)
            DEFERRABLE,
        FOREIGN KEY (org_id2) REFERENCES organization (id2)
          NOT DEFERRABLE INITIALLY DEFERRED
      )
    `);
  });

  it(`formats CREATE TABLE with named column constraints`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT CONSTRAINT NOT NULL CONSTRAINT prim_key PRIMARY KEY
      )
    `);
  });

  it(`formats CREATE TABLE with named table constraints`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT,
        CONSTRAINT prim_key PRIMARY KEY (id, name),
        CONSTRAINT org_for_key
          FOREIGN KEY (id, org_id) REFERENCES organization (id, org_id)
      )
    `);
  });

  it(`formats constraints with ON CONFLICT clause`, () => {
    test(dedent`
      CREATE TABLE client (
        id INT,
        name VARCHAR(100) NOT NULL ON CONFLICT FAIL,
        uuid INT UNIQUE ON CONFLICT ROLLBACK,
        CONSTRAINT prim_key PRIMARY KEY (id) ON CONFLICT ABORT
      )
    `);
  });

  it(`formats BigQuery data types with internal constraints`, () => {
    test(
      dedent`
        CREATE TABLE client (
          arr_field ARRAY<INT64 NOT NULL>,
          struct_field STRUCT<name STRING NOT NULL, age INT64 DEFAULT 0>,
          meta OPTIONS(description = 'Metadata in here')
        )
      `,
      { dialect: "bigquery" }
    );
  });

  it(`formats SQLite table options`, () => {
    test(dedent`
      CREATE TABLE foo (
        id INT
      ) WITHOUT ROWID, STRICT
    `);
  });

  it(`formats single short BigQuery extra CREATE TABLE clause`, () => {
    test(
      dedent`
        CREATE TABLE client (
          id INT64
        ) DEFAULT COLLATE 'und:ci'
      `,
      { dialect: "bigquery" }
    );
  });

  it(`formats additional BigQuery CREATE TABLE clauses`, () => {
    test(
      dedent`
        CREATE TABLE client (
          id INT64
        )
        DEFAULT COLLATE 'und:ci'
        PARTITION BY _PARTITIONDATE
        CLUSTER BY customer_id
        OPTIONS(friendly_name = 'Clientele')
      `,
      { dialect: "bigquery" }
    );
  });

  it(`formats long BigQuery OPTIONS()`, () => {
    test(
      dedent`
        CREATE TABLE client (
          id INT64
        )
        OPTIONS(
          expiration_timestamp = TIMESTAMP "2025-01-01 00:00:00 UTC",
          partition_expiration_days = 1,
          description = "a table that expires in 2025, with each partition living for 24 hours",
          labels = [("org_unit", "development")]
        )
      `,
      { dialect: "bigquery" }
    );
  });

  it(`formats CREATE TABLE AS`, () => {
    test(dedent`
      CREATE TABLE foo AS
        SELECT * FROM tbl WHERE x > 0
    `);
  });

  it(`formats CREATE TABLE AS with long query`, () => {
    test(dedent`
      CREATE TABLE foo AS
        SELECT column1, column2, column3
        FROM external_client
        WHERE external_client.payment > external_client.income
    `);
  });
});
