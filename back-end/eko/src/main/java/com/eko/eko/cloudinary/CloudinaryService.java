package com.eko.eko.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    public void deleteImageByUrl(String imageUrl) throws IOException {
        String publicId = extractPublicId(imageUrl);
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    private String extractPublicId(String imageUrl) {
        int startIndex = imageUrl.lastIndexOf("/") + 1;
        int endIndex = imageUrl.lastIndexOf(".");
        return imageUrl.substring(startIndex, endIndex);
    }

    public String uploadImage(MultipartFile image) throws IOException {
        // Thực hiện upload ảnh lên Cloudinary
        Map<?, ?> result = cloudinary.uploader().upload(image.getBytes(), null);
        // Trích xuất URL của ảnh từ kết quả upload
        String imageUrl = (String) result.get("secure_url");
        // Trả về URL của ảnh đã upload
        return imageUrl;
    }

    public String generateImageUrl(String publicId) {
        return String.format("https://res.cloudinary.com/%s/image/upload/%s", cloudName, publicId);
    }
}
