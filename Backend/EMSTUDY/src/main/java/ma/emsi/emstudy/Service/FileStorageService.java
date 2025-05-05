package ma.emsi.emstudy.Service;

import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import ma.emsi.emstudy.Entity.CourseMaterial;
import ma.emsi.emstudy.Exception.ResourceNotFoundException;
import ma.emsi.emstudy.Repository.CourseMaterialRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    private final CourseMaterialRepo courseMaterialRepo;

    public String storeFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
        Path targetLocation = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = getPath(fileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + fileName, e);
        }
    }

    public UrlResource loadFileAsResource(String fileName) {
        try {
            Path filePath = getPath(fileName);
            UrlResource  resource = new UrlResource(filePath.toUri());
            if(resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
    }

    private Path getPath(String fileName) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
    }

    public String getContentType(String fileName) {
        String contentType = null;
        try {
            contentType = Files.probeContentType(getPath(fileName));
        } catch (IOException ex) {
            System.out.println("Could not determine file type.");
        }
        return contentType != null ? contentType : "application/octet-stream";
    }

    public UrlResource downloadMaterial(Long materialId) {
        CourseMaterial material = courseMaterialRepo.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));

        String fileName = material.getUrl().substring(material.getUrl().lastIndexOf('/') + 1);
        return loadFileAsResource(fileName);
    }

    public String getMaterialContentType(Long materialId) {
        CourseMaterial material = courseMaterialRepo.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));

        String fileName = material.getUrl().substring(material.getUrl().lastIndexOf('/') + 1);
        return getContentType(fileName);
    }

}