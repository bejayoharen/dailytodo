import React from 'react';
import type {PropsWithChildren} from 'react';
import {
    SafeAreaView,
    ScrollView,
    Button,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    Pressable,
    View,
} from 'react-native';

import Svg, {
    Path,
    Circle,
    Rect,
    Text as SvgText,
} from 'react-native-svg';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';

import * as dateUtil from "../util/dateUtil"
import {TodoItem,period,periodSortOrder} from "../models/todo"
import {TaskItem} from "../models/tasks"

export function TodayView({navigation, todos, tasks, now, showDate, toggleCompleted, onCompleted, onUncompleted, updateTracker}): React.JSX.Element {
    if( todos.length == 0 ) {
        return <View style={todoViewStyle.createButtonContainer}><Button style={todoViewStyle.createButton} title="Create your first todo"
            onPress={() => navigation.navigate("Edit Todo")} /></View>
    }
    
    
    todos = todos.sort( (a,b) => { //list daily, then daily trackers, then weekly then monthly
        return periodSortOrder(a.period) - periodSortOrder(b.period)
    } )
    return <View style={todoViewStyle.listContainer}>
    {todos.map( (t) => {
        const mytasks = tasks[t.id];
        return <TodoStatus key={t.id} showDate={showDate} todo={t} tasks={tasks[t.id]} onCompleted={onCompleted} onUncompleted={onUncompleted} tasks={mytasks} updateTracker={updateTracker} />
    } ) }
    </View>
}

function TodoStatus({todo,showDate,tasks,onCompleted,onUncompleted,updateTracker}): React.JSX.Element {
    let frequencyText = "Do Every Day"
    if( todo.period === period.DAILY_TRACKER ) {
        frequencyText = "Track Every Day"
    } else if( todo.period === period.WEEKLY ) {
        frequencyText = todo.frequency + "x per week"
    } else if( todo.period === period.MONTHLY ) {
        frequencyText = todo.frequency + "x per month"
    }
    
    //find out if the current one is completed:
    // it's considered complete if it's been done today.
    let isComplete = false;
    let completeTask = null;
    if( tasks ) {
        for( tsk in tasks ) {
            if( dateUtil.isSameDayLocally(tasks[tsk].created,showDate) ) {
                isComplete = true;
                completeTask = tasks[tsk];
            }
        }
    }
    if( todo.period === period.DAILY ) {
        frequencyText = isComplete ? "Done!" : "Need to do!"
    }
    //for weekly events and monthly events, figure out which ones are done:
    let weeklyComplete = []
    let dow = showDate.getDay()
    let daysDone = 0;
    if( todo.period === period.WEEKLY ) {
        const sow = dateUtil.addDays( showDate, -dow ) //start of week
        for( i = 0; i<7; ++i ) {
            let d = false;
            if( tasks ) {
                for( tsk in tasks ) {
                    if( dateUtil.isSameDayLocally(tasks[tsk].created,dateUtil.addDays(sow,i)) ) {
                        d = true;
                    }
                }
            }
            weeklyComplete.push(d)
            if( d ) ++daysDone;
        }
        frequencyText = "Completed " + daysDone + " of " + todo.frequency + " for the week.\n" + Math.floor(100*daysDone/todo.frequency + .5) + "% of weekly goal."
    }
    
    let monthlyComplete = []
    let dom = showDate.getDate()
    if( todo.period === period.MONTHLY ) {
        daysDone = 0;
        const som = dateUtil.addDays( showDate, -dom ) //start of week
//        console.log( now.getMonth()+1, now.getFullYear() )
        let dim = dateUtil.daysInMonth( showDate.getMonth()+1, showDate.getFullYear() )
        for( i = 0; i<dim; ++i ) {
            let d = false;
            if( tasks ) {
                for( tsk in tasks ) {
                    if( dateUtil.isSameDayLocally(tasks[tsk].created,dateUtil.addDays(som,i)) ) {
                        d = true;
                    }
                }
            }
            monthlyComplete.push(d)
            if( d ) ++daysDone;
        }
        frequencyText = "Completed " + daysDone + " of " + todo.frequency + " for the month.\n" + Math.floor(100*daysDone/todo.frequency + .5) + "% of monthly goal."
    }
//    console.log( JSON.stringify( monthlyComplete ) )
    
    
//    console.log( "Todo Status todo:" + JSON.stringify(todo) );
//    console.log( "Todo Status tasks:" + JSON.stringify(tasks)  );

    return <>
    <View style={todoViewStyle.itemContainer}>
    <Pressable style={todoViewStyle.pressable} onPress={ () => { isComplete ? onUncompleted(completeTask) : onCompleted(todo) } } >
    
    <View style={todoViewStyle.top}>
            <View style={todoViewStyle.left}>
            <Text style={todoViewStyle.title}>{todo.title}</Text>
            <Text style={todoViewStyle.description}>{frequencyText}</Text>
            </View>
            <View style={todoViewStyle.right}>
    { todo.period === period.DAILY &&
        <View style={ isComplete ? [todoViewStyle.check,todoViewStyle.checked] : [todoViewStyle.check,todoViewStyle.unchecked]}>
        {!isComplete && <Text style={todoViewStyle.xText}>❌</Text>}
        {isComplete && <Text style={todoViewStyle.checkText}>✔︎</Text>}
        </View>
    }
    { todo.period === period.WEEKLY &&
        <ProgressView amount={daysDone/todo.frequency} />
    }
    { todo.period === period.MONTHLY &&
        <ProgressView amount={daysDone/todo.frequency} />
    }
            </View>
    </View>
    </Pressable>
        {todo.period === period.DAILY_TRACKER && <DailyTrackerBottom todo={todo} tasks={tasks} showDate={showDate} updateTracker={updateTracker} />}
    {todo.period === period.WEEKLY && <WeeklyBottom dow={dow} weeklyComplete={weeklyComplete} />}
    {todo.period === period.MONTHLY && <MonthlyBottom dom={dom} monthlyComplete={monthlyComplete} />}
    </View>
    </>
}

