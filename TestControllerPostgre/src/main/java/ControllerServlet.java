package com.example.controller;

import com.example.dao.HamburguesaDAO;
import com.example.db.FactoryMotorSQL;
import com.example.db.IMotorSQL;
import com.example.model.Hamburguesa;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays; // For Arrays.toString if needed for debugging, not for JSON
import java.util.List;

// Optional: for Gson
// import com.google.gson.Gson;
// import com.google.gson.GsonBuilder;

@WebServlet("/Controller")
public class ControllerServlet extends HttpServlet {

    private static final String ACTION_PARAM = "ACTION";
    private static final String HAMBURGUESA_LIST_ACTION = "HAMBURGUESA.LIST";
    // private static final Gson gson = new GsonBuilder().create(); // Create Gson instance once

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter(ACTION_PARAM);

        if (action == null || action.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"El parámetro ACTION es requerido.\"}");
            out.flush();
            return;
        }

        System.out.println("Acción recibida: " + action);

        IMotorSQL motorSQL = null;
        HamburguesaDAO hamburguesaDAO = null;

        try {
            motorSQL = FactoryMotorSQL.getIntance(FactoryMotorSQL.POSTGRE);
            if (motorSQL == null) {
                System.err.println("Error: FactoryMotorSQL devolvió null para POSTGRE.");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"Error interno del servidor al configurar la base de datos.\"}");
                out.flush();
                return;
            }

            hamburguesaDAO = new HamburguesaDAO(motorSQL); // This will call motorSQL.conectar()

            switch (action.toUpperCase()) {
                case HAMBURGUESA_LIST_ACTION:
                    List<Hamburguesa> hamburguesas = hamburguesaDAO.listarHamburguesas();

                    // --- Using Gson (Recommended) ---
                    // String jsonResponse = gson.toJson(hamburguesas);
                    // out.print(jsonResponse);

                    // --- Manual JSON construction (Updated) ---
                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("[");
                    for (int i = 0; i < hamburguesas.size(); i++) {
                        Hamburguesa h = hamburguesas.get(i);
                        jsonBuilder.append("{");
                        jsonBuilder.append("\"id\":").append(h.getId()).append(",");
                        jsonBuilder.append("\"name\":\"").append(escapeJson(h.getNombre())).append("\","); // Changed to name
                        jsonBuilder.append("\"description\":\"").append(escapeJson(h.getDescripcion())).append("\",");
                        jsonBuilder.append("\"price\":").append(h.getPrecio()).append(",");
                        jsonBuilder.append("\"imageUrl\":\"").append(escapeJson(h.getImageUrl())).append("\",");
                        jsonBuilder.append("\"type\":\"").append(escapeJson(h.getType())).append("\",");

                        jsonBuilder.append("\"ingredients\":[");
                        String[] ingredients = h.getIngredients();
                        if (ingredients != null) {
                            for (int j = 0; j < ingredients.length; j++) {
                                jsonBuilder.append("\"").append(escapeJson(ingredients[j])).append("\"");
                                if (j < ingredients.length - 1) {
                                    jsonBuilder.append(",");
                                }
                            }
                        }
                        jsonBuilder.append("],");

                        jsonBuilder.append("\"totalScore\":").append(h.getTotalScore()).append(",");
                        jsonBuilder.append("\"ratingCount\":").append(h.getRatingCount()).append(",");
                        // Calculate average rating - ensure ratingCount is not zero
                        double averageRating = (h.getRatingCount() > 0) ? (double) h.getTotalScore() / h.getRatingCount() : 0.0;
                        // Format averageRating to one decimal place
                        jsonBuilder.append("\"averageRating\":").append(String.format("%.1f", averageRating).replace(",", "."));


                        jsonBuilder.append("}");
                        if (i < hamburguesas.size() - 1) {
                            jsonBuilder.append(",");
                        }
                    }
                    jsonBuilder.append("]");
                    out.print(jsonBuilder.toString());
                    break;

                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print("{\"error\":\"Acción desconocida: " + escapeJson(action) + "\"}");
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            // Be careful about exposing raw exception messages to clients
            out.print("{\"error\":\"Error procesando la solicitud. Revise los logs del servidor.\"}");
        } finally {
            out.flush();
            // The connection is typically managed by the motorSQL instance or a connection pool.
            // If MotorSQLA or MotorPostgreSQL handles closing in a more sophisticated way (e.g. via a ServletContextListener or filter for web apps),
            // you might not need to do anything here. For simple cases, the connection might remain open until the app stops or the motor is GC'd.
            // For web apps, it's better to manage connections per request or use a connection pool.
            // For now, relying on HamburguesaDAO and MotorPostgreSQL to handle connect/disconnect if needed.
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    @Override
    public String getServletInfo() {
        return "Servlet controlador principal para Burger Cloud";
    }
}