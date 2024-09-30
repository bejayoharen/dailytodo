import React, {useState} from 'react';
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
  Alert,
  Modal,
  TextInput,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import {TodoItem,period} from "../models/todo"

export function EditTodoView({todos, editTodo, createTodo, deleteTodo}): React.JSX.Element {
    const [ modalVisible, setModalVisible ] = useState(false)
    const [ editingTodo, setEditingTodo ] = useState(null)
    const [ taskName, setTaskName ] = useState("New Todo")
    const [ periodState, setPeriodState ] = useState("")
    const [ frequency, setFrequency ] = useState(1)
    const [ min, setMin ] = useState(0)
    const [ max, setMax ] = useState(10)
    
    const onceDaily = todos.filter( (t) => {return t.period === period.DAILY} )
    const weekly = todos.filter( (t) => {return t.period === period.WEEKLY} )
    const monthly = todos.filter( (t) => {return t.period === period.MONTHLY} )
    const dailyTracker = todos.filter( (t) => {return t.period === period.DAILY_TRACKER} )
    
    const onAddTodo = (title: string, period:period, frequency: count, min: min, max:max ) => {
            createTodo( title, period, frequency, min, max).then(
                function() {},
                function(error) {
                    Alert.alert( "Error", "Could not create or store new Todo: " + error)
                    console.error("Error creating new todo: " + error);
                }
            )
    }
    const onDeleteTodo = (id) => {
        return () => {
            Alert.alert('Delete?', 'Are you sure you want to delete this todo? All data associated with it will be gone!', [
                {
                text: 'Cancel',
                style: 'cancel',
                },
                {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteTodo(id).then(
                                                   function() {},
                                                   function(error) {
                                                       Alert.alert( "Error", "Could not delete Todo: " + error)
                                                       console.error("Error creating new todo: " + error);
                                                   }
                                                   )
                },
            ]);
        }
    }
    const onEditTodo = ( editTodo, todo, taskName, frequency, min, max ) => {
        editTodo( todo, taskName, frequency, min, max).then(
            function() {},
            function(error) {
                Alert.alert( "Error", "Could not edit Todo: " + error)
                console.error("Error editing todo: " + error);
            }
        )
    }
    
    
    const requestCreate = (p) => {
        setPeriodState(p);
        setTaskName(p === period.DAILY_TRACKER ? "New Tracker" : "New Todo")
        setFrequency(1);
        setMin(1);
        setMax(10);
        setEditingTodo(null);
        setModalVisible(true);
    }
    
    const requestEditTodo = (todo) => {
        setPeriodState(todo.period);
        setFrequency(todo.frequency)
        setTaskName(todo.title)
        setMin(todo.rangeMin);
        setMax(todo.rangeMax);
        setEditingTodo(todo);
        setModalVisible(true);
    }

    return <>
    <Modal
    animationType="fade"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
        setModalVisible(false);
    }}>
    <View style={modalStyle.centeredView}>
            <View style={modalStyle.modalView}>
    { editingTodo && <Text style={modalStyle.title}>Edit {periodState} {periodState !== period.DAILY_TRACKER && "Todo"}</Text> }
    { !editingTodo && <Text style={modalStyle.title}>Create {periodState} {periodState !== period.DAILY_TRACKER && "Todo"}</Text> }
    <View style={modalStyle.hcontainer}><Text style={modalStyle.label}>Name:</Text><TextInput style={modalStyle.textInput} value={taskName} onChangeText={setTaskName} /></View>
    { (periodState !== period.DAILY && periodState !== period.DAILY_TRACKER) && <ScaleInteger text="Repeats" min={1} max={periodState === period.WEEKLY && 7} initial={frequency} setValue={setFrequency} />}
    { (periodState === period.DAILY_TRACKER) && <ScaleInteger text="Minimum" min={0} max={max-1} initial={min} setValue={setMin} />}
    { (periodState === period.DAILY_TRACKER) && <ScaleInteger text="Maximum" min={min+1} max={100} initial={max} setValue={setMax} />}

    <View style={modalStyle.buttonContainer}>
                <Pressable
                style={[modalStyle.cancelButton]}
                onPress={() => {setModalVisible(false) }}>
                <Text style={modalStyle.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                style={[modalStyle.createButton]}
                onPress={() => {
                    if( editingTodo ) { onEditTodo(editTodo,editingTodo,taskName,frequency,min,max); }
                    else { onAddTodo(taskName,periodState,frequency,min,max); }
                    setModalVisible(false) }}>
    { editingTodo && <Text style={modalStyle.createButtonText}>Save</Text> }
    { !editingTodo && <Text style={modalStyle.createButtonText}>Create</Text> }
                </Pressable>
                </View>
            </View>
    </View>
    </Modal>
    <TodoSection type={period.DAILY} todos={onceDaily} editTodo={requestEditTodo} createTodo={createTodo} onDeleteTodo={onDeleteTodo} requestCreate={requestCreate}/>
    <TodoSection type={period.DAILY_TRACKER} todos={dailyTracker} editTodo={requestEditTodo} createTodo={createTodo} onDeleteTodo={onDeleteTodo} requestCreate={requestCreate}/>
    <TodoSection type={period.WEEKLY} todos={weekly} editTodo={requestEditTodo} createTodo={createTodo} onDeleteTodo={onDeleteTodo} requestCreate={requestCreate}/>
    <TodoSection type={period.MONTHLY} todos={monthly} editTodo={requestEditTodo} createTodo={createTodo} onDeleteTodo={onDeleteTodo} requestCreate={requestCreate}/>
    </>
}