function ProgressView({amount}) {
    //backgroundColor: "#ff9999",
    //backgroundColor: "#55cc55",
    const sw = "10" //stroke width
    const radius = 50 - sw/2
    // arc point a
    const ax = 100/2
    const ay = sw/2
    // arc point b
    const bx = 50 + radius*Math.sin(amount*2*Math.PI) //100-sw/2
    const by = 50 - radius*Math.cos(amount*2*Math.PI) //50
    
    const arcPath = "M " + ax + " " + ay + " A " + radius + " " + radius + (amount <= .5 ? " 0 0 1 " : " 0 1 1 " ) + bx + " " + by
    
    let progressColor1 = "white"
    let progressColor2 = "white"
    {
        let r = amount;
        if( r > 1 ) r = 1;
        if( r < 0 ) r = 0;
        const ir = 1-r;
        progressColor1 = 'rgb(' + ((0xff)*ir + (0x55)*r) + ',' + ((0x99)*ir + (0xcc)*r) + ',' + ((0x99)*ir + (0x55)*r) + ')'
        progressColor2 = "#070"; //'rgb(' + ((0xff)*ir + (0x00)*r) + ',' + ((0x00)*ir + (0xff)*r) + ',' + ((0x00)*ir + (0x00)*r) + ')'
    }
    
    return <View style={[
        todoViewStyle.percentComplete,
    ]}><Svg height="100%" width="100%" viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="50" fill={progressColor1} />
    { amount != 1 && <>
        <Path d={arcPath} fill="none" stroke={progressColor2} strokeWidth={sw} />
        <Circle cx={ax} cy={ay} r={sw/2} fill={progressColor2} />
        <Circle cx={bx} cy={by} r={sw/2} fill={progressColor2} />
        <Path d={arcPath} fill="none" stroke="white" strokeWidth="2" />
        </>
    }
    { amount >= 1 && <>
        <Circle cx="50" cy="50" r={radius} stroke={progressColor2} strokeWidth={sw} fill="none" />
        <Circle cx="50" cy="50" r={radius} stroke="white" strokeWidth="2" fill="none" />
        </>
    }
    <SvgText fill="black"
    fontSize="20"
    x="50"
    y="56"
    textAnchor="middle">{Math.floor(100*amount + .5) + "%"}</SvgText>
  </Svg>
</View>
}

