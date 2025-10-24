import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useEnergy } from '../context/EnergyContext';
import { generateChatbotResponse } from '../utils/tips';
import { ChatMessage } from '../types';

const ChatScreen = () => {
  const { appliances, tips } = useEnergy();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your Energy Assistant 🤖. I can help you save energy, analyze your consumption, and answer questions about your usage. How can I help you today?",
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions: [
        'How can I save energy?',
        'Show my consumption',
        'Calculate my bill',
        'Environmental impact',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Generate bot response
    const { response, suggestions } = generateChatbotResponse(inputText, appliances, tips);

    const botMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      text: response,
      isUser: false,
      timestamp: new Date().toISOString(),
      suggestions,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInputText('');
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Energy Assistant</Text>
        <Text style={styles.subtitle}>Ask me anything about energy savings</Text>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={(ref) => {
          if (ref) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userText : styles.botText,
                ]}
              >
                {message.text}
              </Text>
            </View>

            {message.suggestions && message.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsLabel}>Suggestions:</Text>
                {message.suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#673AB7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#673AB7',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#333',
  },
  suggestionsContainer: {
    marginBottom: 15,
    marginLeft: 10,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  suggestionChip: {
    backgroundColor: '#E1BEE7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 13,
    color: '#4A148C',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#673AB7',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
