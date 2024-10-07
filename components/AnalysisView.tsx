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
    Pressable,
} from 'react-native';

import { Dimensions, DataSet, LineDataItem } from 'react-native';

import { LineChart } from "react-native-gifted-charts";

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- local imports
import * as dateUtil from "../util/dateUtil"
// db and models
import * as dbutil from "../models/dbutil"
import {newTodo,TodoItem,period} from "../models/todo"
import {newTask,TaskItem} from "../models/tasks"
// views
import { GlobalContext } from "../context"

const colors = [
    "red",
    "orange",
    "green",
    "blue",
    "violet",
    "brown",
    "black",
];

function deepEqual(obj1, obj2) {

    if(obj1 === obj2) // it's just the same object. No need to compare.
        return true;

    if(isPrimitive(obj1) && isPrimitive(obj2)) // compare primitives
        return obj1 === obj2;

    if(Object.keys(obj1).length !== Object.keys(obj2).length)
        return false;

    // compare objects with same number of keys
    for(let key in obj1)
    {
        if(!(key in obj2)) return false; //other object doesn't have this prop
        if(!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

//check if value is primitive
function isPrimitive(obj)
{
    return (obj !== Object(obj));
}

function getTaskForDay( tasks, day ):TaskItem {
//    console.log( JSON.stringify(tasks,null,2) );
    for( idx in tasks ) {
        if( dateUtil.isSameDayLocally( tasks[idx].created, day ) )
            return tasks[idx]
    }
    return null;
}

function isShowingTodo( todo, todosShowing ) {
    let showing = true
    if( todo.id in todosShowing ) {
        showing = todosShowing[todo.id]
    }
    return showing
}

function TodoShowToggle({navigation,todo,idx,todosShowing,setTodosShowing}) {
    let showing = isShowingTodo( todo, todosShowing )
    
    const toggleVisibility = () => {
        let newTodosShowing = JSON.parse(JSON.stringify(todosShowing));
        newTodosShowing[todo.id] = !isShowingTodo(todo,todosShowing)
        setTodosShowing(newTodosShowing)
    }
    
    const color = colors[idx%colors.length]
    let style = [];
    if( showing )
        style = [styles.togglePressableShowing, {backgroundColor: color, borderColor: color }]
    else
        style = [styles.togglePressableHidden]
    
    return <Pressable
        style={style}
        onPress={toggleVisibility}>
            <Text style={showing?styles.toggleTextShowing:styles.toggleTextHiddent}>{todo.title}</Text>
    </Pressable>
}

export function AnalysisView({navigation}): React.JSX.Element {
    const context = useContext(GlobalContext);
    const todos = context.todos;
    const tasks = context.tasks;
    const now = new Date();
    const [todosShowing,setTodosShowing] = useState({});
    
//    console.log("refreshing analysis")
    
    let chartData:Array<DataSet> = [];

    let trackIndex = 0;
    let colorIndex = 0;
    todos.forEach( (t,i) => {
        const show = isShowingTodo( t, todosShowing );
        
        let color = colors[colorIndex]
        colorIndex = ( colorIndex + 1 ) % colors.length
        
//        if( !show ) {
//            return;
//        }
        
        let ts = []
        for( let j=-6; j<=0; ++j ) {
            ts.push( getTaskForDay( tasks[t.id], dateUtil.addDays( now, j ) ) )
        }
        if( t.period === period.DAILY || t.period === period.WEEKLY  || t.period === period.MOTHLY ) {
            const a = ts.map( (task,idx) => {
                return {
                    todo: t,
                    task: task,
                    value: -1-trackIndex,
                    hideDataPoint: task === null,
                    dataPointColor: show ? ( task ? "green" : "red" ) : "#00000000",
                    dataPointRadius: 5,
                    dow: dateUtil.displayDate(dateUtil.addDays( now, -6+idx )),
                }
            } ) ;
            chartData.push( {
                data:a,
                color:show?color:"#00000000",
                thickness: 3,
            } );
            ++trackIndex;
        } else if( t.period === period.DAILY_TRACKER ) {
            const a = ts.map( (task) => {
                console.log( (task&&task.value)?task.value:0 )
                return {
                    todo: t,
                    task: task,
                    value: (task&&task.value)?task.value:0,
                    hideDataPoint: task === null,
                    dataPointColor: show ? ( t ? "green" : "red" ) : "#00000000",
                    dataPointRadius: 5,
                }
            } );
            chartData.push( {
                data:a,
                thickness: 3,
                color:show?color:"#00000000",
            } );
        }
    } );
    
//    const [mChartData,setChartData] = useState(chartData)
//    if( !deepEqual(mChartData,chartData) ) {
//        setChartData(chartData)
//    }

    //hideYAxisText
    return <View style={styles.container} >
                <View style={styles.chartAndRangeContainer} >
                    <View style={styles.chartContianer}>
                        <LineChart
//                            style={styles.chart}
                            spacing={(Dimensions.get('window').width * 0.7)/10}
                            width={Dimensions.get('window').width * 0.7}
                            dataSet={chartData}
                            yAxisThickness={0}
    pointerConfig={{
                  pointerStripUptoDataPoint: false,
                  pointerStripColor: 'transparent',
                    pointerStripHeight: 20,
                  pointerStripWidth: 2,
    pointerColor: 'yellow',
                  radius: 4,
                  pointerLabelWidth: 300,
                  pointerLabelHeight: 100,
    autoAdjustPointerLabelPosition: false,
                  pointerLabelComponent: items => {
                      return <PointerLabel items={items} todosShowing={todosShowing}/>
                  },
                }}
                        />
                    </View>
                <View style={styles.rangeSelector} />
            </View>
            <View style={styles.sidebar}>
                <View style={styles.dataSelector}>
                    {todos.map( (t,idx) => {
                        return <TodoShowToggle key={t.id} todo={t} idx={idx} todosShowing={todosShowing} setTodosShowing={setTodosShowing}/>
                    } ) }
                </View>
            </View>
    </View>
}

function PointerLabel({items,todosShowing}) {
    let showItems = items.filter( (item) => {
//        console.log( item )
        return isShowingTodo( item.todo, todosShowing )
    })
    const toDisplayValue = (item) => {
        if( item.todo.period == period.DAILY_TRACKER ) {
            return item.todo.title + ": " + ( item.task ? item.task.value : "Not Recorded" )
        } else {
            return item.todo.title + ": " + ( item.task ? "✔︎" : "❌" )
        }
    }
    if( showItems.length == 0 ) {
        return <View
          style={{
            height: 120,
            width: 100,
            backgroundColor: '#282C3E',
            borderRadius: 4,
            justifyContent:'center',
            padding: 6,
          }}>
        <Text style={{color: 'lightgray',fontSize:14}}>No Data</Text>
        </View>
    }
    return <View
      style={{
        height: 120,
        width: 100,
        backgroundColor: '#282C3E',
        borderRadius: 4,
        
        padding: 6,
      }}>
    <Text style={{color: 'lightgray',fontWeight:"bold",fontSize:8,marginTop:0,marginBottom:5}}>{items[0].dow}</Text>
    { showItems.map( (item) => {
        return <Text key={item.todo.id} style={{color: 'lightgray',fontSize:8}}>{toDisplayValue(item)}</Text>
    } ) }
    </View>
}

styles = {
togglePressableShowing: {
    margin: 5,
    borderColor: "black",
    color: "white",
backgroundColor: "black",
    borderWidth: 2,
    borderRadius: 5,
justifyContent: 'center',
alignItems: 'center',
},
togglePressableHidden: {
margin: 5,
borderColor: "grey",
color: "black",
backgroundColor: "grey",
borderWidth: 2,
borderRadius: 5,
justifyContent: 'center',
alignItems: 'center',
},
    toggleTextShowing: {
        color: "white"
    },
    toggleTextHiddent: {
        color: "black"
    },
container: {
    borderColor: "red",
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
},
chartAndRangeContainer: {
    height: "100%",
    flex: 1,
flexDirection: "column",
borderColor: "yellow",
borderWidth: 3,
},
sidebar:{
    maxWidth: 130,
    height: "100%",
    flex: 1,
borderColor: "green",
borderWidth: 1,
},
dataSelector:{
borderColor: "blue",
borderWidth: 1,
    height: "100%",
    flexDirection: "column",
},
chartContianer:{
    height: "90%",
borderColor: "cyan",
borderWidth: 1,
    overflow: "hidden",
},
chart: {
    width: 100,
},
rangeSelector:{
borderColor: "black",
borderWidth: 1,
    height: "10%",
},
}
