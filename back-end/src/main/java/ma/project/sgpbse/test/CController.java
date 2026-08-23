package ma.project.sgpbse.test;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/entites-c")
@RequiredArgsConstructor
public class CController {

    private final CService cService;

    @PostMapping
    public ResponseEntity<CResponseDto> creer(@RequestBody @Valid CreateCDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cService.creerC(dto));
    }

    @PostMapping("/{id}/traiter")
    public ResponseEntity<CResponseDto> traiter(@PathVariable Long id) {
        return ResponseEntity.ok(cService.traiterPartageEtActionExclusive(id));
    }
}
