import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
// Importa tu clase Hamburguesa (ajusta el paquete si es necesario)
// import com.example.model.Hamburguesa;


public class HamburguesaDAO {
    private IMotorSQL motor;

    public HamburguesaDAO(IMotorSQL motor) {
        this.motor = motor;
        if (this.motor == null) {
            System.err.println("Error crítico: El motorSQL proporcionado a HamburguesaDAO es null.");
            // Podrías lanzar una excepción aquí para detener la ejecución
            throw new IllegalArgumentException("El motorSQL no puede ser null.");
        }
        System.out.println("HamburguesaDAO: Intentando conectar a través del motor...");
        this.motor.conectar(); // Llama a conectar del motor
    }

    // Lo que tenías antes para listar hamburguesas, ahora devuelve List<Hamburguesa>
    public List<Hamburguesa> listarHamburguesas() {
        List<Hamburguesa> hamburguesas = new ArrayList<>();
        Connection con = motor.getConnection();

        if (con == null) {
            System.err.println("Error: La conexión a la base de datos es nula en HamburguesaDAO al intentar listar.");
            // Podrías imprimir un mensaje de error específico si el motor es null
            if (motor == null) {
                System.err.println("El objeto motor en HamburguesaDAO también es null.");
            }
            return hamburguesas; // Devuelve lista vacía
        }

        System.out.println("HamburguesaDAO: Conexión obtenida, intentando ejecutar consulta.");

        // Debes tener una tabla llamada 'hamburguesas' con columnas id, nombre, precio, descripcion
        String sql = "SELECT id, nombre, precio, descripcion FROM hamburguesas"; // Asegúrate que la tabla se llama 'hamburguesas'
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            pstmt = con.prepareStatement(sql);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                Hamburguesa h = new Hamburguesa(); // Asegúrate que tienes esta clase Hamburguesa
                h.setId(rs.getInt("id"));
                h.setNombre(rs.getString("nombre"));
                h.setPrecio(rs.getDouble("precio"));
                h.setDescripcion(rs.getString("descripcion"));
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
                // NO CIERRES LA CONEXIÓN AQUÍ (con.close()) si es manejada por el MotorSQL
                // y se reutiliza. El cierre debe gestionarlo el motor o al final del ciclo de vida del servlet/petición.
            } catch (SQLException e) {
                System.err.println("Error al cerrar recursos en HamburguesaDAO: " + e.getMessage());
            }
        }
        return hamburguesas;
    }

    // El main es útil para pruebas unitarias rápidas, pero no se usará en el entorno web
    public static void main(String args[]) {
        System.out.println("Ejecutando main de HamburguesaDAO para prueba...");
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
                System.out.println(h);
            }
        }
    }
}