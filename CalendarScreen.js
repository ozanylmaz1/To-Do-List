import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './styles';

const STORAGE_KEY = '@todo_list_data';

// Türkçe tarih formatı
const formatDate = (date) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('tr-TR', options);
};

const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

// Takvim Ana Sayfası
export function CalendarMainScreen({ navigation }) {
    const [todos, setTodos] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // AsyncStorage'dan verileri yükle
    const loadTodos = useCallback(async () => {
        try {
            const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedTodos) {
                const parsedTodos = JSON.parse(storedTodos);
                console.log('Takvim sayfasında yüklenen görevler:', parsedTodos.length);
                setTodos(parsedTodos);
            }
        } catch (error) {
            console.error('Veriler yüklenirken hata:', error);
        }
    }, []);

    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    // Sayfa odaklandığında verileri yeniden yükle
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadTodos();
        });

        return unsubscribe;
    }, [navigation, loadTodos]);

    // Ayın günlerini hesapla
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();
        
        const days = [];
        
        // Önceki ayın günleri
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({ date: prevDate, isCurrentMonth: false });
        }
        
        // Bu ayın günleri
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            days.push({ date: currentDate, isCurrentMonth: true });
        }
        
        // Sonraki ayın günleri (42 günlük grid için)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({ date: nextDate, isCurrentMonth: false });
        }
        
        return days;
    };

    // Belirli bir günde görev var mı kontrol et
    const hasTodosOnDate = (date) => {
        const hasTodos = todos.some(todo => {
            if (!todo.dueDate) return false;
            const todoDate = new Date(todo.dueDate);
            const dateString = todoDate.toDateString();
            const checkDateString = date.toDateString();
            return dateString === checkDateString;
        });
        return hasTodos;
    };

    // Bugün mü kontrol et
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Belirli bir günün görevlerini getir
    const getTodosForDate = (date) => {
        const filteredTodos = todos.filter(todo => {
            if (!todo.dueDate) return false;
            const todoDate = new Date(todo.dueDate);
            const dateString = todoDate.toDateString();
            const checkDateString = date.toDateString();
            return dateString === checkDateString;
        });
        console.log(`Gün ${date.toDateString()} için görevler:`, filteredTodos.length);
        return filteredTodos;
    };

    // Gün seç
    const selectDate = (date) => {
        setSelectedDate(date);
        const todosForDate = getTodosForDate(date);
        console.log('Seçilen gün için görevler:', todosForDate);
        if (todosForDate.length > 0) {
            navigation.navigate('DayDetail', { 
                date: date.toISOString(), 
                todos: todosForDate,
                dateString: formatDate(date)
            });
        } else {
            Alert.alert('Bilgi', 'Bu günde görev bulunmuyor.');
        }
    };

    // Ay değiştir
    const changeMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        if (direction === 'next') {
            newMonth.setMonth(newMonth.getMonth() + 1);
        } else {
            newMonth.setMonth(newMonth.getMonth() - 1);
        }
        setCurrentMonth(newMonth);
    };

    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            <View style={styles.header}>
                <Text style={styles.title}>Takvim</Text>
            </View>

            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
                    <Icon name="chevron-left" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{monthName}</Text>
                <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
                    <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                    <Text key={day} style={styles.weekDay}>{day}</Text>
                ))}
            </View>

            <View style={styles.calendarGrid}>
                {days.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.calendarDay,
                            !day.isCurrentMonth && styles.otherMonthDay,
                            day.date.toDateString() === selectedDate.toDateString() && styles.selectedDay,
                            hasTodosOnDate(day.date) && styles.hasTodosDay,
                            isToday(day.date) && styles.todayDay,
                        ]}
                        onPress={() => selectDate(day.date)}
                    >
                        <Text style={[
                            styles.dayText,
                            !day.isCurrentMonth && styles.otherMonthText,
                            day.date.toDateString() === selectedDate.toDateString() && styles.selectedDayText,
                            isToday(day.date) && styles.todayText,
                        ]}>
                            {day.date.getDate()}
                        </Text>
                        {hasTodosOnDate(day.date) && (
                            <View style={styles.todoIndicator} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.calendarFooter}>
                <Text style={styles.calendarFooterText}>
                    Seçili gün: {formatDate(selectedDate)}
                </Text>
                <Text style={styles.calendarFooterText}>
                    Bu günde {getTodosForDate(selectedDate).length} görev var
                </Text>
            </View>
        </SafeAreaView>
    );
}

// Gün Detay Sayfası
export function DayDetailScreen({ route, navigation }) {
    const { date, todos, dateString } = route.params;
    
    // Görevi düzenleme fonksiyonu (TodoScreen'e yönlendir)
    const editTodo = (todo) => {
        navigation.navigate('TodoList', { editTodo: todo });
    };

    // Kategori rengini al
    const getCategoryColor = (todo) => {
        return todo.categoryColor || '#95A5A6';
    };

    const getCategoryIcon = (todo) => {
        return todo.categoryIcon || 'more-horiz';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.title}>{dateString}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.todoList} showsVerticalScrollIndicator={false}>
                {todos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="event" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Bu günde görev yok</Text>
                    </View>
                ) : (
                    todos.map((todo) => (
                        <View key={todo.id} style={[styles.todoItem, { backgroundColor: todo.backgroundColor }]}>
                            <View style={styles.todoContent}>
                                <View style={styles.todoTextContainer}>
                                    <Icon
                                        name={todo.completed ? 'check-circle' : 'radio-button-unchecked'}
                                        size={24}
                                        color={todo.color}
                                        style={styles.checkIcon}
                                    />
                                    <View style={styles.todoTextWrapper}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                            <Icon 
                                                name={getCategoryIcon(todo)} 
                                                size={16} 
                                                color={getCategoryColor(todo)} 
                                                style={{ marginRight: 8 }}
                                            />
                                            <Text style={[styles.categoryText, { color: getCategoryColor(todo) }]}>
                                                {todo.categoryName || 'Diğer'}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[
                                                styles.todoText,
                                                { color: todo.color },
                                                todo.completed && styles.completedText,
                                            ]}
                                        >
                                            {todo.text}
                                        </Text>
                                        <Text style={[styles.dueDateText, { color: todo.color }]}>
                                            <Icon name="schedule" size={14} color={todo.color} /> {formatTime(new Date(todo.dueDate))}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.todoActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => editTodo(todo)}
                                    >
                                        <Icon name="edit" size={20} color={todo.color} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
