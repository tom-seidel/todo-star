import { Text, StyleSheet, Image, View, Pressable, FlatList, Platform, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Modal from 'react-native-modal';
import { useState, useEffect } from 'react';
import { SafeAreaView, SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  type Todo = { id: string; title: string; notes: string; done: boolean };
  const [todos, setTodos] = useState<Todo[]>([]);

  // Load todos from storage on startup
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('todos');
        if (storedTodos) setTodos(JSON.parse(storedTodos));
      } catch (error) {
        console.error('Failed to load todos:', error);
      }
    };
    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem('todos', JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    };
    saveTodos();
  }, [todos]);
  
  const handleSave = () => {
    if (!titleInput.trim()) return;
    const newTodo: Todo = { id: Date.now().toString(), title: titleInput, notes: notesInput, done: false };
    setTodos([...todos, newTodo]);
    setTitleInput('');
    setNotesInput('');
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleDone = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <Pressable onPress={() => toggleDone(item.id)} style={[styles.todoItem, item.done && styles.todoDoneItem]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.todoTitle, item.done && styles.todoTitleDone]}>{item.title}</Text>
        {item.notes ? <Text style={[styles.todoNotes, item.done && styles.todoNotesDone]}>{item.notes}</Text> : null}
      </View>
      <Pressable onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteButton}>✕</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <StatusBar style="light" animated />
        <View style={styles.container}>
          <View style={styles.headerView}>
            <Text style={styles.title}>Todo Star</Text>
            <Image source={require('./assets/star.png')} style={styles.starImage} />
          </View>

          {/* Todo List */}
          <FlatList style={{ backgroundColor: '#ebded1ff', flex: 1 }}
            data={todos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1, padding: 16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No todos yet. Add one!</Text>}
          />

          <View style={styles.footerBar}>
            <Pressable style={styles.footerButton} onPress={() => setModalVisible(true)} accessibilityRole="button">
              <Text style={styles.footerButtonText}>Add something to your list</Text>
            </Pressable>
          </View>
        </View>

        {/* Modal */}
        {Platform.OS === 'web' ? (
          modalVisible ? (
            <View style={styles.webOverlay}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
              <View style={styles.sheetContainer}>
                <View style={styles.handleContainer}>
                  <View style={styles.handleBar} />
                </View>
                <View style={styles.sheetBody}>
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Add to your list</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Title"
                      placeholderTextColor="#888"
                      value={titleInput}
                      onChangeText={setTitleInput}
                      returnKeyType="next"
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Notes"
                      placeholderTextColor="#888"
                      value={notesInput}
                      onChangeText={setNotesInput}
                      multiline
                      numberOfLines={4}
                    />
                    <View style={styles.formActions}>
                      <Pressable style={styles.primaryButton} onPress={handleSave} accessibilityRole="button">
                        <Text style={styles.primaryButtonText}>Save</Text>
                      </Pressable>
                      <Pressable style={styles.secondaryButton} onPress={() => setModalVisible(false)} accessibilityRole="button">
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : null
        ) : (
          <Modal
            isVisible={modalVisible}
            hasBackdrop={true}
            backdropOpacity={0.5}
            backdropColor='black'
            onBackdropPress={() => setModalVisible(false)}
            onBackButtonPress={() => setModalVisible(false)}
            onSwipeComplete={() => setModalVisible(false)}
            swipeDirection={["down"]}
            swipeThreshold={50}
            coverScreen
            statusBarTranslucent
            backdropTransitionOutTiming={0}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            avoidKeyboard
            style={styles.bottomSheetModal}
          >
            <View style={styles.sheetContainer}>
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>
              <View style={styles.sheetBody}>
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Add to your list</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Title"
                    placeholderTextColor="#888"
                    value={titleInput}
                    onChangeText={setTitleInput}
                    returnKeyType="next"
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Notes"
                    placeholderTextColor="#888"
                    value={notesInput}
                    onChangeText={setNotesInput}
                    multiline
                    numberOfLines={4}
                  />
                  <View style={styles.formActions}>
                    <Pressable style={styles.primaryButton} onPress={handleSave} accessibilityRole="button">
                      <Text style={styles.primaryButtonText}>Save</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={() => setModalVisible(false)} accessibilityRole="button">
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#24293e',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#24293e',
    borderBottomWidth: 4,
    borderBottomColor: '#222',
  },
  starImage: {
    width: 24,
    height: 24,
    transform: [{ rotate: '15deg' }],
  },
  footerBar: {
    width: '100%',
    backgroundColor: '#24293e',
    borderTopWidth: 4,
    borderTopColor: '#222',
    padding: 12,
  },
  footerButton: {
    backgroundColor: '#8ebbff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
  },
  footerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSheetModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: 380,
    backgroundColor: '#f4f5fc',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    position: 'relative',
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  handleBar: {
    marginVertical: 4,
    width: 56,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#c8c6c4',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#222',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#8ebbff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  sheetBody: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  todoDoneItem: {
    backgroundColor: '#e0e0e0',
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  todoTitleDone: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoNotes: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  todoNotesDone: {
    textDecorationLine: 'line-through',
    color: '#76c287ff',
  },
  deleteButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    paddingHorizontal: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginTop: 20,
  },
});
