package com.example.dao;

import com.example.db.FactoryMotorSQL;
import com.example.db.IMotorSQL; // Import your IMotorSQL interface
import com.example.model.Hamburguesa; // Import your Hamburguesa model

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Array; // Required for SQL arrays
import java.util.ArrayList;
import java.util.List;

public class HamburguesaDAO {
    private IMotorSQL motor;

    public HamburguesaDAO(IMotorSQL motor) {
        this.motor = motor;
        if (this.motor == null) {
            System.err.println("Error crítico: El motorSQL proporcionado a HamburguesaDAO es null.");
            throw new IllegalArgumentException("El motorSQL no puede ser null.");
        }
        System.out.println("HamburguesaDAO: Intentando conectar a través del motor...");
        this.motor.conectar();
    }

    public List<Hamburguesa> listarHamburguesas() {
        List<Hamburguesa> hamburguesas = new ArrayList<>();
        Connection con = motor.getConnection();

        if (con == null) {
            System.err.println("Error: La conexión a la base de datos es nula en HamburguesaDAO al intentar listar.");
            if (motor == null) {
                System.err.println("El objeto motor en HamburguesaDAO también es null.");
            }
            return hamburguesas;
        }

        System.out.println("HamburguesaDAO: Conexión obtenida, intentando ejecutar consulta.");

        // Updated SQL to match your 'burgers' table and columns
        String sql = "SELECT id, name, description, price, image_url, type, ingredients, total_score, rating_count FROM burgers";
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            pstmt = con.prepareStatement(sql);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                Hamburguesa h = new Hamburguesa();
                h.setId(rs.getInt("id"));
                h.setNombre(rs.getString("name")); // Column name is 'name'
                h.setDescripcion(rs.getString("description"));
                h.setPrecio(rs.getDouble("price"));
                h.setImageUrl(rs.getString("image_url"));
                h.setType(rs.getString("type"));

                // Handling SQL Array for ingredients
                Array sqlArray = rs.getArray("ingredients");
                if (sqlArray != null) {
                    h.setIngredients((String[]) sqlArray.getArray());
                } else {
                    h.setIngredients(new String[0]); // Empty array if null
                }

                h.setTotalScore(rs.getInt("total_score"));
                h.setRatingCount(rs.getInt("rating_count"));
                hamburguesas.add(h);
            }
            System.out.println("HamburguesaDAO: Consulta ejecutada, " + hamburguesas.size() + " hamburguesas encontradas.");
        } catch (SQLException e) {
            System.err.println("Error SQL al listar hamburguesas: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (rs != null) rs.close();
                if (pstmt != null) pstmt.close();
                // Connection is managed by MotorSQL, do not close here.
            } catch (SQLException e) {
                System.err.println("Error al cerrar recursos en HamburguesaDAO: " + e.getMessage());
            }
        }
        return hamburguesas;
    }

    public static void main(String args[]) {
        System.out.println("Ejecutando main de HamburguesaDAO para prueba...");
        // Use your actual Factory to get the PostgreSQL motor
        IMotorSQL motorPrueba = FactoryMotorSQL.getIntance(FactoryMotorSQL.POSTGRE);
        if (motorPrueba == null) {
            System.err.println("Main: FactoryMotorSQL devolvió null para POSTGRE.");
            return;
        }
        HamburguesaDAO hamburguesaDAO = new HamburguesaDAO(motorPrueba);
        List<Hamburguesa> lista = hamburguesaDAO.listarHamburguesas();
        if (lista.isEmpty()) {
            System.out.println("Main: No se encontraron hamburguesas o hubo un error en la conexión/consulta.");
        } else {
            for (Hamburguesa h : lista) {
                System.out.println(h.toString());
            }
        }
    }
}