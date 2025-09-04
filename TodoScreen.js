import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, SafeAreaView, Modal, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { styles } from './styles';

// Renk paleti - performans için sabit tanımlanmış
const COLOR_PALETTE = [
    { id: 1, name: 'Kırmızı', color: '#FF6B6B', backgroundColor: '#FFE5E5' },
    { id: 2, name: 'Yeşil', color: '#4ECDC4', backgroundColor: '#E5F9F6' },
    { id: 3, name: 'Mavi', color: '#45B7D1', backgroundColor: '#E5F4F8' },
    { id: 4, name: 'Turuncu', color: '#FFA07A', backgroundColor: '#FFF5E6' },
    { id: 5, name: 'Mor', color: '#9B59B6', backgroundColor: '#F4E5F7' },
    { id: 6, name: 'Pembe', color: '#FF69B4', backgroundColor: '#FFE5F0' },
    { id: 7, name: 'Sarı', color: '#F1C40F', backgroundColor: '#FEF9E7' },
    { id: 8, name: 'Gri', color: '#95A5A6', backgroundColor: '#F5F5F5' },
];

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

// Tarih seçenekleri
const DATE_OPTIONS = [
    { id: 'today', label: 'Bugün', value: 'today' },
    { id: 'tomorrow', label: 'Yarın', value: 'tomorrow' },
    { id: 'custom', label: 'Diğer', value: 'custom' },
    { id: 'none', label: 'Tarih Yok', value: 'none' },
];

// Kategori seçenekleri
const CATEGORIES = [
    { id: 'work', name: 'İş', color: '#4ECDC4', icon: 'work' },
    { id: 'personal', name: 'Kişisel', color: '#FF6B6B', icon: 'person' },
    { id: 'shopping', name: 'Alışveriş', color: '#45B7D1', icon: 'shopping-cart' },
    { id: 'health', name: 'Sağlık', color: '#9B59B6', icon: 'favorite' },
    { id: 'study', name: 'Eğitim', color: '#F1C40F', icon: 'school' },
    { id: 'home', name: 'Ev', color: '#FFA07A', icon: 'home' },
    { id: 'other', name: 'Diğer', color: '#95A5A6', icon: 'more-horiz' },
];

// Durum filtreleme seçenekleri
const STATUS_OPTIONS = [
    { id: 'all', name: 'Tümü', icon: 'list' },
    { id: 'completed', name: 'Tamamlanan', icon: 'check-circle' },
    { id: 'pending', name: 'Bekleyen', icon: 'pending' },
];

