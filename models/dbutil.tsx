import {enablePromise, openDatabase, SQLiteDatabase} from "react-native-sqlite-storage"
import {TODO_TABLE_NAME,newTodo,period,TodoItem,TODO_SCHEMA,deserializeTodo} from "./todo"
import {TASK_TABLE_NAME,TaskItem,TASK_SCHEMA,deserializeTask} from "./tasks"
import {MIGRATION_TABLE_NAME,MIGRATION_SCHEMA,MIGRATIONS,deserializeMigration,migration} from "./migration"

    
enablePromise(true);

const loggedQuery = async ( db: SQLiteDatabase, query: string ) => {
    console.log( "<====" );
    try {
        console.log( query );
        console.log( db );
        const r = await db.executeSql(query)
        console.log( "Successful Query!" );
        console.log( "Query was: " + query );
        console.log( "Result was: " + JSON.stringify(r,null,2) );
//        console.log( "Result was: " + JSON.stringify(r[0],null,2) );
//        console.log( "Result was: " + JSON.stringify(r[0].rows,null,2) );
        
        if( r && r[0] && r[0].rows ) {
            for( i=0; i<r[0].rows.length; ++i ) {
                console.log( "   [" + i + "]: " + JSON.stringify(r[0].rows.item(i)) );
            }
        }
        return r;
    } catch( error ) {
        console.error( "Error from DB Query: " + JSON.stringify(error,null,2) )
        console.error( "Query was: " + query )
        throw error
    } finally {
        console.log( "====>" );
    }
}

export const runMigrations = async( db: SQLiteDatabase ) => {
    let currentMigration = 0;
    // read what migration we are up to:
    const migrations: migration[] = [];
    const results = await loggedQuery(db,(`SELECT * FROM ${MIGRATION_TABLE_NAME}`));
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
          const m = deserializeMigration(result.rows.item(index) )
          migrations.push( m )
          if( m.migrationNumber > currentMigration )
              currentMigration = m.migrationNumber;
      }
    });
    console.log( currentMigration )
    // run the nessessary migrations
    for( mi in MIGRATIONS ) {
        const m = MIGRATIONS[mi]
        // actually run the migration
        if( m.migrationNumber > currentMigration ) {
            for( qi in m.migrationQuerys ) {
                const q = m.migrationQuerys[qi]
                await loggedQuery( db, q )
            }
            // store that we did the migration:
            await loggedQuery(db, `INSERT INTO ${MIGRATION_TABLE_NAME}(id, created, message) values ('${m.migrationNumber}', '${new Date().valueOf()}', '${m.message}' )` );
        }
    }
}

let databaseConnection: SQLiteDatabase = null;
export const getDBConnection = async () => {
    if( !databaseConnection ) {
        databaseConnection = await openDatabase( {name: 'todo.db' , location: "default" } );
        console.log( "opened database: \n" + JSON.stringify(databaseConnection, null, 2) );
        await loggedQuery( databaseConnection, "PRAGMA foreign_keys = ON;" );
        return databaseConnection;
    }
    return databaseConnection;
}

export const createTables = async (db: SQLiteDatabase) => {
    const createTodoQ = `CREATE TABLE IF NOT EXISTS ${TODO_TABLE_NAME}( ${TODO_SCHEMA} );`
    await loggedQuery(db,createTodoQ);
    const createTaskQ = `CREATE TABLE IF NOT EXISTS ${TASK_TABLE_NAME}( ${TASK_SCHEMA} );`
    await loggedQuery(db,createTaskQ);
    const createMigrationQ = `CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE_NAME}( ${MIGRATION_SCHEMA} );`
    await loggedQuery(db,createMigrationQ);
}

export const dropTables = async (db: SQLiteDatabase) => {
    const dropTaskQuery = `DROP TABLE IF EXISTS ${TASK_TABLE_NAME};`
    await loggedQuery(db,dropTaskQuery);
    const dropTodoQuery = `DROP TABLE IF EXISTS ${TODO_TABLE_NAME};`
    await loggedQuery(db,dropTodoQuery);
    const dropMigrationQuery = `DROP TABLE IF EXISTS ${MIGRATION_TABLE_NAME};`
    await loggedQuery(db,dropMigrationQuery);
}

export const getTodoItems = async (db: SQLiteDatabase): Promise<TodoItem[]> => {
  try {
    const todoItems: TodoItem[] = [];
    const results = await loggedQuery(db,(`SELECT * FROM ${TODO_TABLE_NAME}`));
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
          todoItems.push( deserializeTodo(result.rows.item(index) ) )
      }
    });
    return todoItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get todoItems !!!');
  }
};

export const insertTask = async (db: SQLiteDatabase, task:TaskItem): Promise => {
    try {
        const insertQuery = `INSERT INTO ${TASK_TABLE_NAME}(todoId, created, value) values ('${task.todoId}', '${task.created.valueOf()}', '${task.value}' )`;
        
        await loggedQuery(db,insertQuery)
    } catch (error) {
        console.error(error);
        throw Error('Failed to save TodoItems!');
    }
}

