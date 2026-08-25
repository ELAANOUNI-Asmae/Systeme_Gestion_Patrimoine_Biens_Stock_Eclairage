package ma.project.sgpbse.test;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AService {

    @Autowired
    private ARepository aRepository;

    @Transactional
    public Long getNm(){
        return aRepository.count();
    }
}
