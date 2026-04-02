import React from 'react';
import { Modal, View, Text, Pressable, Linking, Platform } from 'react-native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onContinue: () => void;      // dispara flujo de permisos
  onOpenSettings?: () => void;  // opcional; abre ajustes
};

export default function BackgroundLocationDisclosure({
  visible,
  onCancel,
  onContinue,
  onOpenSettings,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center', padding:24 }}>
        <View style={{ width:'100%', maxWidth:460, backgroundColor:'#fff', borderRadius:16, padding:20 }}>
          <Text style={{ fontSize:18, fontWeight:'700', marginBottom:8 }}>
            Compartir tu ubicación en 2º plano (solo HOPPER)
          </Text>

          <Text style={{ marginBottom:8 }}>
            • Usaremos tu ubicación aunque la app esté minimizada o bloqueada para asignarte viajes cercanos y mejorar la seguridad.
          </Text>
          <Text style={{ marginBottom:8 }}>
            • Verás una <Text style={{ fontWeight:'700' }}>notificación persistente</Text> mientras esté activo.
          </Text>
          <Text style={{ marginBottom:8 }}>
            • Puedes apagarlo cuando quieras desde “Activo” o en Ajustes &gt; Ubicación.
          </Text>
          <Text style={{ marginBottom:16 }}>
            • Frecuencia aprox.: cada 10 s o 10 m. No compartimos tus datos con terceros.
          </Text>

          <View style={{ flexDirection:'row', justifyContent:'flex-end', gap:12 }}>
            <Pressable onPress={onCancel} style={{ padding:12 }}>
              <Text>Ahora no</Text>
            </Pressable>

            {Platform.OS === 'android' && (
              <Pressable
                onPress={onOpenSettings ?? (() => Linking.openSettings())}
                style={{ padding:12 }}
              >
                <Text>Abrir ajustes</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onContinue}
              style={{ backgroundColor:'#2EC4B6', padding:12, borderRadius:8 }}
            >
              <Text style={{ color:'#fff', fontWeight:'700' }}>Continuar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