export const deleteTask = async( db: SQLiteDatabase, id: number ) => {
    try {
        const deleteQuery = `DELETE FROM ${TASK_TABLE_NAME} WHERE ${id} = id;`;
        await loggedQuery(db,deleteQuery)
    } catch (error) {
        console.error(error);
        throw Error('Failed to delete task!');
    }
}

//FIXME: we need to go back however many days from the show date, not from now!
export const getRecentTasksByTodoId = async (db: SQLiteDatabase): Promise<string,TaskItem> => {
  try {
    const taskItems = {};
    let start = new Date();
    start.setDate(start.getDate() - 32);
    const results = await loggedQuery(db,(`SELECT * FROM ${TASK_TABLE_NAME} WHERE created > ${start.valueOf()}`));
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
          const task = deserializeTask(result.rows.item(index))
//          console.log( "===> " + JSON.stringify( task, null, 2 ) )
          if( task.todoId in taskItems )
              taskItems[task.todoId].push(task);
          else
              taskItems[task.todoId] = [task];
      }
    });
//    console.log( ":::: " + JSON.stringify( taskItems, null, 2 ) )
    return taskItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to getRecentTaskItems !!!');
  }
};

export const insertTodo = async( db: SQLiteDatabase, todo: TodoItem ) => {
    try {
        const insertQuery = `INSERT INTO ${TODO_TABLE_NAME}(title, created, modified, frequency, period, rangeMin, rangeMax) values ('${todo.title}', '${todo.created.valueOf()}', '${todo.modified.valueOf()}', '${todo.frequency}', '${todo.period}', '${todo.rangeMin}', '${todo.rangeMax}' )`;

        await loggedQuery(db,insertQuery)
    } catch (error) {
        console.error(error);
        throw Error('Failed to save TodoItems!');
    }
}

export const deleteTodo = async( db: SQLiteDatabase, id: number ) => {
    try {
        const deleteTaskQuery = `DELETE FROM ${TASK_TABLE_NAME} WHERE ${id} = todoid;`;
        await loggedQuery(db,deleteTaskQuery)
        const deleteTodoQuery = `DELETE FROM ${TODO_TABLE_NAME} WHERE ${id} = id;`;
        await loggedQuery(db,deleteTodoQuery)
    } catch (error) {
        console.error(error);
        throw Error('Failed to delete TodoItems!');
    }
}

export const resetDB = async( db: SQLiteDatabase ) => {
    // wipe old data and create new blank dbs
    await dropTables(db);
    await createTables(db);
}


export const createDefaultTestData = async( db: SQLiteDatabase ) => {
    //setup our datascturctures
    const initTodos = [
        newTodo('go to shop'),
        newTodo('go to other shop'),
        newTodo('eat at least a one healthy food'),
        newTodo('Do some exercises')
    ];
    initTodos[2].period = period.MONTHLY;
    initTodos[3].period = period.WEEKLY;
    initTodos[3].frequency = 4;

    // populate
    await saveTodoItems(db, initTodos);
}

export const saveTodoItems = async( db: SQLiteDatabase, todos: TodoItem[] ) => {
    try {
        const replace = todos.filter(i=>i.id!=-1).map(i => `(${i.id}, '${i.title}', '${i.created.valueOf()}', '${i.modified.valueOf()}', '${i.frequency}', '${i.period}' )`).join(',')
        const insert = todos.filter(i=>i.id==-1).map(i => `('${i.title}', '${i.created.valueOf()}', '${i.modified.valueOf()}', '${i.frequency}', '${i.period}' )`).join(',')
        
        const replaceQuery = `REPLACE INTO ${TODO_TABLE_NAME}(rowid, title, created, modified, frequency, period) values ` + replace
        const insertQuery = `INSERT INTO ${TODO_TABLE_NAME}(title, created, modified, frequency, period) values ` + insert;

        if( replace.length > 0 )
            await loggedQuery(db,replaceQuery)
        if( insert.length > 0 )
            await loggedQuery(db,insertQuery)
    } catch (error) {
        console.error(error);
        throw Error('Failed to save TodoItems!');
    }
};

export const updateTodo = async( db: SQLiteDatabase, todo: TodoItem ) => {
    try {
        const updateQuery = `UPDATE ${TODO_TABLE_NAME}
            SET title='${todo.title}',
                modified='${new Date().valueOf()}',
                frequency=${todo.frequency},
                period='${todo.period}',
                rangeMin='${todo.rangeMin}',
                rangeMax='${todo.rangeMax}'
            WHERE
                rowid=${todo.id}`

        await loggedQuery(db,updateQuery)
    } catch (error) {
        console.error(error);
        throw Error('Failed to save TodoItems!');
    }
};
