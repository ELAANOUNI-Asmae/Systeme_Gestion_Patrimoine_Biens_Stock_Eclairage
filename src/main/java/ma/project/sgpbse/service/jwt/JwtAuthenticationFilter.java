package ma.project.sgpbse.service.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
<<<<<<< HEAD
=======
import jakarta.servlet.http.Cookie;
>>>>>>> origin/auth1
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component // Permet à Spring de détecter et gérer cette classe
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService; // Le service qu'on a créé pour manipuler le JWT

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

<<<<<<< HEAD
        // 1. Extraire l'en-tête "Authorization" de la requête HTTP
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        final String userRole;

        // 2. Vérifier si l'en-tête est présent et commence bien par "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Si pas de token, on passe au filtre suivant (l'accès sera bloqué si la route est protégée)
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraire le token (on coupe après "Bearer " qui fait 7 caractères)
        jwt = authHeader.substring(7);

        try {
            // 4. Extraire l'email et le rôle stockés dans le token grâce au JwtService
            // (Il faudra ajouter des méthodes d'extraction dans ton JwtService si ce n'est pas fait)
            userEmail = jwtService.extractEmail(jwt);
            userRole = jwtService.extractRole(jwt);

            // 5. Si l'email est valide et que l'utilisateur n'est pas encore authentifié dans Spring
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // On vérifie si le token n'est pas expiré
                if (jwtService.isTokenValide(jwt)) {

                    // 6. On crée le "badge d'accès officiel" de Spring avec l'email et son rôle
=======
        String jwt = null;
        final String userEmail;
        final String userRole;

        // 1. On cherche le token dans les cookies de la requête
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt-token".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }
        // 2. Si pas de cookie trouvé, on passe au filtre suivant
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            // 3. Extraction des données (tes méthodes existantes de JwtService)
            userEmail = jwtService.extractEmail(jwt);
            userRole = jwtService.extractRole(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                if (jwtService.isTokenValide(jwt)) {

>>>>>>> origin/auth1
                    String formattedRole = userRole.startsWith("ROLE_") ? userRole : "ROLE_" + userRole;

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
<<<<<<< HEAD
                            List.of(new SimpleGrantedAuthority(formattedRole)) // On s'assure que ça commence par ROLE_
=======
                            List.of(new SimpleGrantedAuthority(formattedRole))
>>>>>>> origin/auth1
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

<<<<<<< HEAD
                    // 7. On enregistre ce badge dans le contexte de sécurité de Spring
=======
>>>>>>> origin/auth1
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
<<<<<<< HEAD
            // Si le token est corrompu ou expiré, on ignore l'authentification
            System.out.println("Erreur de validation du token JWT : " + e.getMessage());
        }

        // 8. On laisse la requête continuer son chemin vers le filtre suivant ou vers le Controller
        filterChain.doFilter(request, response);
=======
            System.out.println("Erreur de validation du token JWT : " + e.getMessage());
        }

>>>>>>> origin/auth1
    }
}
