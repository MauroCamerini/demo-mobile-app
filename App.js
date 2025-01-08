import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, ActivityIndicator } from 'react-native';

export default function App() {

  // Consulta a ser enviada a mercado libre (es actualizado cuando el usuario ecribe en el campo
  // de texto)
  const [searchTerm, setSearchTerm] = useState('');

  // Listado de productos (es actualizado cuando se recibe la respuesta de mercado libre)
  const [data, setData] = useState([]);

  // Cargando sí o no. Se modifica antes de llamar a mercado libre y luego de obtenida la respuesta (o si
  // se produce un error)
  const [loading, setLoading] = useState(false);

  // Sirve para indicar al usuario en que parte del proceso de busqueda está y si la misma fue o no
  // exitosa
  const [notification, setNotification] = useState('');

  // Realiza la consulta a Mercado Libre. Pone en estado de carga la app durante el proceso y muestra
  // un alerta ya sea con un resultado exitoso o si se produce un error. Actualiza el estado 'data'
  // para que se muestren en pantalla los productos.
  const fetchData = async () => {

    // Verifica que el usuario haya ingresado algo
    if (!searchTerm.trim()) {
      alert('Por favor, ingresa un producto');
      return;
    }

    // La app se pone en modo "cargando" antes de hacer la petición a mercado libre
    // hasta que obtenga una respuesta
    setLoading(true);
    setNotification('Buscando productos...');


    try {
      // Realiza la petición, espera la respuesta y también la transforma del formato JSON a objeto
      // javascript
      const response = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${searchTerm}`);
      const result = await response.json();
      
      // La API de mercado libre devuelve respuestas 'exitosas' pero indicando un mensaje de error
      // si eso ocurre lanzamos un error interno de la app para capturarlo mas adelante.
      if(result.error)
        throw new Error(result.error)

      // Se muestra un mensaje al usuario en relación a la cantidad de productos que se encontaron
      // y cuantos se muestran
      if (result.paging.total === 0) {
        setNotification('No se encontraron productos.');
      } else {
        setNotification(
          result.paging.total > 50
            ? `Se muestran 50 de ${result.paging.total} productos encontrados.`
            : `Se encontraron ${result.paging.total} productos.`
        );
      }

      // Se establece el estado 'data' esto hará que la lista de productos se actualice ante la nueva
      // información.
      setData(result.results);

    } catch (error) {

      // Ante un error muestra el mensaje de error al usuario.
      setNotification(error.message || 'Ocurrió un error al realizar la búsqueda.');

    } finally {

      // Haya habido errores o no, dado que ya se realizó la petición a mercado libre, sale del estado
      // de carga
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar en Mercado Libre</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar productos..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Button title="Buscar" onPress={fetchData} />
      </View>

      {notification ? <Text style={styles.notification}>{notification}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item.title}</Text>
            </View>
          )}
        />
        
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  loader: {
    marginTop: 20,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notification: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  }
});
