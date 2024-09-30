

export const TASK_TABLE_NAME="tasks"

export type TaskItem = {
    id: number;
    todoId: number;
    created: Date;
    value: number;
}

export function newTask(todo: TodoItem, created: Date):TaskItem {
    if( !created ) throw Error( "created date requred.")
    if( !todo || todo.id == -1 ) {
        console.Error( "Invalid todo" )
        throw( "Invalid todo in new task" )
    }
    return {
        id: -1,
        todoId: todo.id,
        created: created,
    }
}

export function deserializeTask(t):TaskItem {
    return {
        id: t.id,
        todoId: t.todoId,
        created: new Date(t.created),
        value: t.value,
    }
}

export const TASK_SCHEMA = `
        id INTEGER PRIMARY KEY NOT NULL,
        todoId INTEGER NOT NULL,
        created INTEGER NOT NULL,
        FOREIGN KEY(todoId) REFERENCES todos(id)
    ` ;
