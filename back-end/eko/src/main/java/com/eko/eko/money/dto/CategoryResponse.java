package com.eko.eko.money.dto;

import com.eko.eko.user.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    @JsonProperty("category_id")
    private int categoryId;
    @JsonProperty("content")
    private String content;
    @JsonProperty("icon_url")
    private String iconUrl;
    @JsonProperty("icon_color")
    private String iconColor;
    @JsonProperty("is_income")
    private boolean isIncome;
    @JsonProperty("user")
    private User user;
    @JsonProperty("message")
    private String message;
    @JsonProperty("state")
    private boolean state;
}
