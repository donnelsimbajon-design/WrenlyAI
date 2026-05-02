import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const TabBarIconWrapper = ({ focused, children }: { focused: boolean, children: React.ReactNode }) => {
  return (
    <View style={{ 
      backgroundColor: focused ? '#E8F7F5' : 'transparent', 
      paddingHorizontal: 16, 
      paddingVertical: 4, 
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {children}
    </View>
  );
};

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F2F5',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#00665E',
        tabBarInactiveTintColor: '#A0A0B0',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWrapper focused={focused}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      {/* Placeholders for future phases */}
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWrapper focused={focused}>
              <Feather name="book-open" size={22} color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWrapper focused={focused}>
              <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={22} color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="storage"
        options={{
          title: 'Storage',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWrapper focused={focused}>
              <MaterialCommunityIcons name={focused ? "archive" : "archive-outline"} size={22} color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIconWrapper focused={focused}>
              <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
            </TabBarIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="lesson/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
