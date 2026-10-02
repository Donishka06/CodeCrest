package com.example.demo.service;

import com.example.demo.dto.AiDoubtRequestDto;
import com.example.demo.dto.AiDoubtResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiDoubtAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiDoubtAssistantService.class);
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AiDoubtAssistantService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public AiDoubtResponseDto answerDoubt(AiDoubtRequestDto req) {
        String doubt = req.getContestantDoubt() != null ? req.getContestantDoubt().trim() : "";
        String doubtType = req.getDoubtType() != null ? req.getDoubtType().toUpperCase() : "GENERAL";

        // Try Gemini API if key is present
        String apiKey = getGeminiApiKey();
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                AiDoubtResponseDto geminiResponse = callGeminiDoubtAssistant(apiKey, req);
                if (geminiResponse != null && geminiResponse.getReply() != null && !geminiResponse.getReply().trim().isEmpty()) {
                    return geminiResponse;
                }
            } catch (Exception e) {
                log.warn("Gemini Doubt API call failed, falling back to built-in doubt engine: {}", e.getMessage());
            }
        }

        // Built-in intelligent pedagogical tutor fallback
        return generateSynthesizedDoubtReply(req);
    }

    private String getGeminiApiKey() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        key = System.getProperty("gemini.api.key");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        return null;
    }

    private AiDoubtResponseDto callGeminiDoubtAssistant(String apiKey, AiDoubtRequestDto req) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        String systemPrompt = "You are the CodeCrest AI Doubt Assistant for an active competitive programming contest.\n" +
                "CRITICAL CONTEST INTEGRITY RULES:\n" +
                "1. DO NOT provide full solutions, working code, or direct answers under any circumstances.\n" +
                "2. Provide only hints, concept explanations, and error diagnosis to guide the contestant's thinking.\n" +
                "3. If the contestant asks for code or the complete solution, politely decline and provide a conceptual hint instead.\n" +
                "4. Keep responses concise, supportive, and pedagogical (under 160 words). Use markdown bullet points.\n\n" +
                "Contest Problem: " + (req.getProblemTitle() != null ? req.getProblemTitle() : "Algorithm Problem") + "\n" +
                "Problem Description: " + (req.getProblemDescription() != null ? req.getProblemDescription() : "") + "\n" +
                (req.getContestantCode() != null && !req.getContestantCode().trim().isEmpty() ? "Contestant Code:\n```" + req.getLanguage() + "\n" + req.getContestantCode() + "\n```\n" : "") +
                (req.getErrorDetails() != null && !req.getErrorDetails().trim().isEmpty() ? "Error/Failure Details: " + req.getErrorDetails() + "\n" : "") +
                "Contestant Question: " + req.getContestantDoubt() + "\n";

        Map<String, Object> part = Map.of("text", systemPrompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> payload = Map.of("contents", List.of(content));

        String requestJson = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(12))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode first = candidates.get(0);
                JsonNode parts = first.path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    String replyText = parts.get(0).path("text").asText("");
                    return new AiDoubtResponseDto(replyText, req.getDoubtType(), getSuggestedFollowUps(req));
                }
            }
        }
        return null;
    }

    private AiDoubtResponseDto generateSynthesizedDoubtReply(AiDoubtRequestDto req) {
        String doubt = (req.getContestantDoubt() != null ? req.getContestantDoubt().toLowerCase() : "");
        String title = req.getProblemTitle() != null ? req.getProblemTitle() : "Current Problem";
        String titleLower = title.toLowerCase();
        String error = req.getErrorDetails() != null ? req.getErrorDetails().toLowerCase() : "";

        // Check if user is attempting to cheat or ask for full solution
        if (doubt.contains("give me the code") || doubt.contains("give code") || doubt.contains("full solution") ||
                doubt.contains("write the answer") || doubt.contains("write code") || doubt.contains("solve this for me") ||
                doubt.contains("give me solution") || doubt.contains("direct code")) {
            String refusal = "🔒 **Contest Guardrail Notice**:\n\n" +
                    "During an active contest, CodeCrest strictly prevents sharing full implementations or direct solutions to uphold fair competition.\n\n" +
                    "💡 **Here is a conceptual clue to help you write the logic**:\n" +
                    getAlgorithmicClue(titleLower) + "\n\n" +
                    "Try implementing this step-by-step. Feel free to ask about any specific error or concept!";
            return new AiDoubtResponseDto(refusal, "GUARDRAIL", List.of("💡 Give me a smaller hint", "❓ Explain the core concept", "🔍 What edge cases should I check?"));
        }

        // Error Diagnosis Request
        if (!error.isEmpty() || doubt.contains("error") || doubt.contains("bug") || doubt.contains("failing") || doubt.contains("wrong answer") || doubt.contains("timeout") || doubt.contains("time limit")) {
            StringBuilder sb = new StringBuilder();
            sb.append("🐛 **Error Analysis & Debugging Guidance**:\n\n");
            if (error.contains("timeout") || error.contains("time limit") || doubt.contains("time limit") || doubt.contains("tle")) {
                sb.append("• **Time Limit Exceeded**: Your current approach likely has an asymptotic complexity higher than required (e.g. $O(n^2)$ instead of $O(n)$ or $O(n \\log n)$).\n");
                sb.append("• Consider pre-computing values with a Hash Map or using a Two Pointers / Binary Search approach to eliminate nested loops.\n");
            } else if (error.contains("wrong answer") || doubt.contains("wrong answer")) {
                sb.append("• **Wrong Output**: Check whether your logic handles:\n");
                sb.append("  - Off-by-one indices (e.g., `<` vs `<=` in loops).\n");
                sb.append("  - Empty or single-element inputs.\n");
                sb.append("  - Order of elements (some problems expect 0-based or sorted outputs).\n");
            } else {
                sb.append("• **Execution Diagnostics**: Verify that all accessed objects/indices are defined before reading properties.\n");
                sb.append("• Check that your function returns the value instead of printing with console.log / print.\n");
            }
            sb.append("\n💡 *Hint: Try tracing your code with a small test input on scratch paper!*");
            return new AiDoubtResponseDto(sb.toString(), "ERROR_EXPLANATION", List.of("🔍 What edge cases should I test?", "💡 Give me an approach hint"));
        }

        // Concept Explanation Request
        if (doubt.contains("concept") || doubt.contains("explain") || doubt.contains("what is") || doubt.contains("how does")) {
            String conceptReply = "🧠 **Core Concept Explanation for " + title + "**:\n\n" +
                    getConceptExplanation(titleLower) + "\n\n" +
                    "💡 *Takeaway*: Focus on maintaining the invariant as your loop iterates.";
            return new AiDoubtResponseDto(conceptReply, "CONCEPT", List.of("💡 Give me a hint on data structures", "🔍 What edge cases should I consider?"));
        }

        // Edge Cases Request
        if (doubt.contains("edge") || doubt.contains("corner") || doubt.contains("cases")) {
            String edgeReply = "🔍 **Critical Edge Cases to Test**:\n\n" +
                    "1. **Empty / Minimal Input**: Size $n = 0$ or $n = 1$.\n" +
                    "2. **Duplicates**: Arrays with repeating numbers or all identical elements.\n" +
                    "3. **Negative / Extreme Values**: Minimum and maximum possible integers defined in constraints.\n" +
                    "4. **No Feasible Answer**: How does your solution handle cases where no valid match or target exists?\n\n" +
                    "Ensure your base conditions handle these before the main iteration loop.";
            return new AiDoubtResponseDto(edgeReply, "EDGE_CASE", List.of("💡 Give me a hint on implementation", "❓ Explain the core concept"));
        }

        // General Hint (Default)
        String hintReply = "💡 **Hint for " + title + "**:\n\n" +
                getAlgorithmicClue(titleLower) + "\n\n" +
                "• Ask yourself: *Can I store visited states or elements to answer subsequent queries in $O(1)$ time?*\n" +
                "• Break the problem down: 1) Initialize state, 2) Loop invariant, 3) Return result.";
        return new AiDoubtResponseDto(hintReply, "HINT", List.of("❓ Explain the core concept", "🔍 What edge cases should I check?", "🐛 Help me debug my error"));
    }

    private String getAlgorithmicClue(String titleLower) {
        if (titleLower.contains("sum") || titleLower.contains("two sum")) {
            return "Consider using a Hash Map (lookup table). As you iterate through each number, compute `target - num`. Check if this complement was already recorded in your map!";
        } else if (titleLower.contains("anagram")) {
            return "Two words are anagrams if their sorted characters are identical, or if their character frequency distributions match. How can you use a sorted string or hash key to group them?";
        } else if (titleLower.contains("water") || titleLower.contains("container")) {
            return "Try a **Two Pointers** technique starting from the left and right extremes. At each step, compute the area and move the pointer pointing to the shorter boundary inward.";
        } else if (titleLower.contains("coin") || titleLower.contains("change")) {
            return "This can be modeled with **Dynamic Programming**. Let `dp[i]` represent the minimum coins to make amount `i`. For each coin `c`, `dp[i] = min(dp[i], dp[i - c] + 1)`.";
        } else if (titleLower.contains("island") || titleLower.contains("grid")) {
            return "Use a traversal like **Breadth-First Search (BFS)** or **Depth-First Search (DFS)**. When you encounter land (`'1'`), increment your counter and sink adjacent land cells by marking them visited (`'0'`).";
        } else if (titleLower.contains("search") || titleLower.contains("rotated")) {
            return "In a rotated sorted array, at least one half is always strictly sorted. Compare `mid` with `left` to decide which half is normal, then check if `target` falls within that range!";
        } else if (titleLower.contains("substring") || titleLower.contains("window")) {
            return "Use the **Sliding Window** pattern with a start and end pointer. Expand `end` while adding characters to a Set/Map, and shrink `start` whenever a duplicate or invalid condition arises.";
        } else {
            return "Analyze the constraints. If $n \\le 10^5$, an $O(n)$ or $O(n \\log n)$ approach is needed. Consider if sorting, hash sets, or two pointers can simplify your traversal.";
        }
    }

    private String getConceptExplanation(String titleLower) {
        if (titleLower.contains("sum")) {
            return "The fundamental concept is **Complement Lookup**: Instead of scanning with nested loops ($O(n^2)$), space-time tradeoff allows constant time $O(1)$ lookup using hash tables.";
        } else if (titleLower.contains("water") || titleLower.contains("two pointer")) {
            return "The **Two Pointers** pattern optimizes monotonic spaces. Moving the shorter line is optimal because keeping the shorter line while decreasing width cannot possibly increase area.";
        } else if (titleLower.contains("coin") || titleLower.contains("dp")) {
            return "**Dynamic Programming** solves problems with optimal substructure by building solutions to subproblems from the bottom up and caching results to prevent recalculation.";
        } else if (titleLower.contains("island")) {
            return "**Graph Connected Components**: A 2D grid is an undirected graph where cells are nodes and adjacent cells are edges. Traversing a component visits all connected lands.";
        } else {
            return "This problem tests optimal iteration strategy and data structure selection to balance time and space efficiency.";
        }
    }

    private List<String> getSuggestedFollowUps(AiDoubtRequestDto req) {
        return List.of("💡 Give me another hint", "❓ Explain the core concept", "🔍 What edge cases should I test?");
    }
}
