package ma.project.sgpbse.service.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
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

        String jwt = null;
        final String userEmail;

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

            // Extract Email
            userEmail = jwtService.extractEmail(jwt);
            //Extract permissions
            List<String> permissions = jwtService.extractPermissions(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                //Transform each string text of permissions to SimpleGrantedAuthority
                List<SimpleGrantedAuthority> authorities = permissions.stream()
                        .map(SimpleGrantedAuthority::new)
                        .toList();

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userEmail,
                        null,
                        authorities // Spring Security stocke maintenant toutes les permissions de l'utilisateur !
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Autorités de l'utilisateur : " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                System.out.println(">>> Utilisateur authentifié : " + userEmail);
                System.out.println(">>> Autorités chargées : " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            }
        } catch (Exception e) {
            System.out.println("Erreur de validation du token JWT : " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
