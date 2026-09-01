import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useEnergy } from '../context/EnergyContext';
import { generateChatbotResponse } from '../utils/tips';
import { ChatMessage } from '../types';
import { Colors, Typography, Spacing, Radius, Shadows } from '../theme';

const ChatScreen = () => {
  const { appliances, tips } = useEnergy();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1', isUser: false, timestamp: new Date().toISOString(),
    text: "Hi! I'm your Energy Assistant. I can help you save energy, analyze consumption, and answer questions. How can I help?",
    suggestions: ['How can I save energy?', 'Show my consumption', 'Calculate my bill', 'Environmental impact'],
  }]);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, text, isUser: true, timestamp: new Date().toISOString() };
    setMessages(p => [...p, userMsg]);
    const { response, suggestions } = generateChatbotResponse(text, appliances, tips);
    setTimeout(() => {
      setMessages(p => [...p, {
        id: `msg-${Date.now() + 1}`, text: response, isUser: false,
        timestamp: new Date().toISOString(), suggestions,
      }]);
    }, 400);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <LinearGradient colors={['#0B1120', '#162032']} style={s.header}>
        <Text style={s.headerLabel}>ENERGY ASSISTANT</Text>
        <Text style={s.headerTitle}>Energy Chat</Text>
      </LinearGradient>

      <ScrollView style={s.msgList} contentContainerStyle={s.msgContent}
        ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m) => (
          <View key={m.id}>
            <View style={[s.bubble, m.isUser ? s.userBubble : s.botBubble]}>
              <Text style={[s.bubbleTxt, m.isUser ? s.userTxt : s.botTxt]}>{m.text}</Text>
            </View>
            {m.suggestions && m.suggestions.length > 0 && (
              <View style={s.sugWrap}>
                {m.suggestions.map((sug, i) => (
                  <TouchableOpacity key={i} style={s.sugChip} onPress={() => sendMessage(sug)} activeOpacity={0.7}>
                    <Text style={s.sugTxt}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={s.inputBar}>
        <TextInput style={s.input} placeholder="Type a question..." value={input}
          onChangeText={setInput} onSubmitEditing={() => sendMessage(input)}
          placeholderTextColor={Colors.textMuted} multiline />
        <TouchableOpacity onPress={() => sendMessage(input)} activeOpacity={0.8}>
          <LinearGradient colors={['#00E676', '#00C853']} style={s.sendBtn}>
            <Text style={s.sendTxt}>↑</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 54, paddingBottom: 20, paddingHorizontal: Spacing.page, alignItems: 'center' },
  headerLabel: { ...Typography.overline, color: Colors.primary, marginBottom: 4 },
  headerTitle: { ...Typography.displaySmall, color: '#fff' },
  msgList: { flex: 1 },
  msgContent: { padding: Spacing.page, paddingBottom: 20 },
  bubble: { maxWidth: '82%', padding: 14, borderRadius: Radius.lg, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.dark, borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: Colors.card, ...Shadows.sm, borderBottomLeftRadius: 4 },
  bubbleTxt: { ...Typography.bodyMedium, lineHeight: 21 },
  userTxt: { color: '#fff' },
  botTxt: { color: Colors.text },
  sugWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14, marginLeft: 4 },
  sugChip: { backgroundColor: Colors.primarySoft, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  sugTxt: { ...Typography.labelSmall, color: Colors.primaryDark },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.divider, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.xl, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, maxHeight: 100, ...Typography.bodyMedium, color: Colors.text },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sendTxt: { fontSize: 20, color: Colors.dark, fontWeight: '800' },
});

export default ChatScreen;
