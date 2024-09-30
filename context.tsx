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
} from 'react-native';

import {
    Colors,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- local imports
// db and models
import * as dbutil from "./models/dbutil"
import {newTodo,TodoItem,period} from "./models/todo"
// views
import { TaskView } from "./components/TaskView"
import { EditTodoView } from "./components/EditTodoView"
import { TodayView } from "./components/TodayView"


export const GlobalContext = createContext(null);
