package ma.project.sgpbse.test;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entites-a")
@RequiredArgsConstructor
public class AController {

    @Autowired
    private AService aService;

    @GetMapping("/nb")
    public Long nb(){
        return aService.getNm();
    }
}
