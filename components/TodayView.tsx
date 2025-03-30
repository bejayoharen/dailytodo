import React, { useEffect, useCallback } from 'react';
import {
    Button,
    View,
} from 'react-native';

import * as dbutil from "../models/dbutil"

import * as dateUtil from "../util/dateUtil"
import { TodoItem, period, periodSortOrder } from "../models/todo"
import { TaskItem, newTask } from "../models/tasks"
import TodoStatus from "./TodoStatus"
import { Text } from 'react-native';

import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { AppState } from 'react-native';

export function TodayView({ navigation, showDate }): React.JSX.Element {
    // console.log( "TodayView render called with showDate: ", showDate );
    // console.log( "TodayView render called with Navigation: ", navigation );

    const [todos, setTodos] = React.useState<TodoItem[]>([]);
    const [recentTasks, setRecentTasks] = React.useState<TaskItem[]>([]);
    const loadData = async (fullRefresh: boolean = true) => {
        try {
            // console.log("Loading data for TodayView")
            const db = await dbutil.getDBConnection();
            // Load todos
            const a = await dbutil.getTodoItems(db)
            // console.log( ":::" );
            // console.log(  a );
            // console.log( ":::" );

            if( fullRefresh) setTodos(a);
            setRecentTasks(await dbutil.getRecentTasksByTodoId(db, showDate, 80))
        } catch (error) {
            console.error("Failed to load data for TodayView: ", error);
        }
    }
    useEffect(() => {
        loadData(true);
    }, [])

    const onCompleted = async (todo: TodoItem) => {
        const task = newTask(todo, showDate)

        const db = await dbutil.getDBConnection();
        await dbutil.insertTask(db, task);

        //FIXME: time this. if it's slow, maybe we can mutate instead of reloading.
        loadData(false);
    }
    const onUncompleted = async (task: TaskItem) => {
        const db = await dbutil.getDBConnection();
        await dbutil.deleteTask(db, task.id);

        //FIXME: time this. if it's slow, maybe we can mutate.
        loadData(false);
    }
    const updateTracker = async (todo: TodoItem, tsk: TaskItem, newVal: number) => {
        // console.log( todo )
        // console.log( tsk )
        // console.log( newVal )

        const db = await dbutil.getDBConnection();
        if (tsk != null) {
            await dbutil.deleteTask(db, tsk.id);
        }

        const task = newTask(todo, showDate);
        task.value = newVal
        await dbutil.insertTask(db, task);

        //FIXME: time this. if it's slow, maybe we can mutate.
        loadData(false);
    }

    const isFocused = useIsFocused();

    useFocusEffect(
        useCallback(() => {
            loadData(true);
        }, [])
    );

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active' && isFocused) {
                loadData(true);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isFocused]);

    // encourage creation of a todo if none exist
    if (todos === null || todos.length == 0) {
        return <View style={createButtonContainer}>
            <Button style={createButton}
                title="Create your first todo"
                onPress={() => navigation.navigate("Edit Todo")}
            />
            <View style={{ height: "100%", margin: "auto", padding: "auto" }} />
        </View>
    }
    const todoInDisplayOrder = todos.sort((a, b) => { //list daily, then daily trackers, then weekly then monthly
        return periodSortOrder(a.period) - periodSortOrder(b.period)
    })
    return <View style={listContainerStyle}>
        {todoInDisplayOrder.map((t) => {
            return <>
                <TodoStatus key={t.id} showDate={showDate} todo={t} tasks={recentTasks[t.id]} onCompleted={onCompleted} onUncompleted={onUncompleted} updateTracker={updateTracker} />
            </>
        })}
    </View>
}


const listContainerStyle = {
    width: "100%",
    flexDirection: "column",
    borderStyle: "solid",
    borderColor: "cyan",
    borderWidth: 0,
    padding: 7,
    // height: "100%", // this is a hack to make sure the view doesn't collapse when empty
    //alignItems: 'left',
    alignItems: 'center',
};

const createButton = {
};
const createButtonContainer = {
    width: "100%",
    flexDirection: "column",
    flex: 1,
    borderStyle: "solid",
    borderColor: "cyan",
    borderWidth: 2,
    padding: 7,
    marginTop: 100,
    //alignItems: 'left',
    alignItems: 'center',
};