function ScaleInteger({ text, min, max, initial, setValue }) {
    incr = () => {
        if( initial+1 <= max ) {
            setValue( initial+1 )
        }
    }
    decr = () => {
        if( initial-1 >= min ) {
            setValue( initial-1 )
        }
    }
    return <View style={modalStyle.hcontainer} >
    <Text style={modalStyle.label}>{text}</Text>
    <View style={modalStyle.frequencyInputContainer}>
    <Pressable style={[modalStyle.fButton]} onPress={decr}>
    <Text style={modalStyle.fButtonText}>-</Text>
    </Pressable>
    <Text style={modalStyle.frequencyInput}>{initial.toString()}</Text>
    <Pressable style={[modalStyle.fButton]} onPress={incr}>
    <Text style={modalStyle.fButtonText}>+</Text>
    </Pressable>
    </View>
    </View>
}

function TodoSection({todos, type, editTodo, createTodo, onDeleteTodo, requestCreate}): React.JSX.Element {

    const buttonText = type === period.DAILY_TRACKER ? "Add Daily Tracker" : "Add " + type + " Todo"

    return <View style={sectionStyle.section}>
    <Text style={sectionStyle.title}>{type}</Text>
    {todos.map( (t) => {
        return <EditOneTodoView
        key={t.id}
        todo={t}
        editTodo={editTodo}
        onDeleteTodo={onDeleteTodo}
        />} ) }
    <Pressable onPress={()=>requestCreate(type)} style={({pressed})=>[sectionStyle.addPressable]}>
    {({pressed})=>(
                   <Text style={pressed ? sectionStyle.addTextPressed : sectionStyle.addText}>{buttonText}</Text>
                    )}
    </Pressable>
    </View>
}

/*
 */

function EditOneTodoView({todo, editTodo, onDeleteTodo}): React.JSX.Element {
//    console.log( todo.period )
//    console.log( period.DAILY )
//    console.log( todo.period === period.DAILY )
    let frequencyText = "";
    if( todo.period === period.WEEKLY ) {
        frequencyText = todo.frequency + "x per week"
    } else if( todo.period === period.MONTHLY ) {
        frequencyText = todo.frequency + "x per month"
    } else if( todo.period === period.DAILY_TRACKER ) {
        frequencyText = "Track a number every day from " + todo.rangeMin + " to " + todo.rangeMax + "."
    }
    return (<View style={itemStyle.container1}>
            <View style={itemStyle.containerL}>
            <Text style={itemStyle.title}>{todo.title}</Text>
            <Text style={itemStyle.repeatLabel}>{frequencyText}</Text>
            </View>
            <View style={itemStyle.containerR}>
            <Pressable onPress={()=>{editTodo(todo)}} style={({pressed})=> [pressed?itemStyle.editPressablePressed:itemStyle.editPressable]}>
            {({pressed})=> <Text style={pressed?itemStyle.editTextPressed:itemStyle.editText}>Edit</Text>}
            </Pressable>
            <Pressable onPress={onDeleteTodo(todo.id)} style={({pressed})=> [pressed?itemStyle.deletePressablePressed:itemStyle.deletePressable]}>
            {({pressed})=> <Text style={pressed?itemStyle.deleteTextPressed:itemStyle.deleteText}>Delete</Text>}
            </Pressable>
            </View>
        </View> );
}




