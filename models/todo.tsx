export const TODO_TABLE_NAME="todos";

export enum period {
    DAILY = "Daily",
    DAILY_TRACKER = "Daily Tracker",
    WEEKLY = "Weekly",
    MONTHLY = "Monthly",
}

export const periodSortOrder = (p) => {
    if( p === period.DAILY ) return 0;
    if( p === period.DAILY_TRACKER ) return 1;
    if( p === period.WEEKLY ) return 2;
    if( p === period.MONTHLY ) return 3;
    
    return -1;
}

export type TodoItem = {
    id: number;
    title: string;
    created: number;
    modified: number;
    frequency: number;
    rangeMin: number;
    rangeMax: number;
    period: period;
}

export const TODO_SCHEMA = `
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        created INTEGER NOT NULL,
        modified INTEGER NOT NULL,
        frequency INT NOT NULL,
        period VARCHAR(10) NOT NULL
    `; //note sqlite doesn't actually impose a limit on string length

export function deserializeTodo(t):TodoItem {
    return {
        id: t.id,
        title: t.title,
        created: new Date(t.created),
        modified: new Date(t.modified),
        frequency: t.frequency,
        period: t.period,
        rangeMin: t.rangeMin,
        rangeMax: t.rangeMax,
    }
}

export function newTodo(title: string):TodoItem {
    return {
        id: -1,
        title: title,
        created: new Date(),
        modified: new Date(),
        frequency: 1,
        period: period.DAILY,
    }
}
