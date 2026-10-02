package com.example.demo.service;

import com.example.demo.dto.AiGeneratedQuestionDto;
import com.example.demo.dto.AiQuestionGenerateRequestDto;
import com.fasterxml.jackson.core.type.TypeReference;
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
import java.util.*;

@Service
public class AiQuestionGenerationService {

    private static final Logger log = LoggerFactory.getLogger(AiQuestionGenerationService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public List<AiGeneratedQuestionDto> generateQuestions(AiQuestionGenerateRequestDto req) {
        String topic = req.getTopic() != null && !req.getTopic().trim().isEmpty() ? req.getTopic().trim() : "Algorithms & Data Structures";
        String language = req.getLanguage() != null && !req.getLanguage().trim().isEmpty() ? req.getLanguage().trim().toLowerCase() : "javascript";

        // Check if difficulty distribution (Easy, Medium, Hard) is specified
        boolean hasDistribution = req.getEasyCount() != null || req.getMediumCount() != null || req.getHardCount() != null;
        List<String> targetDifficulties = new ArrayList<>();

        if (hasDistribution) {
            int easy = req.getEasyCount() != null ? Math.max(0, req.getEasyCount()) : 0;
            int medium = req.getMediumCount() != null ? Math.max(0, req.getMediumCount()) : 0;
            int hard = req.getHardCount() != null ? Math.max(0, req.getHardCount()) : 0;

            for (int i = 0; i < easy; i++) targetDifficulties.add("EASY");
            for (int i = 0; i < medium; i++) targetDifficulties.add("MEDIUM");
            for (int i = 0; i < hard; i++) targetDifficulties.add("HARD");
        }

        // If no distribution provided or counts were 0, use single difficulty
        if (targetDifficulties.isEmpty()) {
            String difficulty = req.getDifficulty() != null ? req.getDifficulty().trim().toUpperCase() : "MEDIUM";
            if (!Arrays.asList("EASY", "MEDIUM", "HARD").contains(difficulty)) {
                difficulty = "MEDIUM";
            }
            int count = req.getNumberOfQuestions() != null && req.getNumberOfQuestions() > 0 ? Math.min(req.getNumberOfQuestions(), 5) : 2;
            for (int i = 0; i < count; i++) {
                targetDifficulties.add(difficulty);
            }
        }

        // Try Gemini API if key is available
        String apiKey = getGeminiApiKey();
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                List<AiGeneratedQuestionDto> fromGemini = generateWithGemini(apiKey, topic, targetDifficulties, language, req.getContestId());
                if (fromGemini != null && !fromGemini.isEmpty()) {
                    return fromGemini;
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to built-in algorithmic question generator: {}", e.getMessage());
            }
        }

        // Fallback to intelligent algorithmic problem synthesizer
        return generateAlgorithmicQuestions(topic, targetDifficulties, language, req.getContestId());
    }

    private String getGeminiApiKey() {
        String key = System.getenv("GEMINI_API_KEY");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        key = System.getProperty("gemini.api.key");
        if (key != null && !key.trim().isEmpty()) return key.trim();
        return null;
    }

    private List<AiGeneratedQuestionDto> generateWithGemini(String apiKey, String topic, List<String> targetDifficulties, String language, Long contestId) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
        int count = targetDifficulties.size();

        long easyCount = targetDifficulties.stream().filter("EASY"::equals).count();
        long medCount = targetDifficulties.stream().filter("MEDIUM"::equals).count();
        long hardCount = targetDifficulties.stream().filter("HARD"::equals).count();

