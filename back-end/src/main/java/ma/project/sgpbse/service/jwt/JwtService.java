package ma.project.sgpbse.service.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
import java.util.Random;
import java.util.function.Function;
import java.util.random.RandomGenerator;

@Service
public class JwtService {

    // Une clé secrète forte pour signer tes tokens (à mettre idéalement dans application.properties)
    private final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Générer le token à partir de l'email et du rôle de l'utilisateur
    public String genererToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // On injecte le rôle directement dans le token !
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Expire après 24 heures
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    public boolean isTokenValide(String token) {
        // On récupère la date d'expiration et on vérifie si elle est APRÈS la date actuelle
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.after(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Une méthode générique pratique pour extraire une information spécifique (Claim)
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }


}
