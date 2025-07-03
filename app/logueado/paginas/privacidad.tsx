// app/logueado/paginas/privacidad.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PrivacidadScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#093659" />
        </TouchableOpacity>
        <Text style={styles.title}>Políticas de privacidad</Text>
      </View>

      {/* Contenido Scroll */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>
          En TravelWise valoramos tu privacidad y estamos comprometidos con proteger
          tus datos personales. Esta política explica cómo recopilamos, usamos y
          compartimos tu información.
        </Text>

        <Text style={styles.heading}>1. Información que recopilamos</Text>
        <Text style={styles.paragraph}>
          • Datos que nos proporcionas directamente al registrarte (nombre, email, foto).{"\n"}
          • Información de uso (páginas visitadas, acciones dentro de la app).{"\n"}
          • Datos de ubicación, si das permiso para ello.
        </Text>

        <Text style={styles.heading}>2. Cómo usamos tu información</Text>
        <Text style={styles.paragraph}>
          • Para ofrecerte y mejorar nuestros servicios.{"\n"}
          • Para personalizar tu experiencia.{"\n"}
          • Para enviarte notificaciones y comunicaciones relevantes.
        </Text>

        <Text style={styles.heading}>3. Con quién compartimos datos</Text>
        <Text style={styles.paragraph}>
          No vendemos ni alquilamos tus datos a terceros. Podemos compartirlos con:
          proveedores de servicios que actúan en nuestro nombre, autoridades si
          lo exige la ley, o en caso de fusión/venta de la empresa.
        </Text>

        <Text style={styles.heading}>4. Seguridad</Text>
        <Text style={styles.paragraph}>
          Mantenemos medidas técnicas y organizativas para proteger tus datos contra
          acceso no autorizado, alteraciones o destrucción.
        </Text>

        <Text style={styles.heading}>5. Tus derechos</Text>
        <Text style={styles.paragraph}>
          Tienes derecho a acceder, rectificar o eliminar tus datos en cualquier
          momento. Para ejercerlos, contáctanos a soporte@travelwise.com.
        </Text>

        <Text style={styles.heading}>6. Cambios en esta política</Text>
        <Text style={styles.paragraph}>
          Podemos actualizar esta política; la fecha de “última revisión” aparecerá
          al inicio. Te recomendamos revisarla periódicamente.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f0f0f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#093659', marginLeft: 16 },
  content: { padding: 16 },
  paragraph: { fontSize: 15, color: '#333', marginBottom: 12 },
  heading: { fontSize: 16, fontWeight: 'bold', color: '#093659', marginTop: 16, marginBottom: 6 },
});
