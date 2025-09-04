import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TodoScreen from './TodoScreen';
import { CalendarMainScreen, DayDetailScreen } from './CalendarScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Takvim Stack Navigator
function CalendarStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CalendarMain" component={CalendarMainScreen} />
            <Stack.Screen name="DayDetail" component={DayDetailScreen} />
        </Stack.Navigator>
    );
}

// Ana Uygulama
function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;

                            if (route.name === 'TodoList') {
                                iconName = 'list';
                            } else if (route.name === 'Calendar') {
                                iconName = 'event';
                            }

                            return <Icon name={iconName} size={size} color={color} />;
                        },
                        // Aktif sekme rengi (seçili olan)
                        tabBarActiveTintColor: '#6366F1',
                        // Pasif sekme rengi (seçili olmayan)
                        tabBarInactiveTintColor: '#9CA3AF',
                        // Tab bar arka plan rengi
                        tabBarStyle: {
                            backgroundColor: '#f2f2f2',
                            borderTopColor: '#F3F4F6',
                            borderTopWidth: 0,
                            elevation: 0,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            height: 80,
                            paddingBottom: 8,
                            paddingTop: 8,
                        },
                        // Tab bar etiket rengi
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                            marginTop: 4,
                            fontFamily: 'System',
                        },
                        headerShown: false,
                    })}
                >
                    <Tab.Screen 
                        name="TodoList" 
                        component={TodoScreen} 
                        options={{ title: 'Görevler' }}
                    />
                    <Tab.Screen 
                        name="Calendar" 
                        component={CalendarStack} 
                        options={{ title: 'Takvim' }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}

export default App;