//IMotorSQL

import java.sql.Connection;

public interface IMotorSQL {
    void conectar();
    Connection getConnection();
}

