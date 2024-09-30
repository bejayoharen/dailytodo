import {TODO_TABLE_NAME,TODO_SCHEMA} from "./todo"
import {TASK_TABLE_NAME,TASK_SCHEMA} from "./tasks"

export const MIGRATION_TABLE_NAME="migrations"

export type migration = {
    id: number;
    message: string;
    migrated: Date;
}

export const MIGRATION_SCHEMA = `
        id INTEGER PRIMARY KEY NOT NULL,
        created INTEGER NOT NULL,
        message VARCHAR NOT NULL
    ` ;

export const deserializeMigration = (row) => {
    return {
        migrationNumber: row.id,
        created: new Date(row.created),
        message: row.message,
    }
} ;

export type migrationExec = {
    migrationNumber: int,
    message: string,
    migrationQuerys: string[],
}

export const MIGRATIONS = [
   {
       migrationNumber: 1,
       message: "Add Value to task Schema, and rangeMin and rangeMax to todo",
       migrationQuerys: [
           `ALTER TABLE ${TODO_TABLE_NAME} ADD rangeMin INT;`,
           `ALTER TABLE ${TODO_TABLE_NAME} ADD rangeMax INT;`,
           `ALTER TABLE ${TASK_TABLE_NAME} ADD value INT;`
       ],
   },
];
