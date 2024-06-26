package com.eko.eko.money.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.eko.eko.config.JwtService;
import com.eko.eko.money.dto.CategoryRequest;
import com.eko.eko.money.dto.CategoryResponse;
import com.eko.eko.money.dto.ListCategoriesResponse;
import com.eko.eko.money.dto.ListCategoriesResponse.CategoryWithTransactionTimes;
import com.eko.eko.money.model.Category;
import com.eko.eko.money.model.Transaction;
import com.eko.eko.money.model.Wallet;
import com.eko.eko.money.repository.CategoryRepository;
import com.eko.eko.money.repository.TransactionRepository;
import com.eko.eko.money.repository.WalletRepository;
import com.eko.eko.user.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
        private final CategoryRepository categoryRepository;
        private final TransactionRepository transactionRepository;
        private final WalletRepository walletRepository;
        private final JwtService jwtService;

        public List<Transaction> getAllTransactionByWalletId(int walletId) {
                return transactionRepository.findAllByWalletIdReloadMoney(walletId);
        }

        public float reloadWalletMoneyLeft(int walletId) {
                List<Transaction> transactions = this.getAllTransactionByWalletId(walletId);
                float spend = 0;
                for (Transaction transaction : transactions) {
                        spend += transaction.getAmount();
                }
                return spend;
        }

        public ResponseEntity<ListCategoriesResponse> getAllCategories(HttpServletRequest request) {
                try {
                        String authHeader = request.getHeader("Authorization");
                        User user = jwtService.getUserFromAuthHeader(authHeader);
                        if (user == null) {
                                return new ResponseEntity<>(ListCategoriesResponse.builder().state(false)
                                                .message("Lỗi người dùng ; token hết hạn!!!").build(),
                                                HttpStatus.OK);
                        } else {
                                List<Category> categories = categoryRepository.findAllByUserId(user.getId());
                                List<CategoryWithTransactionTimes> transactionTimes = new ArrayList<>();
                                for (Category category : categories) {
                                        List<Transaction> transactions = transactionRepository
                                                        .findAllByCategoryId(category.getId());
                                        transactionTimes.add(CategoryWithTransactionTimes.builder().category(category)
                                                        .transactionTime(transactions.size()).build());
                                }
                                return new ResponseEntity<>(
                                                ListCategoriesResponse.builder()
                                                                .message("Lấy danh sách danh mục thành công!!!")
                                                                .state(true)
                                                                .categories(transactionTimes)
                                                                .build(),
                                                HttpStatus.OK);
                        }

                } catch (Exception e) {
                        return new ResponseEntity<>(
                                        ListCategoriesResponse.builder()
                                                        .message("Lỗi lấy danh sách danh mục!!!")
                                                        .state(false).build(),
                                        HttpStatus.OK);
                }
        }

        public ResponseEntity<CategoryResponse> createCategory(HttpServletRequest request,
                        CategoryRequest categoryRequest) {
                try {
                        String authHeader = request.getHeader("Authorization");
                        User user = jwtService.getUserFromAuthHeader(authHeader);
                        if (user == null) {
                                return new ResponseEntity<>(CategoryResponse.builder().state(false)
                                                .message("Lỗi người dùng ; token hết hạn!!!").build(),
                                                HttpStatus.OK);
                        }
                        Category category = Category.builder().content(categoryRequest.getContent())
                                        .iconUrl(categoryRequest.getIconUrl())
                                        .iconColor(categoryRequest.getIconColor())
                                        .isIncome(categoryRequest.isIncome())
                                        .user(user)
                                        .build();
                        categoryRepository.save(category);
                        return new ResponseEntity<>(CategoryResponse.builder()
                                        .categoryId(category.getId())
                                        .content(category.getContent())
                                        .iconColor(category.getIconColor())
                                        .iconUrl(category.getIconUrl())
                                        .isIncome(category.isIncome())
                                        .user(user)
                                        .state(true)
                                        .message("Tạo danh mục thành công").build(), HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>(
                                        CategoryResponse.builder()
                                                        .message("Lỗi tạo danh mục!!")
                                                        .state(false).build(),
                                        HttpStatus.OK);
                }
        }

        public ResponseEntity<CategoryResponse> updateCategory(HttpServletRequest request,
                        CategoryRequest categoryRequest) {
                try {
                        String authHeader = request.getHeader("Authorization");
                        User user = jwtService.getUserFromAuthHeader(authHeader);
                        if (user == null) {
                                return new ResponseEntity<>(CategoryResponse.builder().state(false)
                                                .message("Lỗi người dùng ; token hết hạn!!!").build(),
                                                HttpStatus.OK);
                        }
                        if (user.getId() != categoryRepository.findById(categoryRequest.getCategoryId()).orElseThrow()
                                        .getUser().getId()) {
                                return new ResponseEntity<>(CategoryResponse.builder().state(false)
                                                .message("Lỗi bảo mật!!!").build(), HttpStatus.OK);
                        }
                        Category category = categoryRepository.findById(categoryRequest.getCategoryId()).orElseThrow();
                        category.setContent(categoryRequest.getContent());
                        category.setIconColor(categoryRequest.getIconColor());
                        category.setIconUrl(categoryRequest.getIconUrl());
                        category.setIncome(categoryRequest.isIncome());
                        categoryRepository.save(category);
                        List<Wallet> wallets = walletRepository.findAllByUserId(user.getId());
                        for (Wallet wallet : wallets) {
                                wallet.setMoneyLeft(
                                                this.reloadWalletMoneyLeft(wallet.getId()) + wallet.getMoneyAtFirst());
                                walletRepository.save(wallet);
                        }
                        return new ResponseEntity<>(CategoryResponse.builder()
                                        .categoryId(category.getId())
                                        .content(category.getContent())
                                        .iconColor(category.getIconColor())
                                        .iconUrl(category.getIconUrl())
                                        .isIncome(category.isIncome())
                                        .user(category.getUser())
                                        .state(true)
                                        .message("Cập nhật danh mục thành công!!!").build(), HttpStatus.OK);
                } catch (Exception e) {
                        return new ResponseEntity<>(
                                        CategoryResponse.builder()
                                                        .message("Lỗi cập nhật danh mục!!!")
                                                        .state(false).build(),
                                        HttpStatus.OK);
                }
        }

        public ResponseEntity<CategoryResponse> deleteCategory(HttpServletRequest request, int categoryId) {
                try {
                        String authHeader = request.getHeader("Authorization");
                        User user = jwtService.getUserFromAuthHeader(authHeader);
                        if (user == null) {
                                return new ResponseEntity<>(CategoryResponse.builder().state(false)
                                                .message("Lỗi người dùng ; token hết hạn!!!").build(),
                                                HttpStatus.OK);
                        }
                        if (user.getId() != categoryRepository.findById(categoryId).orElseThrow().getUser().getId()) {
                                return new ResponseEntity<>(CategoryResponse.builder().state(false)
                                                .message("Lỗi bảo mật!!!").build(), HttpStatus.OK);
                        }
                        Category category = categoryRepository.findById(categoryId).orElseThrow();
                        categoryRepository.delete(category);
                        List<Wallet> wallets = walletRepository.findAllByUserId(user.getId());
                        for (Wallet wallet : wallets) {
                                wallet.setMoneyLeft(
                                                this.reloadWalletMoneyLeft(wallet.getId()) + wallet.getMoneyAtFirst());
                                walletRepository.save(wallet);
                        }
                        return new ResponseEntity<>(CategoryResponse.builder().state(true)
                                        .message("Xóa danh mục thành công!!!").build(), HttpStatus.OK);

                } catch (Exception e) {
                        return new ResponseEntity<>(
                                        CategoryResponse.builder()
                                                        .message("Lỗi xóa danh mục!!!")
                                                        .state(false).build(),
                                        HttpStatus.OK);
                }
        }

        public ResponseEntity<ListCategoriesResponse> getAllCategoriesByWalletId(HttpServletRequest request,
                        int walletId) {
                try {
                        String authHeader = request.getHeader("Authorization");
                        User user = jwtService.getUserFromAuthHeader(authHeader);
                        if (user == null) {
                                return new ResponseEntity<>(ListCategoriesResponse.builder().state(false)
                                                .message("Lỗi người dùng ; token hết hạn!!!").build(),
                                                HttpStatus.OK);
                        } else {
                                List<Category> categories = categoryRepository.findCategoriesByWalletId(walletId);
                                List<CategoryWithTransactionTimes> transactionTimes = new ArrayList<>();
                                for (Category category : categories) {
                                        List<Transaction> transactions = transactionRepository
                                                        .findAllByCategoryIdAndWalletId(category.getId(), walletId);
                                        transactionTimes.add(CategoryWithTransactionTimes.builder().category(category)
                                                        .transactionTime(transactions.size()).build());
                                }
                                return new ResponseEntity<>(
                                                ListCategoriesResponse.builder()
                                                                .message("Lấy danh sách danh mục theo ví thành công!!!")
                                                                .state(true)
                                                                .categories(transactionTimes)
                                                                .build(),
                                                HttpStatus.OK);
                        }

                } catch (Exception e) {
                        return new ResponseEntity<>(
                                        ListCategoriesResponse.builder()
                                                        .message("Lỗi lấy danh sách danh mục theo ví!!!")
                                                        .state(false).build(),
                                        HttpStatus.OK);
                }
        }

}
