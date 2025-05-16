// MotorSQL

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class MotorSQL {
    private Connection conn;
    public void conectar(){
        try{
            Class.forName("org.postgresql.Driver");
        }catch(Exception e){
            System.out.println(e.getMessage());
        }
        Properties properties = new Properties();
        //properties.setProperty("url", "postgrespring.c9aqgoyi6x61.us-east-1.rds.amazonaws.com");
        properties.setProperty("user","postgres");
        properties.setProperty("password", "springController");
        properties.setProperty("ssl", "false");
        try {
            conn = DriverManager.getConnection("jdbc:postgresql://postgrespring.c9aqgoyi6x61.us-east-1.rds.amazonaws.com/postgres", properties);
            if (conn != null) {
                System.out.println("Connected to the database!");
            }else{
                System.out.println("Error al conectar");
            }
        } catch (SQLException e) {
            // TODO Auto-generated catch block
            // e.printStackTrace();
            System.out.println(e.getMessage());
        }
    }
}