export default function TodoScreen({ navigation, route }) {
    const [todos, setTodos] = useState([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDateOption, setSelectedDateOption] = useState('today');
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [isCategoryPickerVisible, setIsCategoryPickerVisible] = useState(false);
    const [filterCategory, setFilterCategory] = useState('all');
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    
    // Yeni arama ve filtreleme state'leri
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // AsyncStorage'dan verileri yükle
    const loadTodos = useCallback(async () => {
        try {
            const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedTodos) {
                setTodos(JSON.parse(storedTodos));
            }
        } catch (error) {
            console.error('Veriler yüklenirken hata:', error);
        }
    }, []);

    // AsyncStorage'a verileri kaydet
    const saveTodos = useCallback(async (newTodos) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
        } catch (error) {
            console.error('Veriler kaydedilirken hata:', error);
        }
    }, []);

    // Uygulama başladığında verileri yükle
    useEffect(() => {
        loadTodos();
    }, [loadTodos]);

    // Route parametrelerini kontrol et (düzenleme için)
    useEffect(() => {
        if (route.params?.editTodo) {
            editTodo(route.params.editTodo);
            // Parametreyi temizle
            navigation.setParams({ editTodo: undefined });
        }
    }, [route.params?.editTodo]);

    // Tarih seçeneklerini işle
    const handleDateOptionSelect = (option) => {
        setSelectedDateOption(option);
        
        if (option === 'today') {
            const today = new Date();
            setSelectedDate(today);
            // Bugün seçildiğinde saat seçiciyi göster
            setShowTimePicker(true);
        } else if (option === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow);
            // Yarın seçildiğinde saat seçiciyi göster
            setShowTimePicker(true);
        } else if (option === 'custom') {
            setShowDatePicker(true);
        } else if (option === 'none') {
            setSelectedDate(null); // Tarih yoksa null olarak ayarla
        }
        
        setIsDateModalVisible(false);
    };

    // Tarih değişikliğini işle
    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            // Tarih seçildikten sonra saat seçiciyi göster
            setShowTimePicker(true);
        }
    };

    // Saat değişikliğini işle
    const handleTimeChange = (event, time) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (time && selectedDate) {
            const newDateTime = new Date(selectedDate);
            newDateTime.setHours(time.getHours());
            newDateTime.setMinutes(time.getMinutes());
            setSelectedDate(newDateTime);
        }
    };

    // Yeni görev ekle
    const addTodo = useCallback(async () => {
        if (newTodoText.trim()) {
            const newTodo = {
                id: Date.now().toString(),
                text: newTodoText.trim(),
                completed: false,
                colorId: selectedColor.id,
                color: selectedColor.color,
                backgroundColor: selectedColor.backgroundColor,
                categoryId: selectedCategory.id,
                categoryName: selectedCategory.name,
                categoryColor: selectedCategory.color,
                categoryIcon: selectedCategory.icon,
                createdAt: new Date().toISOString(),
                dueDate: selectedDate ? selectedDate.toISOString() : null, // Tarih yoksa null olarak kaydet
            };

            const updatedTodos = [...todos, newTodo];
            setTodos(updatedTodos);
            saveTodos(updatedTodos);
            
            setNewTodoText('');
            setSelectedDateOption('today');
            setSelectedDate(new Date());
            setShowTimePicker(false);
        }
    }, [newTodoText, selectedColor, selectedCategory, selectedDate, todos, saveTodos]);

    // Görevi tamamla/tamamlanmadı yap
    const toggleTodo = useCallback((id) => {
        const updatedTodos = todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    }, [todos, saveTodos]);

    // Görevi sil
    const deleteTodo = useCallback((id) => {
        Alert.alert(
            'Görevi Sil',
            'Bu görevi silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: () => {
                        const updatedTodos = todos.filter(todo => todo.id !== id);
                        setTodos(updatedTodos);
                        saveTodos(updatedTodos);
                    },
                },
            ]
        );
    }, [todos, saveTodos]);

    // Görevi düzenle
    const editTodo = useCallback((todo) => {
        setNewTodoText(todo.text);
        setSelectedColor(COLOR_PALETTE.find(c => c.id === todo.colorId));
        setSelectedCategory(CATEGORIES.find(c => c.id === todo.categoryId) || CATEGORIES[0]);
        setSelectedDate(todo.dueDate ? new Date(todo.dueDate) : new Date());
        setSelectedDateOption(todo.dueDate ? 'custom' : 'none');
        
        // Mevcut görevi sil
        const updatedTodos = todos.filter(t => t.id !== todo.id);
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
    }, [todos, saveTodos]);

    // Sürükle-bırak ile sıralama
    const handleDragEnd = useCallback(({ data }) => {
        setTodos(data);
        saveTodos(data);
    }, [saveTodos]);

    // Filtrelenmiş görevleri al
    const getFilteredTodos = useCallback(() => {
        let filtered = todos;

        // Kategori filtresi
        if (filterCategory !== 'all') {
            filtered = filtered.filter(todo => todo.categoryId === filterCategory);
        }

        // Durum filtresi
        if (filterStatus === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        } else if (filterStatus === 'pending') {
            filtered = filtered.filter(todo => !todo.completed);
        }

        // Arama filtresi
        if (searchText.trim()) {
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(searchText.toLowerCase()) ||
                todo.categoryName.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return filtered;
    }, [todos, filterCategory, filterStatus, searchText]);



    // Renk seçici bileşeni
    const ColorPicker = ({ onColorSelect, currentColorId }) => (
        <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>Renk Seçin:</Text>
            <View style={styles.colorGrid}>
                {COLOR_PALETTE.map((colorOption) => (
                    <View key={colorOption.id} style={styles.colorItemContainer}>
                        <TouchableOpacity
                            style={[
                                styles.colorOption,
                                { backgroundColor: colorOption.color },
                                currentColorId === colorOption.id && styles.selectedColor,
                            ]}
                            onPress={() => onColorSelect(colorOption)}
                        >
                            {currentColorId === colorOption.id && (
                                <Icon name="check" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                        <Text style={styles.colorName}>{colorOption.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    // Kategori seçici bileşeni
    const CategoryPicker = ({ onCategorySelect, currentCategoryId }) => (
        <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>Kategori Seçin:</Text>
            <View style={styles.colorGrid}>
                {CATEGORIES.map((category) => (
                    <View key={category.id} style={styles.colorItemContainer}>
                        <TouchableOpacity
                            style={[
                                styles.colorOption,
                                { backgroundColor: category.color },
                                currentCategoryId === category.id && styles.selectedColor,
                            ]}
                            onPress={() => onCategorySelect(category)}
                        >
                            {currentCategoryId === category.id && (
                                <Icon name="check" size={20} color="white" />
                            )}
                            <Icon name={category.icon} size={16} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.colorName}>{category.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    // Gelişmiş filtreleme modal
    const AdvancedFilterModal = () => (
        <Modal
            visible={isAdvancedFilterVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsAdvancedFilterVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <ScrollView style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Gelişmiş Filtreleme</Text>
                    
                    {/* Kategori Filtresi */}
                    <Text style={[styles.modalTitle, { fontSize: 16, marginBottom: 10 }]}>Kategori</Text>
                    <TouchableOpacity
                        style={styles.dateOption}
                        onPress={() => {
                            setFilterCategory('all');
                            setIsAdvancedFilterVisible(false);
                        }}
                    >
                        <Text style={styles.dateOptionText}>Tümü</Text>
                        <Icon name="list" size={24} color="#666" />
                    </TouchableOpacity>
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.dateOption}
                            onPress={() => {
                                setFilterCategory(category.id);
                                setIsAdvancedFilterVisible(false);
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name={category.icon} size={20} color={category.color} style={{ marginRight: 10 }} />
                                <Text style={styles.dateOptionText}>{category.name}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}

                    {/* Durum Filtresi */}
                    <Text style={[styles.modalTitle, { fontSize: 16, marginTop: 20, marginBottom: 10 }]}>Durum</Text>
                    {STATUS_OPTIONS.map((status) => (
                        <TouchableOpacity
                            key={status.id}
                            style={styles.dateOption}
                            onPress={() => {
                                setFilterStatus(status.id);
                                setIsAdvancedFilterVisible(false);
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name={status.icon} size={20} color="#666" style={{ marginRight: 10 }} />
                                <Text style={styles.dateOptionText}>{status.name}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setIsAdvancedFilterVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );

    // Filtre seçici modal
    const FilterModal = () => (
        <Modal
            visible={isFilterModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsFilterModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Filtrele</Text>
                    <TouchableOpacity
                        style={styles.dateOption}
                        onPress={() => {
                            setFilterCategory('all');
                            setIsFilterModalVisible(false);
                        }}
                    >
                        <Text style={styles.dateOptionText}>Tümü</Text>
                        <Icon name="list" size={24} color="#666" />
                    </TouchableOpacity>
                    {CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.dateOption}
                            onPress={() => {
                                setFilterCategory(category.id);
                                setIsFilterModalVisible(false);
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name={category.icon} size={20} color={category.color} style={{ marginRight: 10 }} />
                                <Text style={styles.dateOptionText}>{category.name}</Text>
                            </View>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setIsFilterModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Tarih seçici modal
    const DateSelectionModal = () => (
        <Modal
            visible={isDateModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsDateModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Tarih Seçin</Text>
                    {DATE_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.dateOption}
                            onPress={() => handleDateOptionSelect(option.value)}
                        >
                            <Text style={styles.dateOptionText}>{option.label}</Text>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setIsDateModalVisible(false)}
                    >
                        <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Görev bileşeni
    const TodoItem = ({ todo, drag, isActive }) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                style={[
                    styles.todoItem,
                    { backgroundColor: todo.backgroundColor },
                    isActive && { opacity: 0.5 }
                ]}
            >
                <View style={styles.todoContent}>
                    <TouchableOpacity
                        style={styles.todoTextContainer}
                        onPress={() => toggleTodo(todo.id)}
                    >
                        <Icon
                            name={todo.completed ? 'check-circle' : 'radio-button-unchecked'}
                            size={24}
                            color={todo.color}
                            style={styles.checkIcon}
                        />
                        <View style={styles.todoTextWrapper}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                <Icon 
                                    name={todo.categoryIcon || 'more-horiz'} 
                                    size={16} 
                                    color={todo.categoryColor || '#95A5A6'} 
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.categoryText, { color: todo.categoryColor || '#95A5A6' }]}>
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
                            {todo.dueDate ? (
                                <Text style={[styles.dueDateText, { color: todo.color }]}>
                                    <Icon name="schedule" size={14} color={todo.color} /> {formatDate(new Date(todo.dueDate))} - {formatTime(new Date(todo.dueDate))}
                                </Text>
                            ) : (
                                <Text style={[styles.dueDateText, { color: todo.color, opacity: 0.6 }]}>
                                    <Icon name="schedule" size={14} color={todo.color} /> Tarih belirtilmemiş
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.todoActions}>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => editTodo(todo)}
                        >
                            <Icon name="edit" size={20} color={todo.color} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => deleteTodo(todo.id)}
                        >
                            <Icon name="delete" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </ScaleDecorator>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            <View style={styles.header}>
                <Text style={styles.title}>Yapılacaklar Listesi</Text>
            </View>

            {/* Arama Tuşu */}
            <TouchableOpacity
                style={styles.searchToggleButton}
                onPress={() => setIsSearchVisible(!isSearchVisible)}
            >
                <Icon name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Arama Çubuğu */}
            {isSearchVisible && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchRow}>
                        <Icon name="search" size={20} color="#6366F1" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Görev ara..."
                            value={searchText}
                            onChangeText={setSearchText}
                            clearButtonMode="while-editing"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity
                                style={styles.searchClearButton}
                                onPress={() => setSearchText('')}
                            >
                                <Icon name="clear" size={18} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder={newTodoText ? "Görevi düzenle..." : "Yeni görev ekle..."}
                        value={newTodoText}
                        onChangeText={setNewTodoText}
                        onSubmitEditing={addTodo}
                        returnKeyType="done"
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: selectedColor.color }]}
                        onPress={addTodo}
                    >
                        <Icon name={newTodoText ? "check" : "add"} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={styles.colorSelector}
                        onPress={() => setIsColorPickerVisible(!isColorPickerVisible)}
                    >
                        <View style={[styles.colorPreview, { backgroundColor: selectedColor.color }]} />
                        <Text style={styles.colorSelectorText}>Renk: {selectedColor.name}</Text>
                        <Icon name="arrow-drop-down" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.categorySelector}
                        onPress={() => setIsCategoryPickerVisible(!isCategoryPickerVisible)}
                    >
                        <Icon name={selectedCategory.icon} size={20} color={selectedCategory.color} />
                        <Text style={styles.categorySelectorText}>Kategori: {selectedCategory.name}</Text>
                        <Icon name="arrow-drop-down" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={styles.dateSelector}
                        onPress={() => setIsDateModalVisible(true)}
                    >
                        <Icon name="event" size={20} color="#666" />
                        <Text style={styles.dateSelectorText}>
                            {selectedDateOption === 'today' ? 'Bugün' : 
                             selectedDateOption === 'tomorrow' ? 'Yarın' : 
                             selectedDateOption === 'none' ? 'Tarih Yok' : 
                             selectedDate ? formatDate(selectedDate) : 'Tarih Seç'}
                        </Text>
                        <Icon name="arrow-drop-down" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.filterSelector}
                        onPress={() => setIsAdvancedFilterVisible(true)}
                    >
                        <Icon name="filter-list" size={20} color="#666" />
                        <Text style={styles.filterSelectorText}>
                            {filterCategory === 'all' && filterStatus === 'all' 
                                ? 'Filtrele' 
                                : 'Filtreli'}
                        </Text>
                        <Icon name="arrow-drop-down" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {isColorPickerVisible && (
                <ColorPicker
                    onColorSelect={(color) => {
                        setSelectedColor(color);
                        setIsColorPickerVisible(false);
                    }}
                    currentColorId={selectedColor.id}
                />
            )}

            {isCategoryPickerVisible && (
                <CategoryPicker
                    onCategorySelect={(category) => {
                        setSelectedCategory(category);
                        setIsCategoryPickerVisible(false);
                    }}
                    currentCategoryId={selectedCategory.id}
                />
            )}

            <DateSelectionModal />
            <FilterModal />
            <AdvancedFilterModal />

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()} // selectedDate null olabilir
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()} // selectedDate null olabilir
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                />
            )}

            <View style={styles.todoList}>
                {getFilteredTodos().length === 0 ? (
                    <View style={styles.emptyState}>
                        <Icon name="assignment" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {searchText ? 'Arama sonucu bulunamadı' : 
                             filterCategory !== 'all' || filterStatus !== 'all' 
                                ? 'Bu filtrelerde görev yok' 
                                : 'Henüz görev eklenmemiş'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {searchText ? 'Farklı anahtar kelimeler deneyin' : 
                             filterCategory !== 'all' || filterStatus !== 'all'
                                ? 'Filtreleri temizleyin veya yeni görev ekleyin'
                                : 'Yukarıdan yeni görev ekleyebilirsiniz'}
                        </Text>
                    </View>
                ) : (
                    <DraggableFlatList
                        data={getFilteredTodos()}
                        onDragEnd={handleDragEnd}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, drag, isActive }) => (
                            <TodoItem todo={item} drag={drag} isActive={isActive} />
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {getFilteredTodos().length > 0 && (
                <View style={styles.stats}>
                    <Text style={styles.statsText}>
                        {`Gösterilen: ${getFilteredTodos().length} | Toplam: ${todos.length} | Tamamlanan: ${todos.filter(t => t.completed).length}`}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}