function DailyTrackerBottom({todo,tasks,showDate,updateTracker}): React.JSX.Element {
    let todaysTask = null;
    let val = Math.floor( ( todo.rangeMin + todo.rangeMax ) / 2 )
    for( i in tasks ) {
        if( dateUtil.isSameDayLocally( tasks[i].created, showDate ) ) {
            todaysTask = tasks[i]
            val = todaysTask.value
        }
    }

    const isSet = todaysTask != null && todaysTask.value != null
    
    const progress = useSharedValue(val);
    const min = useSharedValue(todo.rangeMin);
    const max = useSharedValue(todo.rangeMax);
    
    const tintColor = isSet ? "#55cc55" : "#ff9999"
    
    return <View style={todoViewStyle.week}>
    <GestureHandlerRootView style={{ flex: 1 , padding: 5 }}>
    <Slider
        style={{
            borderColor: "blue",
            color: "green",
            borderWidth: 0,
        }}
        theme={{
            disableMinTrackTintColor: '#aaa',
            maximumTrackTintColor: tintColor,
            minimumTrackTintColor: tintColor,
            cacheTrackTintColor: '#333',
            bubbleBackgroundColor: '#666',
            heartbeatColor: '#999',
          }}

        step={todo.rangeMax - todo.rangeMin}
        snapToStep={true}
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        onSlidingComplete={(n) => updateTracker( todo, todaysTask, n ) }
    />
        </GestureHandlerRootView>
    </View>
}
        
function MonthlyBottom({dom,monthlyComplete}): React.JSX.Element {
//    return <View><Text>MBM</Text></View>
    const m = [ [todoViewStyle.day,todoViewStyle.dayf] ]
    for( i=0; i<monthlyComplete.length - 2; ++i ) {
        m.push( [todoViewStyle.day] )
    }
    m.push( [todoViewStyle.day,todoViewStyle.dayl] )

    //setup borders:
//    console.log( m.length )
//    console.log( dom )
    
    if( dom > 0 ) {
        m[dom-1].push(todoViewStyle.today)
    }
    if( dom > 1 ) {
        m[dom-2].push(todoViewStyle.beforetoday)
    }
    // mark complete ones
    for( i = 0; i<monthlyComplete.length; ++i ) {
        if( monthlyComplete[i] )
            m[i].push(todoViewStyle.todayDone)
    }
    
    return <View style={todoViewStyle.week}>
    { m.map( (s,idx) => {
        return <View key={idx} style={s} ><Text style={todoViewStyle.monthdaytext}>{idx+1}</Text></View>
    })}
    </View>
}

function WeeklyBottom({dow,weeklyComplete}): React.JSX.Element {
    const w = [
        [todoViewStyle.day,todoViewStyle.dayf],
        [todoViewStyle.day],
        [todoViewStyle.day],
        [todoViewStyle.day],
        [todoViewStyle.day],
        [todoViewStyle.day],
        [todoViewStyle.day,todoViewStyle.dayl]
    ];

    //setup borders:
    w[dow].push(todoViewStyle.today)
    if( dow > 0 ) {
        w[dow-1].push(todoViewStyle.beforetoday)
    }
    // mark complete ones
    for( i = 0; i<7; ++i ) {
        if( weeklyComplete[i] )
            w[i].push(todoViewStyle.todayDone)
    }
    
    return <View style={todoViewStyle.week}>
    <View key="0" style={w[0]}><Text style={todoViewStyle.weekdaytext}>Su</Text></View>
    <View key="1" style={w[1]}><Text style={todoViewStyle.weekdaytext}>Mo</Text></View>
    <View key="2" style={w[2]}><Text style={todoViewStyle.weekdaytext}>Tu</Text></View>
    <View key="3" style={w[3]}><Text style={todoViewStyle.weekdaytext}>We</Text></View>
    <View key="4" style={w[4]}><Text style={todoViewStyle.weekdaytext}>Th</Text></View>
    <View key="5" style={w[5]}><Text style={todoViewStyle.weekdaytext}>Fr</Text></View>
    <View key="6" style={w[6]}><Text style={todoViewStyle.weekdaytext}>Sa</Text></View>
    </View>
}



