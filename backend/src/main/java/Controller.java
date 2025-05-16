// Controller

import org.json.JSONObject;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;

@WebServlet(name = "Controller", urlPatterns = {"/Controller"})
public class Controller extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        BufferedReader reader = req.getReader();
        StringBuilder jsonBuffer = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            jsonBuffer.append(line);
        }

        JSONObject respuesta = new JSONObject();
        try {
            JSONObject datos = new JSONObject(jsonBuffer.toString());
            String action = datos.optString("ACTION", "NO_ACTION");
            String user = datos.optString("USER", "NO_USER");

            MotorSQL motorSQL = new MotorSQL();
            motorSQL.conectar();
            respuesta.put("mensaje", "Conectado correctamente");
            respuesta.put("ACTION", action);
            respuesta.put("USER", user);
            respuesta.put("conexion", "OK");
            motorSQL.desconectar();

        } catch (Exception e) {
            respuesta.put("error", "No se pudo procesar la solicitud: " + e.getMessage());
        }

        PrintWriter out = resp.getWriter();
        out.print(respuesta.toString());
        out.flush();
    }
}
