import type { ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { cores } from '@/tema';

type NomeIcone = keyof typeof Ionicons.glyphMap;

function icone(ativo: NomeIcone, inativo: NomeIcone) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => (
    <Ionicons name={focused ? ativo : inativo} size={size} color={color} />
  );
}

// Barra de navegação inferior do cliente: Início, Agendamentos e Perfil.
export default function AbasLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.cobre,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarStyle: { backgroundColor: cores.fundo, borderTopColor: cores.borda },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.texto,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', headerShown: false, tabBarIcon: icone('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="meus-agendamentos"
        options={{
          title: 'Agendamentos',
          headerTitle: 'Meus agendamentos',
          tabBarIcon: icone('calendar', 'calendar-outline'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          headerTitle: 'Meu perfil',
          tabBarIcon: icone('person', 'person-outline'),
        }}
      />
    </Tabs>
  );
}