        String prompt = "You are a world-class competitive programming problem setter like LeetCode. " +
                "Generate exactly " + count + " coding challenge question(s) for a programming contest.\n" +
                "Topic: " + topic + "\n" +
                "Target Programming Language: " + language + "\n" +
                "Required Difficulty Distribution:\n" +
                "- EASY questions: " + easyCount + "\n" +
                "- MEDIUM questions: " + medCount + "\n" +
                "- HARD questions: " + hardCount + "\n\n" +
                "Generate questions matching this exact count for each difficulty.\n\n" +
                "Return ONLY a valid JSON array containing " + count + " object(s). Do not wrap in markdown quotes if possible, or wrap in ```json.\n" +
                "Each object must have these exact keys:\n" +
                "- title: (String) concise descriptive problem title\n" +
                "- description: (String) detailed problem statement\n" +
                "- inputFormat: (String) specification of input parameters\n" +
                "- outputFormat: (String) specification of return type and value\n" +
                "- constraints: (String) time/space and parameter bounds (e.g. 1 <= n <= 10^5)\n" +
                "- sampleTestCases: (String) valid JSON string array of objects with [{\"input\": \"...\", \"expectedOutput\": \"...\", \"explanation\": \"...\"}]\n" +
                "- hiddenTestCases: (String) valid JSON string array of objects with [{\"input\": \"...\", \"expectedOutput\": \"...\"}]\n" +
                "- difficulty: (String) \"EASY\", \"MEDIUM\", or \"HARD\"\n" +
                "- basePoints: (Integer) 100 for EASY, 200 for MEDIUM, 300 for HARD\n" +
                "- timeLimitMs: 1000\n" +
                "- status: \"DRAFT\"\n";

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> payload = Map.of("contents", List.of(content));

        String requestJson = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini returned HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode rootNode = objectMapper.readTree(response.body());
        JsonNode candidates = rootNode.path("candidates");
        if (candidates.isEmpty()) {
            throw new RuntimeException("No candidates returned from Gemini");
        }

        String rawText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
        String jsonCleaned = cleanJsonString(rawText);

