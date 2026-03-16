package com.wenxt.emailautomation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {

    private String name;
    private String email;
    private String provider; // "Gmail" or "Outlook"
    private String message; // Short message (AI will expand)
    private String schedule; // "0" / "180" / "3600" / "86400" seconds

}
