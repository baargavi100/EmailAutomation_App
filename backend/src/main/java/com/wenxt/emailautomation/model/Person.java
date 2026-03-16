package com.wenxt.emailautomation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Person {

    private String name;
    private String email;
    private String provider;
    private String message;
    private String aiGenerated;
    private String schedule;
    private String status;
    private String sentTime;

}
