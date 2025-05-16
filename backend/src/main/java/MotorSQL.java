// MotorSQL

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class MotorSQL {
    private Connection conn;

    // Lee la configuración desde las variables de entorno
    private final String URL = System.getenv("DB_URL");
    private final String USER = System.getenv("DB_USER");
    private final String PASS = System.getenv("DB_PASSWORD");

    public void conectar() throws SQLException, ClassNotFoundException { // Lanzar excepciones para que el Controller las maneje

        // Validar que las variables de entorno se cargaron correctamente
        if (URL == null || USER == null || PASS == null) {
            System.err.println("Error: Faltan variables de entorno para la base de datos (DB_URL, DB_USER, DB_PASSWORD)");
            throw new IllegalStateException("Configuración de base de datos incompleta. Revisa las variables de entorno.");
        }

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("Error: Driver PostgreSQL no encontrado. Asegúrate de tener el JAR en tu classpath/lib.");
            throw e; // Re-lanzar para que el llamador sepa
        }

        Properties properties = new Properties();
        properties.setProperty("user", USER);
        properties.setProperty("password", PASS);
        properties.setProperty("ssl", "true");
        // properties.setProperty("ssl", "false"); // Puede ser necesario dependiendo de la configuración de RDS

        try {
            conn = DriverManager.getConnection(URL, properties);
            if (conn != null) {
                System.out.println("Connected to the database!");
                // ¡IMPORTANTE! Recuerda cerrar la conexión cuando termines de usarla.
                // conn.close(); // <-- Esto debería hacerse después de usar la conexión, no aquí.
            } else {
                System.err.println("Error al conectar: DriverManager.getConnection devolvió null.");
                // Lanzar una excepción podría ser mejor que solo imprimir
                throw new SQLException("Error al conectar: DriverManager.getConnection devolvió null.");
            }
        } catch (SQLException e) {
            System.err.println("Error de SQL al conectar: " + e.getMessage());
            System.err.println("SQLState: " + e.getSQLState());
            System.err.println("ErrorCode: " + e.getErrorCode());
            // e.printStackTrace(System.err); // Descomentar para ver el stack trace completo
            throw e; // Re-lanzar para que el Controller pueda informar al usuario
        }
    }

    // Método para obtener la conexión (si es necesario fuera de conectar)
    public Connection getConn() {
        if (conn == null) {
            throw new IllegalStateException("La conexión no está establecida. Llama a conectar() primero.");
        }
        return conn;
    }

    // Método para cerrar la conexión (MUY IMPORTANTE)
    public void desconectar() {
        if (conn != null) {
            try {
                conn.close();
                System.out.println("Database connection closed.");
            } catch (SQLException e) {
                System.err.println("Error al cerrar la conexión: " + e.getMessage());
                // Considera loguear este error
            } finally {
                conn = null; // Ayuda al garbage collector y evita reusar una conexión cerrada
            }
        }
    }
}