package ma.project.sgpbse.test;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/entites-b")
@RequiredArgsConstructor
public class BController {

    private final BService bService;

    @PostMapping
    public ResponseEntity<BResponseDto> creer(@RequestBody @Valid CreateBDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bService.creerB(dto));
    }

    @PostMapping("/{id}/traiter")
    public ResponseEntity<BResponseDto> traiter(@PathVariable Long id) {
        return ResponseEntity.ok(bService.traiterPartageEtActionExclusive(id));
    }
}
