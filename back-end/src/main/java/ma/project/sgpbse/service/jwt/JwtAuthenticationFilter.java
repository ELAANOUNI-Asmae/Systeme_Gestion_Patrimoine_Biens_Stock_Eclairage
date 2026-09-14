package ma.project.sgpbse.service.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ma.project.sgpbse.entity.user.User;
import ma.project.sgpbse.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository; //injection du repository pour vérifier l'état du compte en BDD

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return path.equals("/sgpbse/auth/login")
                || path.equals("/sgpbse/auth/logout")
                || path.equals("/sgpbse/auth/forgot_password")
                || path.equals("/sgpbse/auth/reset_password");
    }

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

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Récupération de l'utilisateur en base de données
                User user = userRepository.findByEmail(userEmail);

                if (user != null) {

                    // Vérification du statut (appelle votre méthode user.isEnabled())
                    if (!user.isEnabled()) {
                        System.out.println(">>> Accès refusé : Le compte de " + userEmail + " est INACTIVE");

                        // Blocage direct avec un statut HTTP 403 Forbidden
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write("{\"error\": \"Votre compte est inactif. Accès refusé.\"}");
                        return; // ⚠️ Stoppe la chaîne de filtres ici !
                    }

                    // Extract permissions depuis le JWT
                    List<String> permissions = jwtService.extractPermissions(jwt);

                    List<SimpleGrantedAuthority> authorities = permissions.stream()
                            .map(SimpleGrantedAuthority::new)
                            .toList();

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            authorities
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println(">>> Utilisateur authentifié et actif : " + userEmail);
                }
            }
        } catch (Exception e) {
            System.out.println("Erreur de validation du token JWT : " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}