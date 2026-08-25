package ma.project.sgpbse.controller.asset;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.project.sgpbse.dto.asset.request.DocumentRequestDto;
import ma.project.sgpbse.dto.asset.response.DocumentResponseDto;
import ma.project.sgpbse.entity.asset.Document;
import ma.project.sgpbse.mapper.asset.DocumentMapper;
import ma.project.sgpbse.service.asset.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/sgpbse")
@RequiredArgsConstructor
public class DocumentController {

}
