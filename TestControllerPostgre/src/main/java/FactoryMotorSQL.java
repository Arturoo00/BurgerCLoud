// FactoryMotorSQL

public class FactoryMotorSQL {
    public static final String ORACLE = "ORACLE";
    public static final String MY_SQL = "MYSQL";
    public static final String POSTGRE = "POSTGRE";
    public static final String AURORA = "AURORA";

    public static IMotorSQL getIntance(String bd){
        IMotorSQL myMotor = null;
        switch (bd){
            case ORACLE:
                myMotor = new MotorOracle();
                break;
            case POSTGRE:
                myMotor = new MotorPostgreSQL();
                break;
            case MY_SQL:
                myMotor = new MotorMySQL();
                break;
            case AURORA:
                myMotor = null;
                break;
        }
        return myMotor;
    }
}