todoViewStyle = StyleSheet.create({
createButton: {
},
createButtonContainer: {
width: "100%",
flexDirection: "column",
borderStyle: "solid",
borderColor: "cyan",
    borderWidth: 0,
    padding: 7,
    marginTop: 100,
//alignItems: 'left',
alignItems: 'center',
},
listContainer: {
width: "100%",
flexDirection: "column",
borderStyle: "solid",
borderColor: "cyan",
    borderWidth: 0,
    padding: 7,
//alignItems: 'left',
alignItems: 'center',
},
pressable: {
width: "100%",
},
itemContainer: {
    width: "100%",
    alignItems: "stretch",
flexDirection: "column",
borderStyle: "solid",
borderColor: "green",
alignItems: 'center',
borderWidth: 0,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    padding: 7,
//    marginHorizontal: '5%',
alignItems: 'left',
//marginLeft: 10,
//marginRight: 10,
marginTop: 8,
//marginBottom: 0,
},
top: {
borderStyle: "solid",
borderColor: "red",
borderWidth: 0,
flexDirection: "row",
},
left: {
flexGrow: 1,
    flexShrink: 1,
borderStyle: "solid",
borderColor: "blue",
borderWidth: 0,
},
right: {
width: 60,
borderStyle: "solid",
borderColor: "green",
borderWidth: 0,
alignItems: 'center',
},
bottom: {
borderStyle: "solid",
borderColor: "cyan",
borderWidth: 0,
    borderRadius: 7,
    marginTop: 3,
//height: 25,
width: "100%",
},
weekdaytext: {
    margin:"auto",
    color: "white",
    fontSize: 10,
},
monthdaytext: {
    margin:"auto",
    color: "white",
    fontSize: 7,
},
week: {
    width: "100%",
    borderColor: "#f00",
    borderWidth: 0,
    flexDirection: "row",
marginTop: 10,
},
dayf: {
borderTopLeftRadius: 10,
borderBottomLeftRadius: 10,
borderLeftWidth: 1,
},
dayl: {
borderTopRightRadius: 10,
borderBottomRightRadius: 10,
},
day: {
    flexGrow: 1,
    alignItems: "Center",
    borderLeftWidth: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    borderLeftWidth: 0,
    height: 20,
    backgroundColor: "#666",
},
beforetoday: {
    borderRightWidth: 0,
},
today: {
    flexGrow: 1,
    
    borderLeftWidth: 1,
    borderColor: "orange",
    borderWidth: 2,
    borderLeftWidth: 2,
    height: 20,
    backgroundColor: "#666",
},
todayDone: {
backgroundColor: "#55cc55",
},
check: {
    width: 50,
    height: 50,
    backgroundColor: "#ff9999",
    borderRadius: 25,
alignItems: 'center',
},
checked: {
backgroundColor: "#55cc55",
},
unchecked: {
    
},
checkText: {
    marginTop: "auto",
    marginBottom: "auto",
fontSize: 25,
    color: "white",
},
xText: {
marginTop: "auto",
marginBottom: "auto",
fontSize: 25,
},
percentComplete: {
width: 50,
height: 50,
//    borderColor: "balck",
//    borderWidth: 1,
//marginLeft: 10,
marginRight: 10,
margin: 5,
},
percentCompleteText: {
marginTop: "auto",
marginBottom: "auto",
    color: "black",
fontSize: 10,
},
title: {
    fontSize: 20,
    fontStyle: "bold",
},
description: {
    marginTop: 7,
    color: "#777777",
},

});

checkBaseStyle = {
width: 15,
height: 15,
marginLeft: 10,
marginRight: 10,
margin: 5,
borderWidth: 2,
borderRadius: 3
};
checkCheckedStyle = StyleSheet.create( { ...checkBaseStyle,
borderColor: "green",
backgroundColor: "green",
} )
checkUncheckedStyle = StyleSheet.create( { ...checkBaseStyle,
borderColor: "grey",
} )

pressableStyle = StyleSheet.create({
borderColor: "black",
borderWidth: 0,
flex: 1,
flexDirection: "row",
alignItems: "center"
});

