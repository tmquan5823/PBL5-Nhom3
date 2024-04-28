package com.eko.eko.user.rest;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    public final UserService service;

    @GetMapping("/user/{id}")
    public UserProfileRespone getProfile(@PathVariable Integer id, HttpServletRequest request) {
        return service.getProfileById(id, request);
    }

    @PutMapping("/user")
    public UserProfileRespone getProfile(@RequestBody UserRequest requestUser, HttpServletRequest request) {
        return service.updateProfile(requestUser, request);
    }

    @PutMapping("/user/avatar")
    public ResponseEntity<Map<String, String>> updateAvatar(
            @RequestParam("user_id") String id,
            @RequestParam("image") MultipartFile image,
            HttpServletRequest request) throws IOException {
        System.out.println("HELLO");
        return service.updateAvatar(Integer.parseInt(id), image, request);
    }

    @DeleteMapping("/user/avatar/{id}")
    public ResponseEntity<Map<String, String>> deleteAvatar(@PathVariable Integer id, HttpServletRequest request)
            throws IOException {
        return service.deleteAvatar(id, request);
    }

    @PutMapping("/user/password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest requestUser,
            HttpServletRequest request) {
        return service.changePassword(requestUser, request);
    }
}