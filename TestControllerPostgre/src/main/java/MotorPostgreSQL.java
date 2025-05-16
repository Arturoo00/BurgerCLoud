package com.example.db; // Make sure this is in the correct package

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

// Assuming MotorSQLA is in the same package or imported correctly
// import com.example.db.MotorSQLA;

public class MotorPostgreSQL extends MotorSQLA {

    @Override
    public void conectar() {
        try {
            if (this.conn != null && !this.conn.isClosed()) {
                System.out.println("Ya conectado a PostgreSQL y la conexión es válida.");
                return;
            }
        } catch (SQLException e) {
            System.err.println("Error verificando estado de conexión existente: " + e.getMessage());
        }

        System.out.println("Intentando conectar a PostgreSQL...");

        try {
            Class.forName("org.postgresql.Driver");
            System.out.println("Driver PostgreSQL cargado exitosamente.");

            Properties properties = new Properties();
            // THESE ARE YOUR CREDENTIALS FROM THE FILE
            properties.setProperty("user", "postgres");
            properties.setProperty("password", "pato789456123"); // Your password
            properties.setProperty("ssl", "false"); // Or "true" if SSL is configured and required

            // YOUR RDS ENDPOINT
            String url = "jdbc:postgresql://burgercloud.cb6uae60clhm.us-east-1.rds.amazonaws.com/postgres";
            System.out.println("URL de conexión: " + url);

            this.conn = DriverManager.getConnection(url, properties);

            if (this.conn != null && !this.conn.isClosed()) {
                System.out.println("¡Conectado exitosamente a PostgreSQL!");
            } else {
                System.err.println("Error crítico: DriverManager.getConnection devolvió null o una conexión cerrada sin lanzar excepción.");
                this.conn = null;
            }

        } catch (ClassNotFoundException e) {
            System.err.println("ERROR FATAL: Driver PostgreSQL (org.postgresql.Driver) no encontrado en el classpath.");
            e.printStackTrace();
            this.conn = null;
        } catch (SQLException e) {
            System.err.println("ERROR SQL al intentar conectar a PostgreSQL: " + e.getMessage());
            System.err.println("SQLState: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            e.printStackTrace();
            this.conn = null;
        } catch (Exception e) {
            System.err.println("ERROR INESPERADO durante la conexión a PostgreSQL: " + e.getMessage());
            e.printStackTrace();
            this.conn = null;
        }

        if (this.conn == null) {
            System.err.println("El intento de conexión falló. La variable 'conn' es null después de llamar a conectar().");
        }
    }
}