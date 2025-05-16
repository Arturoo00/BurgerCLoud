import java.sql.DriverManager;
import java.sql.SQLException; // Importa SQLException para un manejo más específico
import java.util.Properties;

public class MotorPostgreSQL extends MotorSQLA { // MotorSQLA ya tiene 'protected Connection conn;'

    @Override
    public void conectar() {
        // Evitar reconexiones si ya está conectado y la conexión es válida
        try {
            if (this.conn != null && !this.conn.isClosed()) {
                System.out.println("Ya conectado a PostgreSQL y la conexión es válida.");
                return;
            }
        } catch (SQLException e) {
            System.err.println("Error verificando estado de conexión existente: " + e.getMessage());
            // Proceder a (re)conectar
        }

        System.out.println("Intentando conectar a PostgreSQL..."); // Mensaje de inicio

        try {
            // 1. Cargar el driver
            Class.forName("org.postgresql.Driver");
            System.out.println("Driver PostgreSQL cargado exitosamente.");

            // 2. Configurar propiedades de conexión
            Properties properties = new Properties();
            properties.setProperty("user", "postgres");
            properties.setProperty("password", "pato789456123");
            properties.setProperty("ssl", "false");
            // Opcional: timeouts de conexión para evitar bloqueos indefinidos
            // properties.setProperty("loginTimeout", "10"); // 10 segundos
            // properties.setProperty("connectTimeout", "10"); // 10 segundos

            // 3. Establecer la URL de conexión completa
            // Asegúrate que el puerto es 5432 si no lo especificas (es el default para PostgreSQL)
            String url = "jdbc:postgresql://burgercloud.cb6uae60clhm.us-east-1.rds.amazonaws.com/postgres";
            System.out.println("URL de conexión: " + url);

            // 4. Obtener la conexión
            this.conn = DriverManager.getConnection(url, properties);

            // 5. Verificar la conexión
            if (this.conn != null && !this.conn.isClosed()) {
                System.out.println("¡Conectado exitosamente a PostgreSQL!");
            } else {
                // Esto no debería ocurrir si DriverManager.getConnection no lanza excepción,
                // pero es una doble verificación.
                System.err.println("Error crítico: DriverManager.getConnection devolvió null o una conexión cerrada sin lanzar excepción.");
                this.conn = null; // Asegurar que conn sea null si algo raro pasó
            }

        } catch (ClassNotFoundException e) {
            System.err.println("ERROR FATAL: Driver PostgreSQL (org.postgresql.Driver) no encontrado en el classpath.");
            e.printStackTrace(); // Imprime el stack trace completo
            this.conn = null; // Asegurar que conn sea null
        } catch (SQLException e) {
            System.err.println("ERROR SQL al intentar conectar a PostgreSQL: " + e.getMessage());
            System.err.println("SQLState: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            e.printStackTrace(); // Imprime el stack trace completo
            this.conn = null; // Asegurar que conn sea null
        } catch (Exception e) { // Captura cualquier otra excepción inesperada
            System.err.println("ERROR INESPERADO durante la conexión a PostgreSQL: " + e.getMessage());
            e.printStackTrace(); // Imprime el stack trace completo
            this.conn = null; // Asegurar que conn sea null
        }

        if (this.conn == null) {
            System.err.println("El intento de conexión falló. La variable 'conn' es null después de llamar a conectar().");
        }
    }
}