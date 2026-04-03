import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const TermsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>TÉRMINOS Y CONDICIONES DE USO</Text>
      <Text style={styles.subtitle}>Comercial HOP Mobility SpA</Text>
      <Text style={styles.text}>
        RUT 78.047.028-3{"\n"}
        Correo de contacto: jose@hopmobilityapp.com{"\n"}
        País: Chile{"\n\n"}
      </Text>
      <Text style={styles.section}>1. Objeto y aceptación</Text>
      <Text style={styles.text}>
        Los presentes Términos y Condiciones de Uso (en adelante, los “Términos”) regulan el acceso y uso de la aplicación móvil HOP (en adelante, la “App”), propiedad de Comercial HOP Mobility SpA, una sociedad constituida bajo las leyes de la República de Chile.{"\n\n"}
        El uso de la App implica la aceptación plena y sin reservas de estos Términos por parte de todo usuario. Si no está de acuerdo con ellos, deberá abstenerse de utilizar la App.
      </Text>
      <Text style={styles.section}>2. Descripción del servicio</Text>
      <Text style={styles.text}>
        HOP es una plataforma tecnológica que conecta empresas, coordinadores de viaje corporativo y conductores profesionales, con el fin de coordinar servicios de traslado empresariales.{"\n\n"}
        La App permite gestionar reservas, asignar conductores y optimizar la comunicación entre los actores involucrados.{"\n\n"}
        HOP Mobility SpA no presta servicios de transporte, sino que actúa únicamente como intermediario tecnológico entre las partes.
      </Text>
      <Text style={styles.section}>3. Definiciones</Text>
      <Text style={styles.text}>
        • <Text style={styles.bold}>Empresa:</Text> organización que contrata o utiliza la App para gestionar los traslados de sus colaboradores, clientes o visitas.{"\n"}
        • <Text style={styles.bold}>Coordinador:</Text> colaborador de la empresa autorizado para utilizar la App y coordinar servicios de traslado.{"\n"}
        • <Text style={styles.bold}>Conductor:</Text> profesional registrado en la App, encargado de ejecutar los traslados.{"\n"}
        • <Text style={styles.bold}>Pasajero:</Text> persona que utiliza los servicios de traslado gestionados a través de la App.{"\n"}
        • <Text style={styles.bold}>Procesador de pagos autorizado:</Text> plataforma tecnológica de terceros que permite realizar y recibir pagos de forma electrónica y segura.
      </Text>
      <Text style={styles.section}>4. Registro y uso de la App</Text>
      <Text style={styles.text}>
        Para utilizar la App, los usuarios deben:{"\n"}
        • Ser mayores de 18 años.{"\n"}
        • Proporcionar información veraz, actual y completa durante el registro.{"\n"}
        • Mantener la confidencialidad de sus credenciales de acceso.{"\n\n"}
        HOP Mobility SpA podrá suspender o eliminar cuentas que incumplan estos Términos o hagan uso indebido de la plataforma.
      </Text>
      <Text style={styles.section}>5. Obligaciones de los usuarios</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>a) Empresas y coordinadores:</Text>{"\n"}
        • Utilizar la App únicamente con fines relacionados a su operación corporativa.{"\n"}
        • Asegurar que los datos de los pasajeros y servicios ingresados sean correctos.{"\n"}
        • No ofrecer servicios no autorizados ni manipular el sistema de comisiones.{"\n\n"}
        <Text style={styles.bold}>b) Conductores:</Text>{"\n"}
        • Cumplir con las normativas legales de transporte vigentes en Chile.{"\n"}
        • Mantener los vehículos en condiciones seguras, limpias y operativas.{"\n"}
        • Cumplir los horarios y condiciones pactadas con las empresas o pasajeros.{"\n\n"}
        <Text style={styles.bold}>c) Pasajeros:</Text>{"\n"}
        • Respetar las condiciones del servicio contratado.{"\n"}
        • Mantener una conducta adecuada hacia los conductores y el personal de la empresa.
      </Text>
      <Text style={styles.section}>6. Pagos y comisiones</Text>
      <Text style={styles.text}>
        Los pagos y comisiones que se generen por los servicios de traslado se procesan a través de un procesador de pagos electrónico autorizado, designado por HOP Mobility SpA.{"\n\n"}
        Las empresas son responsables de los pagos hacia los conductores, y los incentivos correspondientes a los coordinadores se acreditarán de acuerdo con las condiciones establecidas en la App.{"\n\n"}
        HOP Mobility SpA no asume responsabilidad por pagos realizados fuera de la plataforma ni por errores derivados de información incorrecta proporcionada por los usuarios.
      </Text>
      <Text style={styles.section}>7. Propiedad intelectual</Text>
      <Text style={styles.text}>
        Todos los contenidos, marcas, logotipos, diseños, códigos y elementos tecnológicos asociados a HOP son propiedad exclusiva de Comercial HOP Mobility SpA.{"\n\n"}
        Queda estrictamente prohibido copiar, reproducir o modificar cualquier parte de la App sin autorización escrita de la empresa.
      </Text>
      <Text style={styles.section}>8. Limitación de responsabilidad</Text>
      <Text style={styles.text}>
        HOP Mobility SpA no se responsabiliza por:{"\n"}
        • Accidentes, daños o pérdidas ocurridos durante la prestación del servicio de transporte.{"\n"}
        • Retrasos, fallas técnicas, o cancelaciones ajenas a su control.{"\n"}
        • Errores de información ingresada por los usuarios.{"\n\n"}
        La App se ofrece “tal cual”, sin garantías adicionales, explícitas o implícitas.
      </Text>
      <Text style={styles.section}>9. Protección de datos personales</Text>
      <Text style={styles.text}>
        HOP Mobility SpA recopila y trata los datos personales conforme a la legislación chilena vigente y su Política de Privacidad, la cual forma parte integrante de estos Términos.{"\n\n"}
        El usuario autoriza expresamente el tratamiento de sus datos para las finalidades de registro, operación, comunicación y mejora del servicio.
      </Text>
      <Text style={styles.section}>10. Modificaciones</Text>
      <Text style={styles.text}>
        HOP Mobility SpA podrá modificar estos Términos en cualquier momento. Las modificaciones serán notificadas mediante la App o los canales oficiales y se considerarán aceptadas si el usuario continúa utilizando la plataforma después de su publicación.
      </Text>
      <Text style={styles.section}>11. Jurisdicción y ley aplicable</Text>
      <Text style={styles.text}>
        Estos Términos se rigen por las leyes de la República de Chile.{"\n\n"}
        Cualquier controversia será sometida a los tribunales ordinarios de justicia de Santiago de Chile, con renuncia expresa a cualquier otro fuero.
      </Text>
      <Text style={styles.section}>Contacto</Text>
      <Text style={styles.text}>
        Para consultas o reclamos, el usuario puede escribir a{" "}
        <Text style={styles.bold}>jose@hopmobilityapp.com</Text> o comunicarse a través de los canales de soporte disponibles en la App.
      </Text>
    </ScrollView>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: '600',
  },
});
