// app/logueado/paginas/terminos.tsx
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

export default function TerminosScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#093659" />
        </TouchableOpacity>
        <Text style={styles.title}>Términos y condiciones</Text>
      </View>

      {/* Contenido Scroll */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.paragraph}>
          Bienvenido a TravelWise. Antes de continuar, por favor lee detenidamente estos
          Términos y Condiciones. Al usar la aplicación, aceptas estos términos.
        </Text>

        <Text style={styles.heading}>1. Aceptación de los términos</Text>
        <Text style={styles.paragraph}>
          Al acceder o usar TravelWise, aceptas cumplir estos Términos y todas las
          leyes y regulaciones aplicables.
        </Text>

        <Text style={styles.heading}>2. Uso de la aplicación</Text>
        <Text style={styles.paragraph}>
          Sólo puedes usar la app para fines lícitos y de acuerdo con nuestra Política de
          privacidad. No debes interferir con el funcionamiento de los servidores o redes
          conectadas a TravelWise.
        </Text>

        <Text style={styles.heading}>3. Propiedad intelectual</Text>
        <Text style={styles.paragraph}>
          Todo el contenido, logos, marcas y software de la aplicación son propiedad de
          TravelWise o de sus licenciantes y están protegidos por derechos de autor.
        </Text>

        <Text style={styles.heading}>4. Limitación de responsabilidad</Text>
        <Text style={styles.paragraph}>
          En la medida máxima permitida por la ley, TravelWise no será responsable por
          daños directos, indirectos, especiales o consecuentes derivados del uso.
        </Text>

        <Text style={styles.heading}>5. Modificaciones</Text>
        <Text style={styles.paragraph}>
          Podemos actualizar estos Términos en cualquier momento. La versión publicada en
          la app es la vigente. Te recomendamos revisarlos periódicamente.
        </Text>

        <Text style={styles.heading}>6. Contacto</Text>
        <Text style={styles.paragraph}>
          Para dudas o reclamos sobre estos términos, contáctanos a soporte@travelwise.com.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#093659', marginLeft: 12 },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 16, fontWeight: 'bold', color: '#093659', marginTop: 16 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 20, marginTop: 8 },
});