sectionStyle = StyleSheet.create({
    section: {
//        width: "98%",
        flexDirection: "Column",
        alignItems: 'left',
    
        borderStyle: "solid",
        borderColor: "green",
        borderRadius: 5,
        borderWidth: 0,

        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 8,

        marginTop: 8,
        marginRight: 5,
        marginBottom: 0,
        marginLeft: 5,
        
        backgroundColor: "#dddddd",
    },
    title: {
        width: "100%",
        alignItems: 'left',
        borderStyle: "solid",
        borderColor: "yellow",
        borderWidth: 0,
        marginLeft: 10,
        marginTop: 7,
        marginBottom: 0,
        fontSize: 20,
        fontWeight: "bold"
    },
    addPressable: {
        width: "100%",
        alignItems: "center",
        borderStyle: "solid",
        borderColor: "yellow",
        borderRadius: 0,
        borderWidth: 0,
    },
    addText: {
        marginTop: 8,
        paddingTop: 7,
        paddingRight: 15,
        paddingBottom: 7,
        paddingLeft: 15,
        color: "blue",
        borderStyle: "solid",
        borderColor: "blue",
        borderRadius: 5,
        borderWidth: 2,
        alignItems: "center",
    },
    addTextPressed: {
        marginTop: 8,
        paddingTop: 7,
        paddingRight: 15,
        paddingBottom: 7,
        paddingLeft: 15,
        color: "white",
        borderStyle: "solid",
        borderColor: "blue",
        borderRadius: 5,
        borderWidth: 2,
        alignItems: "center",
        backgroundColor: "blue",
    }
})

itemStyle = StyleSheet.create({
    container1: {
        flexDirection: "row",
        
        borderStyle: "solid",
        borderColor: "#aaaaaa",
        borderRadius: 5,
        borderWidth: 2,
        
        marginTop: 8,
        marginRight: 0,
        marginLeft: 10,
        marginBottom: 0,
    
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 5,
        
        backgroundColor: "#eeeeee"
    },
    containerL: {
        width: "65%",
        flexDirection: "column",
    },
    containerR: {
        width: "30%",
        flexDirection: "column",
    },
    title: {
        color: "#000000"
    },
    repeatLabel: {
        paddingTop: 5,
        color: "#777777"
    },
    editPressable: {
        color: "blue",
        borderColor: "blue",
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 3,
        alignItems: "center",
        marginBottom: 7,
    },
    editText: {
        margin: 2,
        color: "blue",
    },
editPressablePressed: {
    color: "blue",
    borderColor: "blue",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 3,
    alignItems: "center",
    marginBottom: 7,
    backgroundColor: "blue",
},
editTextPressed: {
    margin: 2,
    color: "white",
    backgroundColor: "blue"
},
    deletePressable: {
        borderRadius: 3,
        backgroundColor: "red",
        alignItems: "center",
    },
    deleteText: {
        margin: 2,
        color: "white",
    },
deletePressablePressed: {
    borderRadius: 3,
//    backgroundColor: "red",
    alignItems: "center",
},
deleteTextPressed: {
    margin: 2,
    color: "red",
},
});



const modalStyle = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: "#888888aa",
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 7,
        padding: 15,
        width: "70%",
        maxWidth: 300,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    hcontainer: {
        flexDirection: "row",
        width: "100%",
        margin: 10,
        padding: 0,
        borderColor: "blue",
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContainer: {
        flexDirection: "row",
        width: "100%",
        borderColor: "green",
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButton: {
        borderRadius: 4,
        borderWidth: 0,
        borderColor: '#2196F3',
        padding: 10,
        margin: 5,
        backgroundColor: '#2196F3',
    },
    cancelButton: {
        borderRadius: 4,
        borderWidth: 0,
        padding: 10,
        margin: 5,
        borderColor: '#2196F3',
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cancelButtonText: {
        color: '#2196F3',
        textAlign: 'center',
    },
    title: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
    },
    label: {
        borderColor: "red",
        borderWidth: 0,
    },
    textInput: {
        marginLeft: "auto",
        width: "70%",
        borderColor: "#666666",
        borderWidth: 1,
        borderRadius: 3,
        margin: 2,
        padding: 3
    },
frequencyInput: {
//    width: "100%",
    borderColor: "#666666",
    borderWidth: 1,
    borderRadius: 3,
    margin: 2,
    padding: 3,
    flexGrow: 1,
},
frequencyInputContainer: {
    marginLeft: "auto",
    width: "70%",
    flexDirection: "row",
    borderColor: "red",
    borderWidth: 0,
    borderRadius: 3,
    margin: 2,
    padding: 3,
justifyContent: 'center',
alignItems: 'center',
},
fButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: "white",
    backgroundColor: "grey",
    borderWidth: 1,
    margin: 4,
},
fButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 12,
justifyContent: 'center',
alignItems: 'center',
},
});