        List<AiGeneratedQuestionDto> dtos = objectMapper.readValue(jsonCleaned, new TypeReference<List<AiGeneratedQuestionDto>>() {});
        for (int i = 0; i < dtos.size(); i++) {
            AiGeneratedQuestionDto dto = dtos.get(i);
            String targetDiff = i < targetDifficulties.size() ? targetDifficulties.get(i) : "MEDIUM";
            if (dto.getDifficulty() == null || !Arrays.asList("EASY", "MEDIUM", "HARD").contains(dto.getDifficulty().toUpperCase())) {
                dto.setDifficulty(targetDiff);
            } else {
                dto.setDifficulty(dto.getDifficulty().toUpperCase());
            }
            dto.setTopic(topic);
            dto.setContestId(contestId);
            dto.setStatus("DRAFT");
            if (dto.getBasePoints() == null || dto.getBasePoints() <= 0) {
                dto.setBasePoints(dto.getDifficulty().equals("EASY") ? 100 : dto.getDifficulty().equals("MEDIUM") ? 200 : 300);
            }
            if (dto.getTimeLimitMs() == null) {
                dto.setTimeLimitMs(1000);
            }
        }
        return dtos;
    }

    private String cleanJsonString(String text) {
        if (text == null) return "[]";
        text = text.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }

    /**
     * Built-in algorithmic generator supporting specific difficulty distributions.
     */
    public List<AiGeneratedQuestionDto> generateAlgorithmicQuestions(String topic, List<String> targetDifficulties, String language, Long contestId) {
        List<ProblemTemplate> catalog = getCuratedCatalog();
        String topicLower = topic.toLowerCase();
        Set<String> usedTitles = new HashSet<>();
        List<AiGeneratedQuestionDto> result = new ArrayList<>();

        for (int i = 0; i < targetDifficulties.size(); i++) {
            String reqDiff = targetDifficulties.get(i);
            ProblemTemplate match = null;

            // 1. Try matching topic and difficulty where not already used
            for (ProblemTemplate pt : catalog) {
                if (pt.difficulty.equalsIgnoreCase(reqDiff) && !usedTitles.contains(pt.title) &&
                        (pt.topic.toLowerCase().contains(topicLower) || topicLower.contains(pt.topic.toLowerCase()))) {
                    match = pt;
                    break;
                }
            }

            // 2. Try matching difficulty only where not already used
            if (match == null) {
                for (ProblemTemplate pt : catalog) {
                    if (pt.difficulty.equalsIgnoreCase(reqDiff) && !usedTitles.contains(pt.title)) {
                        match = pt;
                        break;
                    }
                }
            }

            if (match != null) {
                usedTitles.add(match.title);
                AiGeneratedQuestionDto dto = new AiGeneratedQuestionDto();
                dto.setTitle(match.title);
                dto.setDescription(match.description);
                dto.setInputFormat(match.inputFormat);
                dto.setOutputFormat(match.outputFormat);
                dto.setConstraints(match.constraints);
                dto.setSampleTestCases(match.sampleTestCases);
                dto.setHiddenTestCases(match.hiddenTestCases);
                dto.setDifficulty(reqDiff);
                dto.setBasePoints(reqDiff.equals("EASY") ? 100 : reqDiff.equals("MEDIUM") ? 200 : 300);
                dto.setTimeLimitMs(1000);
                dto.setStatus("DRAFT");
                dto.setTopic(topic);
                dto.setContestId(contestId);
                result.add(dto);
            } else {
                // 3. Synthesize a parametric problem for this specific difficulty
                int num = result.size() + 1;
                AiGeneratedQuestionDto extra = new AiGeneratedQuestionDto();
                String diffTitle = Character.toUpperCase(reqDiff.charAt(0)) + reqDiff.substring(1).toLowerCase();
                extra.setTitle(topic + " " + diffTitle + " Challenge " + num);
                extra.setDescription("Given an array of integers `nums` and a threshold integer `k`, solve the " + reqDiff.toLowerCase() + "-level " + topic + " challenge to find the optimal result.");
                extra.setInputFormat("An array of integers `nums`, and an integer `k`.");
                extra.setOutputFormat("An integer representing the target value.");
                extra.setConstraints("• 1 <= nums.length <= 10^5\n• -10^4 <= nums[i] <= 10^4\n• 1 <= k <= 10^5");
                extra.setSampleTestCases("[\n  {\"input\": \"[1, 2, 3, 4], 3\", \"expectedOutput\": \"3\", \"explanation\": \"The longest valid sequence matching the criterion has length 3.\"}\n]");
                extra.setHiddenTestCases("[\n  {\"input\": \"[1, 2, 3, 4], 3\", \"expectedOutput\": \"3\"},\n  {\"input\": \"[5, 10, 15], 10\", \"expectedOutput\": \"2\"}\n]");
                extra.setDifficulty(reqDiff);
                extra.setBasePoints(reqDiff.equals("EASY") ? 100 : reqDiff.equals("MEDIUM") ? 200 : 300);
                extra.setTimeLimitMs(1000);
                extra.setStatus("DRAFT");
                extra.setTopic(topic);
                extra.setContestId(contestId);
                result.add(extra);
            }
        }

        return result;
    }

    /**
     * Backward-compatible algorithmic generator for single difficulty requests.
     */
    public List<AiGeneratedQuestionDto> generateAlgorithmicQuestions(String topic, String difficulty, int count, String language, Long contestId) {
        List<String> targetDifficulties = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            targetDifficulties.add(difficulty != null ? difficulty.toUpperCase() : "MEDIUM");
        }
        return generateAlgorithmicQuestions(topic, targetDifficulties, language, contestId);
    }

    private static class ProblemTemplate {
        String topic;
        String difficulty;
        String title;
        String description;
        String inputFormat;
        String outputFormat;
        String constraints;
        String sampleTestCases;
        String hiddenTestCases;

        ProblemTemplate(String topic, String difficulty, String title, String description,
                        String inputFormat, String outputFormat, String constraints,
                        String sampleTestCases, String hiddenTestCases) {
            this.topic = topic;
            this.difficulty = difficulty;
            this.title = title;
            this.description = description;
            this.inputFormat = inputFormat;
            this.outputFormat = outputFormat;
            this.constraints = constraints;
            this.sampleTestCases = sampleTestCases;
            this.hiddenTestCases = hiddenTestCases;
        }
    }

    private List<ProblemTemplate> getCuratedCatalog() {
        List<ProblemTemplate> list = new ArrayList<>();

        // Dynamic Programming - Easy
        list.add(new ProblemTemplate(
                "Dynamic Programming", "EASY", "Climbing Stairs",
                "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
                "A single integer `n`.",
                "An integer representing the total number of distinct ways.",
                "• 1 <= n <= 45",
                "[\n  {\"input\": \"2\", \"expectedOutput\": \"2\", \"explanation\": \"There are two ways to climb to the top: 1 step + 1 step, or 2 steps.\"},\n  {\"input\": \"3\", \"expectedOutput\": \"3\", \"explanation\": \"There are three ways: 1+1+1, 1+2, or 2+1.\"}\n]",
                "[\n  {\"input\": \"2\", \"expectedOutput\": \"2\"},\n  {\"input\": \"3\", \"expectedOutput\": \"3\"},\n  {\"input\": \"4\", \"expectedOutput\": \"5\"},\n  {\"input\": \"5\", \"expectedOutput\": \"8\"},\n  {\"input\": \"10\", \"expectedOutput\": \"89\"}\n]"
        ));

        // Dynamic Programming - Medium
        list.add(new ProblemTemplate(
                "Dynamic Programming", "MEDIUM", "Coin Change",
                "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.",
                "An array of integers `coins`, and an integer `amount`.",
                "An integer representing the fewest number of coins, or -1.",
                "• 1 <= coins.length <= 12\n• 1 <= coins[i] <= 2^31 - 1\n• 0 <= amount <= 10^4",
                "[\n  {\"input\": \"[1, 2, 5], 11\", \"expectedOutput\": \"3\", \"explanation\": \"11 = 5 + 5 + 1 (3 coins).\"},\n  {\"input\": \"[2], 3\", \"expectedOutput\": \"-1\", \"explanation\": \"The amount 3 cannot be formed using only coin 2.\"}\n]",
                "[\n  {\"input\": \"[1, 2, 5], 11\", \"expectedOutput\": \"3\"},\n  {\"input\": \"[2], 3\", \"expectedOutput\": \"-1\"},\n  {\"input\": \"[1], 0\", \"expectedOutput\": \"0\"},\n  {\"input\": \"[1, 5, 10, 25], 30\", \"expectedOutput\": \"2\"}\n]"
        ));

        // Dynamic Programming - Hard
        list.add(new ProblemTemplate(
                "Dynamic Programming", "HARD", "Edit Distance",
                "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.",
                "Two strings `word1` and `word2`.",
                "An integer representing the minimum edit operations.",
                "• 0 <= word1.length, word2.length <= 500\n• word1 and word2 consist of lowercase English letters.",
                "[\n  {\"input\": \"\\\"horse\\\", \\\"ros\\\"\", \"expectedOutput\": \"3\", \"explanation\": \"horse -> rorse (replace 'h' with 'r') -> rose (remove 'r') -> ros (remove 'e').\"}\n]",
                "[\n  {\"input\": \"\\\"horse\\\", \\\"ros\\\"\", \"expectedOutput\": \"3\"},\n  {\"input\": \"\\\"intention\\\", \\\"execution\\\"\", \"expectedOutput\": \"5\"},\n  {\"input\": \"\\\"\\\", \\\"a\\\"\", \"expectedOutput\": \"1\"}\n]"
        ));

        // Graph Theory - Medium
        list.add(new ProblemTemplate(
                "Graphs", "MEDIUM", "Number of Islands",
                "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
                "A 2D array of strings or integers representing the grid.",
                "An integer representing the total number of connected islands.",
                "• m == grid.length\n• n == grid[i].length\n• 1 <= m, n <= 300\n• grid[i][j] is '0' or '1'.",
                "[\n  {\"input\": \"[[\\\"1\\\",\\\"1\\\",\\\"0\\\"],[\\\"1\\\",\\\"0\\\",\\\"0\\\"],[\\\"0\\\",\\\"0\\\",\\\"1\\\"]]\", \"expectedOutput\": \"2\", \"explanation\": \"Top-left group forms 1 island and bottom-right forms another island.\"}\n]",
                "[\n  {\"input\": \"[[\\\"1\\\",\\\"1\\\",\\\"0\\\"],[\\\"1\\\",\\\"0\\\",\\\"0\\\"],[\\\"0\\\",\\\"0\\\",\\\"1\\\"]]\", \"expectedOutput\": \"2\"},\n  {\"input\": \"[[\\\"1\\\",\\\"1\\\",\\\"1\\\"],[\\\"0\\\",\\\"1\\\",\\\"0\\\"],[\\\"1\\\",\\\"1\\\",\\\"1\\\"]]\", \"expectedOutput\": \"1\"}\n]"
        ));

        // Binary Search - Easy
        list.add(new ProblemTemplate(
                "Binary Search", "EASY", "Binary Search",
                "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`. You must write an algorithm with `O(log n)` runtime complexity.",
                "An array of sorted integers `nums`, and an integer `target`.",
                "An integer representing the 0-based index of target, or -1.",
                "• 1 <= nums.length <= 10^4\n• -10^4 < nums[i], target < 10^4\n• All elements in nums are unique.\n• nums is sorted in ascending order.",
                "[\n  {\"input\": \"[-1, 0, 3, 5, 9, 12], 9\", \"expectedOutput\": \"4\", \"explanation\": \"9 exists in nums and its index is 4.\"},\n  {\"input\": \"[-1, 0, 3, 5, 9, 12], 2\", \"expectedOutput\": \"-1\", \"explanation\": \"2 does not exist in nums so return -1.\"}\n]",
                "[\n  {\"input\": \"[-1, 0, 3, 5, 9, 12], 9\", \"expectedOutput\": \"4\"},\n  {\"input\": \"[-1, 0, 3, 5, 9, 12], 2\", \"expectedOutput\": \"-1\"},\n  {\"input\": \"[5], 5\", \"expectedOutput\": \"0\"},\n  {\"input\": \"[2, 5], 0\", \"expectedOutput\": \"-1\"}\n]"
        ));

        // Binary Search - Medium
        list.add(new ProblemTemplate(
                "Binary Search", "MEDIUM", "Search in Rotated Sorted Array",
                "There is an integer array `nums` sorted in ascending order with distinct values. Prior to being passed to your function, `nums` is possibly rotated at an unknown pivot index. Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.",
                "An array of integers `nums`, and an integer `target`.",
                "An integer representing the index of target, or -1.",
                "• 1 <= nums.length <= 5000\n• -10^4 <= nums[i] <= 10^4\n• All values of nums are unique.\n• nums is an ascending array that is possibly rotated.\n• Time complexity must be O(log n).",
                "[\n  {\"input\": \"[4, 5, 6, 7, 0, 1, 2], 0\", \"expectedOutput\": \"4\", \"explanation\": \"0 is found at index 4.\"},\n  {\"input\": \"[4, 5, 6, 7, 0, 1, 2], 3\", \"expectedOutput\": \"-1\", \"explanation\": \"3 does not exist in nums.\"}\n]",
                "[\n  {\"input\": \"[4, 5, 6, 7, 0, 1, 2], 0\", \"expectedOutput\": \"4\"},\n  {\"input\": \"[4, 5, 6, 7, 0, 1, 2], 3\", \"expectedOutput\": \"-1\"},\n  {\"input\": \"[1], 0\", \"expectedOutput\": \"-1\"},\n  {\"input\": \"[3, 1], 1\", \"expectedOutput\": \"1\"}\n]"
        ));

        // Sliding Window - Medium
        list.add(new ProblemTemplate(
                "Sliding Window", "MEDIUM", "Longest Substring Without Repeating Characters",
                "Given a string `s`, find the length of the longest substring without duplicate characters.",
                "A string `s`.",
                "An integer representing the length of the longest substring without repeating characters.",
                "• 0 <= s.length <= 5 * 10^4\n• s consists of English letters, digits, symbols, and spaces.",
                "[\n  {\"input\": \"\\\"abcabcbb\\\"\", \"expectedOutput\": \"3\", \"explanation\": \"The answer is 'abc', with the length of 3.\"},\n  {\"input\": \"\\\"bbbbb\\\"\", \"expectedOutput\": \"1\", \"explanation\": \"The answer is 'b', with the length of 1.\"}\n]",
                "[\n  {\"input\": \"\\\"abcabcbb\\\"\", \"expectedOutput\": \"3\"},\n  {\"input\": \"\\\"bbbbb\\\"\", \"expectedOutput\": \"1\"},\n  {\"input\": \"\\\"pwwkew\\\"\", \"expectedOutput\": \"3\"},\n  {\"input\": \"\\\"\\\"\", \"expectedOutput\": \"0\"}\n]"
        ));

        // Two Pointers - Medium
        list.add(new ProblemTemplate(
                "Two Pointers", "MEDIUM", "Container With Most Water",
                "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
                "An array of integers `height`.",
                "An integer representing the maximum area of water.",
                "• n == height.length\n• 2 <= n <= 10^5\n• 0 <= height[i] <= 10^4",
                "[\n  {\"input\": \"[1, 8, 6, 2, 5, 4, 8, 3, 7]\", \"expectedOutput\": \"49\", \"explanation\": \"Lines at index 1 (height 8) and index 8 (height 7) hold area 7 * (8 - 1) = 49.\"}\n]",
                "[\n  {\"input\": \"[1, 8, 6, 2, 5, 4, 8, 3, 7]\", \"expectedOutput\": \"49\"},\n  {\"input\": \"[1, 1]\", \"expectedOutput\": \"1\"},\n  {\"input\": \"[4, 3, 2, 1, 4]\", \"expectedOutput\": \"16\"}\n]"
        ));

        // Arrays & Hashing - Easy
        list.add(new ProblemTemplate(
                "Arrays & Hashing", "EASY", "Contains Duplicate",
                "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
                "An array of integers `nums`.",
                "Boolean `true` or `false`.",
                "• 1 <= nums.length <= 10^5\n• -10^9 <= nums[i] <= 10^9",
                "[\n  {\"input\": \"[1, 2, 3, 1]\", \"expectedOutput\": \"true\", \"explanation\": \"1 appears at index 0 and 3.\"},\n  {\"input\": \"[1, 2, 3, 4]\", \"expectedOutput\": \"false\", \"explanation\": \"All elements are distinct.\"}\n]",
                "[\n  {\"input\": \"[1, 2, 3, 1]\", \"expectedOutput\": \"true\"},\n  {\"input\": \"[1, 2, 3, 4]\", \"expectedOutput\": \"false\"},\n  {\"input\": \"[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]\", \"expectedOutput\": \"true\"}\n]"
        ));

        // Arrays & Hashing - Medium
        list.add(new ProblemTemplate(
                "Arrays & Hashing", "MEDIUM", "Group Anagrams",
                "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.",
                "An array of strings `strs`.",
                "A 2D array of strings grouping anagrams together.",
                "• 1 <= strs.length <= 10^4\n• 0 <= strs[i].length <= 100\n• strs[i] consists of lowercase English letters.",
                "[\n  {\"input\": \"[\\\"eat\\\", \\\"tea\\\", \\\"tan\\\", \\\"ate\\\", \\\"nat\\\", \\\"bat\\\"]\", \"expectedOutput\": \"[[\\\"bat\\\"],[\\\"nat\\\",\\\"tan\\\"],[\\\"ate\\\",\\\"eat\\\",\\\"tea\\\"]]\", \"explanation\": \"Strings with identical character counts are grouped together.\"}\n]",
                "[\n  {\"input\": \"[\\\"eat\\\", \\\"tea\\\", \\\"tan\\\", \\\"ate\\\", \\\"nat\\\", \\\"bat\\\"]\", \"expectedOutput\": \"[[\\\"bat\\\"],[\\\"nat\\\",\\\"tan\\\"],[\\\"ate\\\",\\\"eat\\\",\\\"tea\\\"]]\"},\n  {\"input\": \"[\\\"\\\", \\\"\\\"]\", \"expectedOutput\": \"[[\\\"\\\",\\\"\\\"]]\"}\n]"
        ));

        // Arrays & Hashing - Easy
        list.add(new ProblemTemplate(
                "Arrays & Hashing", "EASY", "Two Sum",
                "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
                "An array of integers `nums`, and an integer `target`.",
                "An array of two integers representing indices.",
                "• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.",
                "[\n  {\"input\": \"[2, 7, 11, 15], 9\", \"expectedOutput\": \"[0, 1]\", \"explanation\": \"nums[0] + nums[1] == 9, so return [0, 1].\"},\n  {\"input\": \"[3, 2, 4], 6\", \"expectedOutput\": \"[1, 2]\", \"explanation\": \"nums[1] + nums[2] == 6, so return [1, 2].\"}\n]",
                "[\n  {\"input\": \"[2, 7, 11, 15], 9\", \"expectedOutput\": \"[0, 1]\"},\n  {\"input\": \"[3, 2, 4], 6\", \"expectedOutput\": \"[1, 2]\"},\n  {\"input\": \"[3, 3], 6\", \"expectedOutput\": \"[0, 1]\"}\n]"
        ));

        // Arrays & Hashing - Hard
        list.add(new ProblemTemplate(
                "Arrays & Hashing", "HARD", "First Missing Positive",
                "Given an unsorted integer array `nums`. Return the smallest positive integer that is not present in `nums`. You must implement an algorithm that runs in `O(n)` time and uses `O(1)` auxiliary space.",
                "An array of integers `nums`.",
                "An integer representing the smallest missing positive number.",
                "• 1 <= nums.length <= 10^5\n• -2^31 <= nums[i] <= 2^31 - 1",
                "[\n  {\"input\": \"[1, 2, 0]\", \"expectedOutput\": \"3\", \"explanation\": \"The numbers in the range [1,2] are all in the array, so the smallest missing positive is 3.\"},\n  {\"input\": \"[3, 4, -1, 1]\", \"expectedOutput\": \"2\", \"explanation\": \"1 is in the array, but 2 is missing.\"}\n]",
                "[\n  {\"input\": \"[1, 2, 0]\", \"expectedOutput\": \"3\"},\n  {\"input\": \"[3, 4, -1, 1]\", \"expectedOutput\": \"2\"},\n  {\"input\": \"[7, 8, 9, 11, 12]\", \"expectedOutput\": \"1\"}\n]"
        ));

        // Two Pointers - Easy
        list.add(new ProblemTemplate(
                "Two Pointers", "EASY", "Valid Palindrome",
                "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
                "A string `s`.",
                "Boolean `true` or `false`.",
                "• 1 <= s.length <= 2 * 10^5\n• `s` consists only of printable ASCII characters.",
                "[\n  {\"input\": \"\\\"A man, a plan, a canal: Panama\\\"\", \"expectedOutput\": \"true\", \"explanation\": \"'amanaplanacanalpanama' is a palindrome.\"},\n  {\"input\": \"\\\"race a car\\\"\", \"expectedOutput\": \"false\", \"explanation\": \"'raceacar' is not a palindrome.\"}\n]",
                "[\n  {\"input\": \"\\\"A man, a plan, a canal: Panama\\\"\", \"expectedOutput\": \"true\"},\n  {\"input\": \"\\\"race a car\\\"\", \"expectedOutput\": \"false\"},\n  {\"input\": \"\\\" \\\"\", \"expectedOutput\": \"true\"}\n]"
        ));

        // Two Pointers - Hard
        list.add(new ProblemTemplate(
                "Two Pointers", "HARD", "Trapping Rain Water",
                "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
                "An array of non-negative integers `height`.",
                "An integer representing the total trapped rainwater units.",
                "• n == height.length\n• 1 <= n <= 2 * 10^4\n• 0 <= height[i] <= 10^5",
                "[\n  {\"input\": \"[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\", \"expectedOutput\": \"6\", \"explanation\": \"The elevation map can hold 6 units of rainwater.\"},\n  {\"input\": \"[4, 2, 0, 3, 2, 5]\", \"expectedOutput\": \"9\", \"explanation\": \"The elevation map can hold 9 units of rainwater.\"}\n]",
                "[\n  {\"input\": \"[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]\", \"expectedOutput\": \"6\"},\n  {\"input\": \"[4, 2, 0, 3, 2, 5]\", \"expectedOutput\": \"9\"}\n]"
        ));

        // Trees & Graphs - Easy
        list.add(new ProblemTemplate(
                "Trees & Graphs", "EASY", "Maximum Depth of Binary Tree",
                "Given the root of a binary tree in serialized level-order form, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
                "An array of serialized tree nodes.",
                "An integer representing the maximum tree depth.",
                "• The number of nodes in the tree is in the range [0, 10^4].\n• -100 <= Node.val <= 100",
                "[\n  {\"input\": \"[3, 9, 20, null, null, 15, 7]\", \"expectedOutput\": \"3\", \"explanation\": \"The maximum depth is 3.\"},\n  {\"input\": \"[1, null, 2]\", \"expectedOutput\": \"2\", \"explanation\": \"The maximum depth is 2.\"}\n]",
                "[\n  {\"input\": \"[3, 9, 20, null, null, 15, 7]\", \"expectedOutput\": \"3\"},\n  {\"input\": \"[1, null, 2]\", \"expectedOutput\": \"2\"},\n  {\"input\": \"[]\", \"expectedOutput\": \"0\"}\n]"
        ));

        // Trees & Graphs - Hard
        list.add(new ProblemTemplate(
                "Trees & Graphs", "HARD", "Word Ladder",
                "A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that every adjacent pair of words differs by a single letter, and each `si` is in `wordList`. Return the number of words in the shortest transformation sequence from `beginWord` to `endWord`, or 0 if no such sequence exists.",
                "Two strings `beginWord` and `endWord`, and a list of strings `wordList`.",
                "An integer representing sequence length, or 0.",
                "• 1 <= beginWord.length <= 10\n• endWord.length == beginWord.length\n• 1 <= wordList.length <= 5000",
                "[\n  {\"input\": \"\\\"hit\\\", \\\"cog\\\", [\\\"hot\\\",\\\"dot\\\",\\\"dog\\\",\\\"lot\\\",\\\"log\\\",\\\"cog\\\"]\", \"expectedOutput\": \"5\", \"explanation\": \"'hit' -> 'hot' -> 'dot' -> 'dog' -> 'cog' (5 words).\"}\n]",
                "[\n  {\"input\": \"\\\"hit\\\", \\\"cog\\\", [\\\"hot\\\",\\\"dot\\\",\\\"dog\\\",\\\"lot\\\",\\\"log\\\",\\\"cog\\\"]\", \"expectedOutput\": \"5\"},\n  {\"input\": \"\\\"hit\\\", \\\"cog\\\", [\\\"hot\\\",\\\"dot\\\",\\\"dog\\\",\\\"lot\\\",\\\"log\\\"]\", \"expectedOutput\": \"0\"}\n]"
        ));

        return list;
    }
}
