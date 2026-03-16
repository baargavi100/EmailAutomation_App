package com.wenxt.emailautomation.controller;

import com.wenxt.emailautomation.model.ApiResponse;
import com.wenxt.emailautomation.model.EmailRequest;
import com.wenxt.emailautomation.model.Person;
import com.wenxt.emailautomation.service.EmailService;
import com.wenxt.emailautomation.service.GoogleSheetsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EmailController {

    private final EmailService emailService;
    private final GoogleSheetsService sheetsService;

    public EmailController(EmailService emailService, GoogleSheetsService sheetsService) {
        this.emailService = emailService;
        this.sheetsService = sheetsService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/health
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.ok("Spring Boot is running — WENXT Email Automation", "OK");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/search?query=xxx
    // Detects @ for email search, otherwise searches by name
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/search")
    public ApiResponse<List<Person>> search(@RequestParam(value = "query", defaultValue = "") String query) {
        try {
            List<Person> results = sheetsService.searchPersons(query.trim());
            if (results.isEmpty()) {
                return ApiResponse.error("No person found for: " + query);
            }
            return ApiResponse.ok("Found " + results.size() + " result(s)", results);
        } catch (Exception e) {
            return ApiResponse.error("Search failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/send
    // Trigger n8n webhook to send email (n8n auto-adds person if not found)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/send")
    public ApiResponse<String> send(@RequestBody EmailRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ApiResponse.error("Email is required");
            }
            if (request.getMessage() == null || request.getMessage().isBlank()) {
                return ApiResponse.error("Message is required");
            }
            String result = emailService.sendEmail(request);
            return ApiResponse.ok("Email request sent to n8n", result);
        } catch (Exception e) {
            return ApiResponse.error("Send failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/add
    // Add a new person directly to Google Sheets
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/add")
    public ApiResponse<String> add(@RequestBody Person person) {
        try {
            if (person.getEmail() == null || person.getEmail().isBlank()) {
                return ApiResponse.error("Email is required");
            }
            sheetsService.addPerson(person);
            return ApiResponse.ok("Person added to Google Sheets", person.getEmail());
        } catch (Exception e) {
            return ApiResponse.error("Add failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/add-and-send
    // Add person to sheet AND send email via n8n in one call
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/add-and-send")
    public ApiResponse<String> addAndSend(@RequestBody EmailRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ApiResponse.error("Email is required");
            }
            // n8n workflow automatically handles adding if person not found
            String result = emailService.addAndSend(request);
            return ApiResponse.ok("Person added and email sent via n8n", result);
        } catch (Exception e) {
            return ApiResponse.error("Add-and-send failed: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/logs
    // Return all email records from Google Sheets
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/logs")
    public ApiResponse<List<Person>> logs() {
        try {
            List<Person> all = sheetsService.getAllPersons();
            return ApiResponse.ok("Fetched " + all.size() + " record(s)", all);
        } catch (Exception e) {
            return ApiResponse.error("Could not fetch logs: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/stats
    // Return count of Queue / Sent / Viewed
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> stats() {
        try {
            Map<String, Long> stats = sheetsService.getStats();
            return ApiResponse.ok("Stats fetched", stats);
        } catch (Exception e) {
            return ApiResponse.error("Could not fetch stats: " + e.getMessage());
        }
    }

}
