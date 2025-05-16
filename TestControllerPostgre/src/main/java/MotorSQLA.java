// MotorSQLA

import java.sql.Connection;

public abstract class MotorSQLA implements IMotorSQL{
    protected Connection conn;
    public Connection getConnection(){
        return conn;
    }
}