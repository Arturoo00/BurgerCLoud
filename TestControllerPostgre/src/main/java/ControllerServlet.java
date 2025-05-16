//ControllerServerlet

// Preferiblemente en un paquete como com.example.controller
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

// Importa tus clases (ajusta paquetes si es necesario)
// import com.example.dao.FactoryMotorSQL;
// import com.example.dao.HamburguesaDAO;
// import com.example.dao.IMotorSQL;
// import com.example.model.Hamburguesa;
// Opcional: para Gson
// import com.google.gson.Gson;


// La anotación @WebServlet mapea esta clase a la URL /Controller
// El nombre de tu aplicación web (WAR) será el prefijo, ej: /TestControllerPostgre/Controller
@WebServlet("/Controller")
public class ControllerServlet extends HttpServlet {

    private static final String ACTION_PARAM = "ACTION";
    private static final String HAMBURGUESA_LIST_ACTION = "HAMBURGUESA.LIST";

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

        response.setContentType("application/json"); // Por defecto, o text/plain si no usas JSON
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter(ACTION_PARAM);

        if (action == null || action.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"error\":\"El parámetro ACTION es requerido.\"}");
            out.flush();
            return;
        }

        System.out.println("Acción recibida: " + action); // Para depuración

        IMotorSQL motorSQL = null;
        HamburguesaDAO hamburguesaDAO = null;

        try {
            // Usamos el Factory para obtener el motor PostgreSQL
            motorSQL = FactoryMotorSQL.getIntance(FactoryMotorSQL.POSTGRE);
            if (motorSQL == null) {
                System.err.println("Error: FactoryMotorSQL devolvió null para POSTGRE.");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.print("{\"error\":\"Error interno del servidor al configurar la base de datos.\"}");
                out.flush();
                return;
            }

            hamburguesaDAO = new HamburguesaDAO(motorSQL);

            switch (action.toUpperCase()) {
                case HAMBURGUESA_LIST_ACTION:
                    List<Hamburguesa> hamburguesas = hamburguesaDAO.listarHamburguesas();

                    // Usando Gson (opcional, más robusto)
                    // Gson gson = new Gson();
                    // String jsonResponse = gson.toJson(hamburguesas);
                    // out.print(jsonResponse);

                    // Conversión manual a JSON (simple)
                    StringBuilder jsonBuilder = new StringBuilder();
                    jsonBuilder.append("[");
                    for (int i = 0; i < hamburguesas.size(); i++) {
                        Hamburguesa h = hamburguesas.get(i);
                        jsonBuilder.append("{");
                        jsonBuilder.append("\"id\":").append(h.getId()).append(",");
                        jsonBuilder.append("\"nombre\":\"").append(escapeJson(h.getNombre())).append("\",");
                        jsonBuilder.append("\"precio\":").append(h.getPrecio()).append(",");
                        jsonBuilder.append("\"descripcion\":\"").append(escapeJson(h.getDescripcion())).append("\"");
                        jsonBuilder.append("}");
                        if (i < hamburguesas.size() - 1) {
                            jsonBuilder.append(",");
                        }
                    }
                    jsonBuilder.append("]");
                    out.print(jsonBuilder.toString());
                    break;

                // Puedes añadir más casos para otras acciones
                // case "HAMBURGUESA.ADD":
                // ...
                // break;

                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.print("{\"error\":\"Acción desconocida: " + action + "\"}");
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace(); // Importante para ver errores en la consola del servidor
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"error\":\"Error procesando la solicitud: " + e.getMessage() + "\"}");
        } finally {
            out.flush();
            // Aquí podrías considerar cerrar la conexión si el motorSQL
            // no la gestiona automáticamente o si no usas un pool de conexiones.
            // Por ejemplo, si IMotorSQL tuviera un método close():
            // if (motorSQL != null && motorSQL.getConnection() != null) {
            //     try {
            //         motorSQL.getConnection().close();
            //     } catch (SQLException ex) {
            //         ex.printStackTrace();
            //     }
            // }
        }
    }

    // Helper simple para escapar strings para JSON
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
        return "Servlet controlador principal";
    }
}