package ma.project.sgpbse.service.user;

public class VerifyUserPwd {

    public static boolean verify(String pwd, String hash_pwd, String sault){
        return pwd.equals(hash_pwd);
    }
}
