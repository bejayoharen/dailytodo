/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useCallback, useEffect, createContext, useContext} from 'react';
import type {PropsWithChildren} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    AppState,
    Button,
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- local imports
import * as dateUtil from "./util/dateUtil"
// db and models
import * as dbutil from "./models/dbutil"
import {newTodo,TodoItem,period} from "./models/todo"
import {newTask,TaskItem} from "./models/tasks"
// views
import {AnalysisView} from "./components/AnalysisView"
import { EditTodoView } from "./components/EditTodoView"
import { TodayView } from "./components/TodayView"
import { GlobalContext } from "./context"

const RESET_DB = false;
const POPULATE_SAMPLE_DATA = false;

function TodayScreen({navigation}) {
    const context = useContext(GlobalContext);
    
    const onCompleted = async ( todo: TodoItem ) => {
        const task = newTask( todo, context.showDate )

        const db = await dbutil.getDBConnection();
        await dbutil.insertTask(db,task);
        
        context.setRecentTasks( await dbutil.getRecentTasksByTodoId(db) )
    }
    const onUncompleted = async ( task: TaskItem ) => {
        const db = await dbutil.getDBConnection();
        await dbutil.deleteTask(db,task.id);
        
        context.setRecentTasks( await dbutil.getRecentTasksByTodoId(db) )
    }
    
    const updateTracker = async (todo,tsk,newVal) => {
        console.log( todo )
        console.log( tsk )
        console.log( newVal )
        
        const db = await dbutil.getDBConnection();
        if( tsk != null ) {
            await dbutil.deleteTask( db, tsk.id );
        }

        const task = newTask( todo, context.showDate );
        task.value = newVal
        await dbutil.insertTask(db,task);
        
        context.setRecentTasks( await dbutil.getRecentTasksByTodoId(db) )
    }
    
    return (
            <SafeAreaView style={editTasksStyles.container}>
            <ScrollView style={editTasksStyles.scrollView}>
            <View>
            <TodayView navigation={navigation} todos={context.todos} tasks={context.tasks} onCompleted={onCompleted} onUncompleted={onUncompleted} showDate={context.showDate} now={context.now} updateTracker={updateTracker} />
            </View>
            </ScrollView>
            </SafeAreaView>
            );
}

function AnalysisScreen() {
    return <AnalysisView />
}

function EditScreen() {
    const context = useContext(GlobalContext);
    
    const createTodo = async ( name, period, frequency, min, max ) => {
        const todo = newTodo(name)
        todo.period = period
        todo.frequency = frequency
        todo.rangeMin = min
        todo.rangeMax = max
        
        const db = await dbutil.getDBConnection();
        await dbutil.insertTodo(db,todo);
        
        context.setTodos( await dbutil.getTodoItems(db) )
    }
    
    const deleteTodo = async ( id ) => {
        const db = await dbutil.getDBConnection();
        await dbutil.deleteTodo(db,id);
        context.setTodos( await dbutil.getTodoItems(db) )
        context.setRecentTasks( await dbutil.getRecentTasksByTodoId(db) )
    }
    const editTodo = async ( todo:TodoItem, taskName:stirng, frequency:number, min:number, max:number ) => {
//        console.log(todo)
//        console.log(taskName)
//        console.log(frequency)
        todo.title = taskName;
        todo.frequency = frequency;
        todo.rangeMin = min;
        todo.rangeMax = max;
        const db = await dbutil.getDBConnection();
        await dbutil.updateTodo(db,todo);
        
        context.setTodos( await dbutil.getTodoItems(db) )
    }

    return (
            <SafeAreaView style={editTasksStyles.container}>
            <ScrollView style={editTasksStyles.scrollView}>
            <EditTodoView todos={context.todos} createTodo={createTodo} editTodo={editTodo} deleteTodo={deleteTodo} />
            </ScrollView>
            </SafeAreaView>
            );
}

const Tab = createBottomTabNavigator();

export default function App(): React.JSX.Element {
    const [todos, setTodos] = useState([]);
    const [tasks, setRecentTasks] = useState({});
    const [now, setNow] = useState( new Date() );
    const [showDate, setShowDate] = useState( new Date() );
    
    const loadDataCallback = useCallback(async () => {
        try {
            const db = await dbutil.getDBConnection();
            if( RESET_DB ) {
                await dbutil.resetDB(db);
                if( POPULATE_SAMPLE_DATA ) {
                    await dbutil.createDefaultTestData(db);
                }
            } else {
                await dbutil.createTables(db);
            }
            await dbutil.runMigrations(db);
    
            setTodos(await dbutil.getTodoItems(db));
            setRecentTasks( await dbutil.getRecentTasksByTodoId(db) )
        } catch (error) {
            console.error(error);
        }
    }, []);
    useEffect(() => {
        loadDataCallback();
    }, [loadDataCallback]);
    
    // update the date when reloading the app.
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            const n = new Date();
            setNow( n );
            setShowDate( n );
//            console.log('AppState', nextAppState);
            
            return () => {
                subscription.remove();
            };
        });
    }, []);
    
    const datePlus = () => {
        setShowDate( dateUtil.addDays(showDate,1) );
    }
    const dateMinus = () => {
        setShowDate( dateUtil.addDays(showDate,-1) );
    }
    const dateScreenName = dateUtil.isSameDayLocally( showDate, now ) ? "Today" : dateUtil.displayDate( showDate )
        
    return <GlobalContext.Provider value={ {
        now: now,
        showDate: showDate,
        todos: todos,
        setTodos: setTodos,
        tasks: tasks,
        setRecentTasks: setRecentTasks
    } } >
    <NavigationContainer>
    <Tab.Navigator>
    <Tab.Screen name={dateScreenName} component={TodayScreen} options={{
    headerRight: () => (
      <Button
        onPress={datePlus}
        title=">"
        color="#000"
      /> ),
    headerLeft: () => (
      <Button
        onPress={dateMinus}
        title="<"
        color="#000"
      /> ),
  }} />
    <Tab.Screen name="Analysis" component={AnalysisScreen} />
    <Tab.Screen name="Edit Todo" component={EditScreen} />
    </Tab.Navigator>
    </NavigationContainer>
    </GlobalContext.Provider>
}

const editTasksStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        alignItems: 'center'
    },
    scrollView: {
        margin: 0,
        padding: 0,
        borderColor: "red",
        borderWidth: 0,
        width: "100%",
        flex: 1,
        flexDirection: "column",
    },
});
